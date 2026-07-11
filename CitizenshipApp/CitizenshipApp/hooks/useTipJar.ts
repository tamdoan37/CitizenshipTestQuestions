import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { persistSupporterFlag } from "@/services/supporter";
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  flushFailedPurchasesCachedAsPendingAndroid,
  type Product,
  type Purchase,
  type PurchaseError,
  type EmitterSubscription,
} from "react-native-iap";

// ── Consumable product catalog ──────────────────────────────────────
export const TIP_PRODUCT_IDS = [
  "org.citizenship.tip.espresso",
  "org.citizenship.tip.cappuccino",
  "org.citizenship.tip.wholebeans",
] as const;

export type TipProductId = (typeof TIP_PRODUCT_IDS)[number];

export interface TipTier {
  id: TipProductId;
  title: string;
  description: string;
  icon: "cafe" | "cafe-outline" | "nutrition";
  fallbackPrice: string;
}

/** Presentation metadata; the *authoritative* price comes from the store. */
export const TIP_TIERS: TipTier[] = [
  {
    id: "org.citizenship.tip.espresso",
    title: "Buy me an Espresso",
    description: "A small thank-you to keep the lights on.",
    icon: "cafe-outline",
    fallbackPrice: "$1.99",
  },
  {
    id: "org.citizenship.tip.cappuccino",
    title: "Fuel the Server",
    description: "Covers a month of hosting for live civics data.",
    icon: "cafe",
    fallbackPrice: "$4.99",
  },
  {
    id: "org.citizenship.tip.wholebeans",
    title: "Whole Bag of Beans",
    description: "Keeps the app free and ad-free for every immigrant.",
    icon: "nutrition",
    fallbackPrice: "$9.99",
  },
];

// Re-export so existing `import { loadSupporterFlag } from "@/hooks/useTipJar"`
// keeps working, but the canonical (IAP-free) home is services/supporter.ts.
export { loadSupporterFlag } from "@/services/supporter";

export interface UseTipJar {
  isLoading: boolean;
  isProcessingPayment: boolean;
  products: Product[];
  hasTipped: boolean;
  error: string | null;
  /** True immediately after a successful purchase, for the celebration view. */
  justCompleted: boolean;
  requestTip: (productId: TipProductId) => Promise<void>;
  dismissCelebration: () => void;
  /** Localized store price for a product, or its fallback. */
  priceFor: (productId: TipProductId) => string;
}

export function useTipJar(): UseTipJar {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasTipped, setHasTipped] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchaseUpdateSub = useRef<EmitterSubscription | null>(null);
  const purchaseErrorSub = useRef<EmitterSubscription | null>(null);
  const mounted = useRef(true);

  // ── Lifecycle: connect, load products, attach listeners ───────────
  useEffect(() => {
    mounted.current = true;

    (async () => {
      // Reflect any prior supporter status right away.
      setHasTipped(await loadSupporterFlag());

      try {
        await initConnection();

        // Clean up any dangling Android transactions from a prior crash.
        if (Platform.OS === "android") {
          await flushFailedPurchasesCachedAsPendingAndroid().catch(() => {});
        }

        const fetched = await getProducts({ skus: [...TIP_PRODUCT_IDS] });
        if (mounted.current) {
          // Preserve our tier ordering regardless of store response order.
          const ordered = TIP_PRODUCT_IDS.map((id) =>
            fetched.find((p) => p.productId === id)
          ).filter((p): p is Product => Boolean(p));
          setProducts(ordered);
        }
      } catch (e) {
        if (mounted.current) {
          setError(
            "The store is unavailable right now. Please try again later."
          );
        }
      } finally {
        if (mounted.current) setIsLoading(false);
      }

      // Purchase success → finish the transaction, then celebrate.
      purchaseUpdateSub.current = purchaseUpdatedListener(
        async (purchase: Purchase) => {
          const receipt =
            purchase.transactionReceipt ?? purchase.purchaseToken;
          if (!receipt) return;

          try {
            // Consumables must be consumed so the user can tip again later.
            await finishTransaction({ purchase, isConsumable: true });
            await persistSupporterFlag();
            if (mounted.current) {
              setHasTipped(true);
              setJustCompleted(true);
            }
          } catch {
            if (mounted.current) {
              setError("We couldn't finalize your tip. You were not charged twice.");
            }
          } finally {
            if (mounted.current) setIsProcessingPayment(false);
          }
        }
      );

      // Purchase failure / cancellation.
      purchaseErrorSub.current = purchaseErrorListener(
        (err: PurchaseError) => {
          if (!mounted.current) return;
          setIsProcessingPayment(false);
          // E_USER_CANCELLED is a normal dismissal — don't alarm the user.
          if (err.code !== "E_USER_CANCELLED") {
            setError(err.message ?? "The purchase could not be completed.");
          }
        }
      );
    })();

    return () => {
      mounted.current = false;
      purchaseUpdateSub.current?.remove();
      purchaseErrorSub.current?.remove();
      endConnection();
    };
  }, []);

  // ── Fire the native payment sheet ─────────────────────────────────
  const requestTip = useCallback(async (productId: TipProductId) => {
    setError(null);
    setIsProcessingPayment(true);
    try {
      // Platform-specific request shapes per react-native-iap.
      if (Platform.OS === "ios") {
        await requestPurchase({ sku: productId });
      } else {
        await requestPurchase({ skus: [productId] });
      }
      // Resolution continues in purchaseUpdatedListener / purchaseErrorListener.
    } catch (e) {
      setIsProcessingPayment(false);
      setError("Could not open the payment sheet. Please try again.");
    }
  }, []);

  const dismissCelebration = useCallback(() => setJustCompleted(false), []);

  const priceFor = useCallback(
    (productId: TipProductId): string => {
      const product = products.find((p) => p.productId === productId);
      if (product?.localizedPrice) return product.localizedPrice;
      return TIP_TIERS.find((t) => t.id === productId)?.fallbackPrice ?? "";
    },
    [products]
  );

  return {
    isLoading,
    isProcessingPayment,
    products,
    hasTipped,
    error,
    justCompleted,
    requestTip,
    dismissCelebration,
    priceFor,
  };
}
