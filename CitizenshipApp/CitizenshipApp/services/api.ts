import axios from "axios";
import type { CivicsData } from "@/types";
import { loadCivicsData, saveCivicsData } from "./storage";

// Point to your local Node backend (update for prod)
const BASE_URL = __DEV__
  ? "http://localhost:3001"
  : "https://your-production-api.com";

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
