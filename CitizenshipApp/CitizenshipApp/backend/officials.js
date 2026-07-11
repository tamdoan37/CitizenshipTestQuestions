/**
 * Static civic-officials dataset.
 *
 * WHY STATIC?  Scraping Wikipedia at runtime is fragile — a reworded intro
 * sentence silently breaks parsing. Officials change only on a fixed electoral
 * calendar (governors/senators every 2–6 years), so a reviewed static table is
 * both more reliable and faster than live scraping.
 *
 * ⚠️  MAINTENANCE: verify against an authoritative source (e.g. the Congress
 * ical, USA.gov, or ballotpedia) after each federal/state election and bump
 * DATA_VERSION. Values below reflect the 119th Congress / 2025 terms.
 */

const DATA_VERSION = "2025.1";

// Federal officers — apply to every state.
const FEDERAL = {
  president: "Donald Trump",
  vicePresident: "JD Vance",
  speakerOfHouse: "Mike Johnson",
  chiefJustice: "John Roberts",
  presidentParty: "Republican",
};

// Per-state: governor, both U.S. senators, and the state capital.
// Keyed by USPS 2-letter code.
const STATES = {
  AL: { governor: "Kay Ivey", senators: ["Tommy Tuberville", "Katie Britt"], capital: "Montgomery" },
  AK: { governor: "Mike Dunleavy", senators: ["Lisa Murkowski", "Dan Sullivan"], capital: "Juneau" },
  AZ: { governor: "Katie Hobbs", senators: ["Mark Kelly", "Ruben Gallego"], capital: "Phoenix" },
  AR: { governor: "Sarah Huckabee Sanders", senators: ["John Boozman", "Tom Cotton"], capital: "Little Rock" },
  CA: { governor: "Gavin Newsom", senators: ["Alex Padilla", "Adam Schiff"], capital: "Sacramento" },
  CO: { governor: "Jared Polis", senators: ["Michael Bennet", "John Hickenlooper"], capital: "Denver" },
  CT: { governor: "Ned Lamont", senators: ["Richard Blumenthal", "Chris Murphy"], capital: "Hartford" },
  DE: { governor: "Matt Meyer", senators: ["Chris Coons", "Lisa Blunt Rochester"], capital: "Dover" },
  FL: { governor: "Ron DeSantis", senators: ["Rick Scott", "Ashley Moody"], capital: "Tallahassee" },
  GA: { governor: "Brian Kemp", senators: ["Jon Ossoff", "Raphael Warnock"], capital: "Atlanta" },
  HI: { governor: "Josh Green", senators: ["Brian Schatz", "Mazie Hirono"], capital: "Honolulu" },
  ID: { governor: "Brad Little", senators: ["Mike Crapo", "Jim Risch"], capital: "Boise" },
  IL: { governor: "JB Pritzker", senators: ["Dick Durbin", "Tammy Duckworth"], capital: "Springfield" },
  IN: { governor: "Mike Braun", senators: ["Todd Young", "Jim Banks"], capital: "Indianapolis" },
  IA: { governor: "Kim Reynolds", senators: ["Chuck Grassley", "Joni Ernst"], capital: "Des Moines" },
  KS: { governor: "Laura Kelly", senators: ["Jerry Moran", "Roger Marshall"], capital: "Topeka" },
  KY: { governor: "Andy Beshear", senators: ["Mitch McConnell", "Rand Paul"], capital: "Frankfort" },
  LA: { governor: "Jeff Landry", senators: ["Bill Cassidy", "John Kennedy"], capital: "Baton Rouge" },
  ME: { governor: "Janet Mills", senators: ["Susan Collins", "Angus King"], capital: "Augusta" },
  MD: { governor: "Wes Moore", senators: ["Chris Van Hollen", "Angela Alsobrooks"], capital: "Annapolis" },
  MA: { governor: "Maura Healey", senators: ["Elizabeth Warren", "Ed Markey"], capital: "Boston" },
  MI: { governor: "Gretchen Whitmer", senators: ["Gary Peters", "Elissa Slotkin"], capital: "Lansing" },
  MN: { governor: "Tim Walz", senators: ["Amy Klobuchar", "Tina Smith"], capital: "Saint Paul" },
  MS: { governor: "Tate Reeves", senators: ["Roger Wicker", "Cindy Hyde-Smith"], capital: "Jackson" },
  MO: { governor: "Mike Kehoe", senators: ["Josh Hawley", "Eric Schmitt"], capital: "Jefferson City" },
  MT: { governor: "Greg Gianforte", senators: ["Steve Daines", "Tim Sheehy"], capital: "Helena" },
  NE: { governor: "Jim Pillen", senators: ["Deb Fischer", "Pete Ricketts"], capital: "Lincoln" },
  NV: { governor: "Joe Lombardo", senators: ["Catherine Cortez Masto", "Jacky Rosen"], capital: "Carson City" },
  NH: { governor: "Kelly Ayotte", senators: ["Jeanne Shaheen", "Maggie Hassan"], capital: "Concord" },
  NJ: { governor: "Phil Murphy", senators: ["Cory Booker", "Andy Kim"], capital: "Trenton" },
  NM: { governor: "Michelle Lujan Grisham", senators: ["Martin Heinrich", "Ben Ray Luján"], capital: "Santa Fe" },
  NY: { governor: "Kathy Hochul", senators: ["Chuck Schumer", "Kirsten Gillibrand"], capital: "Albany" },
  NC: { governor: "Josh Stein", senators: ["Thom Tillis", "Ted Budd"], capital: "Raleigh" },
  ND: { governor: "Kelly Armstrong", senators: ["John Hoeven", "Kevin Cramer"], capital: "Bismarck" },
  OH: { governor: "Mike DeWine", senators: ["Bernie Moreno", "Jon Husted"], capital: "Columbus" },
  OK: { governor: "Kevin Stitt", senators: ["James Lankford", "Markwayne Mullin"], capital: "Oklahoma City" },
  OR: { governor: "Tina Kotek", senators: ["Ron Wyden", "Jeff Merkley"], capital: "Salem" },
  PA: { governor: "Josh Shapiro", senators: ["John Fetterman", "Dave McCormick"], capital: "Harrisburg" },
  RI: { governor: "Dan McKee", senators: ["Jack Reed", "Sheldon Whitehouse"], capital: "Providence" },
  SC: { governor: "Henry McMaster", senators: ["Lindsey Graham", "Tim Scott"], capital: "Columbia" },
  SD: { governor: "Larry Rhoden", senators: ["John Thune", "Mike Rounds"], capital: "Pierre" },
  TN: { governor: "Bill Lee", senators: ["Marsha Blackburn", "Bill Hagerty"], capital: "Nashville" },
  TX: { governor: "Greg Abbott", senators: ["John Cornyn", "Ted Cruz"], capital: "Austin" },
  UT: { governor: "Spencer Cox", senators: ["Mike Lee", "John Curtis"], capital: "Salt Lake City" },
  VT: { governor: "Phil Scott", senators: ["Bernie Sanders", "Peter Welch"], capital: "Montpelier" },
  VA: { governor: "Glenn Youngkin", senators: ["Mark Warner", "Tim Kaine"], capital: "Richmond" },
  WA: { governor: "Bob Ferguson", senators: ["Patty Murray", "Maria Cantwell"], capital: "Olympia" },
  WV: { governor: "Patrick Morrisey", senators: ["Shelley Moore Capito", "Jim Justice"], capital: "Charleston" },
  WI: { governor: "Tony Evers", senators: ["Ron Johnson", "Tammy Baldwin"], capital: "Madison" },
  WY: { governor: "Mark Gordon", senators: ["John Barrasso", "Cynthia Lummis"], capital: "Cheyenne" },
};

module.exports = { DATA_VERSION, FEDERAL, STATES };
