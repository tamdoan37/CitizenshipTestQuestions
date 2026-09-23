import axios from "axios";
import type { CivicsData } from "@/types";
import { loadCivicsData, saveCivicsData } from "./storage";
import officialsBundled from "@/data/officials.json";

/**
 * Officials data source (Option B: static JSON on a free CDN).
 *
 * The app ships with a bundled copy of officials.json, so it works offline and
 * on first launch with zero hosting. If EXPO_PUBLIC_OFFICIALS_URL points at a
 * hosted officials.json (e.g. Cloudflare Pages / GitHub Pages), the app fetches
 * that instead — so you can update officials by editing one file, with NO app
 * re-download. There is no running server to pay for.
 */

interface OfficialsDoc {
  dataVersion: string;
  federal: {
    president: string;
    vicePresident: string;
    speakerOfHouse: string;
    chiefJustice: string;
    presidentParty: string;
  };
  representative: string;
  states: Record<string, { governor: string; senators: string[]; capital: string }>;
}

const BUNDLED = officialsBundled as unknown as OfficialsDoc;
const OFFICIALS_URL = process.env.EXPO_PUBLIC_OFFICIALS_URL; // e.g. https://cdn.example.com/officials.json

/** Build the per-state CivicsData shape the app expects from an officials doc. */
function buildCivics(doc: OfficialsDoc, state: string): CivicsData {
  const st = doc.states[state];
  return {
    president: doc.federal.president,
    vicePresident: doc.federal.vicePresident,
    speakerOfHouse: doc.federal.speakerOfHouse,
    chiefJustice: doc.federal.chiefJustice,
    presidentParty: doc.federal.presidentParty,
    governor: st?.governor ?? "Check your state government website",
    senators: st?.senators ?? ["See senate.gov for your state's senators"],
    representative: doc.representative ?? "Find your rep at house.gov",
    state,
    lastUpdated: new Date().toISOString(),
  };
}

/** Fetch the hosted officials doc if configured; otherwise use the bundled copy. */
async function loadOfficialsDoc(): Promise<OfficialsDoc> {
  if (OFFICIALS_URL) {
    try {
      const { data } = await axios.get<OfficialsDoc>(OFFICIALS_URL, { timeout: 8_000 });
      if (data && data.federal && data.states) return data;
    } catch {
      // fall through to bundled
    }
  }
  return BUNDLED;
}

export async function fetchCivicsData(
  state: string,
  forceRefresh = false
): Promise<CivicsData> {
  if (!forceRefresh) {
    const cached = await loadCivicsData();
    if (cached && cached.state === state) return cached;
  }

  try {
    const doc = await loadOfficialsDoc();
    const civics = buildCivics(doc, state);
    await saveCivicsData(civics);
    return civics;
  } catch {
    // Stale cache, then bundled, then a neutral fallback.
    const stale = await loadCivicsData();
    if (stale) return stale;
    try {
      return buildCivics(BUNDLED, state);
    } catch {
      return {
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
    }
  }
}
