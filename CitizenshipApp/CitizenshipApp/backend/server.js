const express = require("express");
const cors = require("cors");
const { DATA_VERSION, FEDERAL, STATES } = require("./officials");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * Build the civics-data payload for a given state code from the static,
 * reviewed dataset. No network calls → deterministic and always available.
 */
function buildCivicsData(code) {
  const state = STATES[code];
  if (!state) return null;

  return {
    // Federal (same for every state)
    president: FEDERAL.president,
    vicePresident: FEDERAL.vicePresident,
    speakerOfHouse: FEDERAL.speakerOfHouse,
    chiefJustice: FEDERAL.chiefJustice,
    presidentParty: FEDERAL.presidentParty,
    // State-specific
    governor: state.governor,
    senators: state.senators,
    capital: state.capital,
    representative: "Find your representative at house.gov/representatives/find-your-representative",
    state: code,
    dataVersion: DATA_VERSION,
    lastUpdated: new Date().toISOString(),
  };
}

app.get("/api/civics-data", (req, res) => {
  const code = String(req.query.state || "WI").toUpperCase();
  const data = buildCivicsData(code);

  if (!data) {
    return res.status(400).json({
      error: `Unknown state code "${code}". Use a 2-letter USPS code (e.g. WI).`,
    });
  }
  return res.json(data);
});

// List supported states (handy for the client's picker / validation).
app.get("/api/states", (_req, res) => {
  res.json(
    Object.entries(STATES).map(([code, s]) => ({ code, capital: s.capital }))
  );
});

app.get("/health", (_req, res) =>
  res.json({ status: "ok", dataVersion: DATA_VERSION })
);

app.listen(PORT, () => {
  console.log(
    `Civics backend (dataset ${DATA_VERSION}) listening on http://localhost:${PORT}`
  );
});
