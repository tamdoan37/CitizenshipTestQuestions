import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Cosmetic "supporter" flag, persisted after a successful tip.
 *
 * Kept in its own module (AsyncStorage only, no native IAP imports) so screens
 * like the dashboard can read the flag without pulling in `react-native-iap`,
 * which is a native module and would crash under Expo Go.
 */
const SUPPORTER_KEY = "user_is_supporter";

export async function loadSupporterFlag(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(SUPPORTER_KEY)) === "true";
  } catch {
    return false;
  }
}

export async function persistSupporterFlag(): Promise<void> {
  try {
    await AsyncStorage.setItem(SUPPORTER_KEY, "true");
  } catch {
    // Non-fatal: the badge is purely cosmetic.
  }
}
