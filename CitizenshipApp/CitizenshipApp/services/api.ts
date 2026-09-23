import axios from "axios";
import Constants from "expo-constants";
import type { CivicsData } from "@/types";
import { loadCivicsData, saveCivicsData } from "./storage";

const OFFICIALS_PORT = 3001;

/**
 * Resolve the officials backend base URL.
 *
 * Priority:
 *  1. EXPO_PUBLIC_API_URL — set this for production / a deployed backend.
 *  2. In dev, the Metro host IP (Constants…hostUri, e.g. "192.168.1.20:8081")
 *     with the backend port. This is what makes a *physical phone* reach the
 *     dev machine — "localhost" on a phone means the phone itself.
 *  3. localhost — web / simulators running on the same machine as the backend.
 */
function resolveBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (__DEV__) {
    const hostUri =
      Constants.expoConfig?.hostUri ??
      (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;
    const host = hostUri?.split(":")[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:${OFFICIALS_PORT}`;
    }
    return `http://localhost:${OFFICIALS_PORT}`;
  }

  // Production with no override configured: rely on cached / fallback data.
  return `http://localhost:${OFFICIALS_PORT}`;
}

const BASE_URL = resolveBaseUrl();

const client = axios.create({ baseURL: BASE_URL, timeout: 10_000 });

export async function fetchCivicsData(
  state: string,
  forceRefresh = false
): Promise<CivicsData> {
  if (!forceRefresh) {
    const cached = await loadCivicsData();
    if (cached && cached.state === state) return cached;
  }

  try {
    const { data } = await client.get<CivicsData>("/api/civics-data", {
      params: { state },
    });
    await saveCivicsData({ ...data, lastUpdated: new Date().toISOString() });
    return data;
  } catch (error) {
    // Fallback to cache even if stale
    const stale = await loadCivicsData();
    if (stale) return stale;

    // Last-resort fallback: backend unreachable AND no cache. Federal officers
    // are safe to hardcode; state-specific fields stay neutral so we never show
    // the wrong state's officials.
    const fallback: CivicsData = {
      president: "Donald Trump",
      vicePresident: "JD Vance",
      speakerOfHouse: "Mike Johnson",
      chiefJustice: "John Roberts",
      governor: "Check your state government website",
      senators: ["See senate.gov for your state's senators"],
      representative: "Find your rep at house.gov",
      presidentParty: "Republican",
      state,
      lastUpdated: new Date().toISOString(),
    };
    return fallback;
  }
}
