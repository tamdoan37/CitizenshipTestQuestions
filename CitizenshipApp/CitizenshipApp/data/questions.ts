import type { Question } from "@/types";

// 2020 USCIS Civics Test — 128 questions
// isDynamic=true questions are patched at runtime via /api/civics-data
export const QUESTIONS: Question[] = [
  // ─── AMERICAN GOVERNMENT ────────────────────────────────────────────────────
  // Principles of American Democracy
  {
    id: 1, number: 1, section: "American Government",
    category: "Principles of American Democracy",
    text: "What is the supreme law of the land?",
    answers: ["the Constitution"],
  },
  {
    id: 2, number: 2, section: "American Government",
    category: "Principles of American Democracy",
    text: "What does the Constitution do?",
    answers: ["sets up the government", "defines the government", "protects basic rights of Americans"],
  },
  {
    id: 3, number: 3, section: "American Government",
    category: "Principles of American Democracy",
    text: "The idea of self-government is in the first three words of the Constitution. What are these words?",
    answers: ["We the People"],
  },
  {
    id: 4, number: 4, section: "American Government",
    category: "Principles of American Democracy",
    text: "What is an amendment?",
    answers: ["a change to the Constitution", "an addition to the Constitution"],
  },
  {
    id: 5, number: 5, section: "American Government",
    category: "Principles of American Democracy",
    text: "What do we call the first ten amendments to the Constitution?",
    answers: ["the Bill of Rights"],
  },
  {
    id: 6, number: 6, section: "American Government",
    category: "Principles of American Democracy",
    text: "What is one right or freedom from the First Amendment?",
    answers: ["speech", "religion", "assembly", "press", "petition the government"],
  },
  {
    id: 7, number: 7, section: "American Government",
    category: "Principles of American Democracy",
    text: "How many amendments does the Constitution have?",
    answers: ["twenty-seven", "27"],
  },
  {
    id: 8, number: 8, section: "American Government",
    category: "Principles of American Democracy",
    text: "What did the Declaration of Independence do?",
    answers: [
      "announced our independence from Great Britain",
      "declared our independence from Great Britain",
      "said that the United States is free from Great Britain",
    ],
  },
  {
    id: 9, number: 9, section: "American Government",
    category: "Principles of American Democracy",
    text: "What are two rights in the Declaration of Independence?",
    answers: [
      "life and liberty",
      "liberty and the pursuit of happiness",
      "life and the pursuit of happiness",
    ],
  },
  {
    id: 10, number: 10, section: "American Government",
    category: "Principles of American Democracy",
    text: "What is freedom of religion?",
    answers: ["You can practice any religion, or not practice a religion."],
  },
  {
    id: 11, number: 11, section: "American Government",
    category: "Principles of American Democracy",
    text: "What is the economic system in the United States?",
    answers: ["capitalist economy", "market economy"],
  },
  {
    id: 12, number: 12, section: "American Government",
    category: "Principles of American Democracy",
    text: 'What is the "rule of law"?',
    answers: [
      "Everyone must follow the law.",
      "Leaders must obey the law.",
      "Government must obey the law.",
      "No one is above the law.",
    ],
  },
  // System of Government
  {
    id: 13, number: 13, section: "American Government",
    category: "System of Government",
    text: "Name one branch or part of the government.",
    answers: ["Congress", "legislative", "President", "executive", "the courts", "judicial"],
  },
  {
    id: 14, number: 14, section: "American Government",
    category: "System of Government",
    text: "What stops one branch of government from becoming too powerful?",
    answers: ["checks and balances", "separation of powers"],
  },
  {
    id: 15, number: 15, section: "American Government",
    category: "System of Government",
    text: "Who is in charge of the executive branch?",
    answers: ["the President"],
  },
  {
    id: 16, number: 16, section: "American Government",
    category: "System of Government",
    text: "Who makes federal laws?",
    answers: ["Congress", "Senate and House of Representatives", "U.S. legislature"],
  },
  {
    id: 17, number: 17, section: "American Government",
    category: "System of Government",
    text: "What are the two parts of the U.S. Congress?",
    answers: ["the Senate and House of Representatives"],
  },
  {
    id: 18, number: 18, section: "American Government",
    category: "System of Government",
    text: "How many U.S. Senators are there?",
    answers: ["one hundred", "100"],
  },
  {
    id: 19, number: 19, section: "American Government",
    category: "System of Government",
    text: "We elect a U.S. Senator for how many years?",
    answers: ["six", "6"],
  },
  {
    id: 20, number: 20, section: "American Government",
    category: "System of Government",
    text: "Who is one of your state's U.S. Senators now?",
    answers: ["Answers will vary by state"],
    isDynamic: true, dynamicKey: "senators",
  },
  {
    id: 21, number: 21, section: "American Government",
    category: "System of Government",
    text: "The House of Representatives has how many voting members?",
    answers: ["four hundred thirty-five", "435"],
  },
  {
    id: 22, number: 22, section: "American Government",
    category: "System of Government",
    text: "We elect a U.S. Representative for how many years?",
    answers: ["two", "2"],
  },
  {
    id: 23, number: 23, section: "American Government",
    category: "System of Government",
    text: "Name your U.S. Representative.",
    answers: ["Answers will vary by district"],
    isDynamic: true, dynamicKey: "representative",
  },
  {
    id: 24, number: 24, section: "American Government",
    category: "System of Government",
    text: "Who does a U.S. Senator represent?",
    answers: ["all people of the state"],
  },
  {
    id: 25, number: 25, section: "American Government",
    category: "System of Government",
    text: "Why do some states have more Representatives than other states?",
    answers: [
      "because of the state's population",
      "because they have more people",
      "because some states have more people",
    ],
  },
  {
    id: 26, number: 26, section: "American Government",
    category: "System of Government",
    text: "We elect a President for how many years?",
    answers: ["four", "4"],
  },
  {
    id: 27, number: 27, section: "American Government",
    category: "System of Government",
    text: "In what month do we vote for President?",
    answers: ["November"],
  },
  {
    id: 28, number: 28, section: "American Government",
    category: "System of Government",
    text: "What is the name of the President of the United States now?",
    answers: ["Donald Trump", "Donald J. Trump"],
    isDynamic: true, dynamicKey: "president",
  },
  {
    id: 29, number: 29, section: "American Government",
    category: "System of Government",
    text: "What is the name of the Vice President of the United States now?",
    answers: ["JD Vance", "James David Vance"],
    isDynamic: true, dynamicKey: "vicePresident",
  },
  {
    id: 30, number: 30, section: "American Government",
    category: "System of Government",
    text: "If the President can no longer serve, who becomes President?",
    answers: ["the Vice President"],
  },
  {
    id: 31, number: 31, section: "American Government",
    category: "System of Government",
    text: "If both the President and the Vice President can no longer serve, who becomes President?",
    answers: ["the Speaker of the House"],
  },
  {
    id: 32, number: 32, section: "American Government",
    category: "System of Government",
    text: "Who is the Commander in Chief of the military?",
    answers: ["the President"],
  },
  {
    id: 33, number: 33, section: "American Government",
    category: "System of Government",
    text: "Who signs bills to become laws?",
    answers: ["the President"],
  },
  {
    id: 34, number: 34, section: "American Government",
    category: "System of Government",
    text: "Who vetoes bills?",
    answers: ["the President"],
  },
  {
    id: 35, number: 35, section: "American Government",
    category: "System of Government",
    text: "What does the President's Cabinet do?",
    answers: ["advises the President"],
  },
  {
    id: 36, number: 36, section: "American Government",
    category: "System of Government",
    text: "What are two Cabinet-level positions?",
    answers: [
      "Secretary of Agriculture", "Secretary of Commerce", "Secretary of Defense",
      "Secretary of Education", "Secretary of Energy", "Secretary of Health and Human Services",
      "Secretary of Homeland Security", "Secretary of Housing and Urban Development",
      "Secretary of the Interior", "Secretary of Labor", "Secretary of State",
      "Secretary of Transportation", "Secretary of the Treasury", "Secretary of Veterans Affairs",
      "Attorney General", "Vice President",
    ],
  },
  {
    id: 37, number: 37, section: "American Government",
    category: "System of Government",
    text: "What does the judicial branch do?",
    answers: [
      "reviews laws", "explains laws", "resolves disputes",
      "decides if a law goes against the Constitution",
    ],
  },
  {
    id: 38, number: 38, section: "American Government",
    category: "System of Government",
    text: "What is the highest court in the United States?",
    answers: ["the Supreme Court"],
  },
  {
    id: 39, number: 39, section: "American Government",
    category: "System of Government",
    text: "How many justices are on the Supreme Court?",
    answers: ["nine", "9"],
  },
  {
    id: 40, number: 40, section: "American Government",
    category: "System of Government",
    text: "Who is the Chief Justice of the United States now?",
    answers: ["John Roberts", "John G. Roberts Jr."],
    isDynamic: true, dynamicKey: "chiefJustice",
  },
  {
    id: 41, number: 41, section: "American Government",
    category: "System of Government",
    text: "Under our Constitution, some powers belong to the federal government. What is one power of the federal government?",
    answers: ["to print money", "to declare war", "to create an army", "to make treaties"],
  },
  {
    id: 42, number: 42, section: "American Government",
    category: "System of Government",
    text: "Under our Constitution, some powers belong to the states. What is one power of the states?",
    answers: [
      "provide schooling and education", "provide protection (police)",
      "provide safety (fire departments)", "give a driver's license",
      "approve zoning and land use",
    ],
  },
  {
    id: 43, number: 43, section: "American Government",
    category: "System of Government",
    text: "Who is the Governor of your state now?",
    answers: ["Answers will vary by state"],
    isDynamic: true, dynamicKey: "governor",
  },
  {
    id: 44, number: 44, section: "American Government",
    category: "System of Government",
    text: "What is the capital of your state?",
    answers: ["Answers will vary by state"],
    isDynamic: true, dynamicKey: "governor",
  },
  {
    id: 45, number: 45, section: "American Government",
    category: "System of Government",
    text: "What are the two major political parties in the United States?",
    answers: ["Democratic and Republican"],
  },
  {
    id: 46, number: 46, section: "American Government",
    category: "System of Government",
    text: "What is the political party of the President now?",
    answers: ["Republican Party", "Republican"],
    isDynamic: true, dynamicKey: "presidentParty",
  },
  {
    id: 47, number: 47, section: "American Government",
    category: "System of Government",
    text: "What is the name of the Speaker of the House of Representatives now?",
    answers: ["Mike Johnson", "Michael Johnson"],
    isDynamic: true, dynamicKey: "speakerOfHouse",
  },
  // Rights and Responsibilities
  {
    id: 48, number: 48, section: "American Government",
    category: "Rights and Responsibilities",
    text: "There are four amendments to the Constitution about who can vote. Describe one of them.",
    answers: [
      "Citizens eighteen and older can vote.",
      "You don't have to pay a poll tax to vote.",
      "Any citizen can vote. Women and men can vote.",
      "A male citizen of any race can vote.",
    ],
  },
  {
    id: 49, number: 49, section: "American Government",
    category: "Rights and Responsibilities",
    text: "What is one responsibility that is only for United States citizens?",
    answers: ["serve on a jury", "vote in a federal election"],
  },
  {
    id: 50, number: 50, section: "American Government",
    category: "Rights and Responsibilities",
    text: "Name one right only for United States citizens.",
    answers: ["vote in a federal election", "run for federal office"],
  },
  {
    id: 51, number: 51, section: "American Government",
    category: "Rights and Responsibilities",
    text: "What are two rights of everyone living in the United States?",
    answers: [
      "freedom of expression", "freedom of speech", "freedom of assembly",
      "freedom to petition the government", "freedom of religion", "the right to bear arms",
    ],
  },
  {
    id: 52, number: 52, section: "American Government",
    category: "Rights and Responsibilities",
    text: "What do we show loyalty to when we say the Pledge of Allegiance?",
    answers: ["the United States", "the flag"],
  },
  {
    id: 53, number: 53, section: "American Government",
    category: "Rights and Responsibilities",
    text: "What is one promise you make when you become a United States citizen?",
    answers: [
      "give up loyalty to other countries",
      "defend the Constitution and laws of the United States",
      "obey the laws of the United States",
      "serve in the U.S. military if needed",
      "be loyal to the United States",
    ],
  },
  {
    id: 54, number: 54, section: "American Government",
    category: "Rights and Responsibilities",
    text: "How old do citizens have to be to vote for President?",
    answers: ["eighteen and older", "18 and older"],
  },
  {
    id: 55, number: 55, section: "American Government",
    category: "Rights and Responsibilities",
    text: "What are two ways that Americans can participate in their democracy?",
    answers: [
      "vote", "join a political party", "help with a campaign", "join a civic group",
      "join a community group", "give an elected official your opinion on an issue",
      "call Senators and Representatives", "publicly support or oppose an issue or policy",
      "run for office", "write to a newspaper",
    ],
  },
  {
    id: 56, number: 56, section: "American Government",
    category: "Rights and Responsibilities",
    text: "When is the last day you can send in federal income tax forms?",
    answers: ["April 15"],
  },
  {
    id: 57, number: 57, section: "American Government",
    category: "Rights and Responsibilities",
    text: "When must all men register for the Selective Service?",
    answers: ["at age eighteen", "between eighteen and twenty-six"],
  },
  // ─── AMERICAN HISTORY ────────────────────────────────────────────────────────
  // Colonial Period and Independence
  {
    id: 58, number: 58, section: "American History",
    category: "Colonial Period and Independence",
    text: "What is one reason colonists came to America?",
    answers: [
      "freedom", "political liberty", "religious freedom",
      "economic opportunity", "practice their religion", "escape persecution",
    ],
  },
  {
    id: 59, number: 59, section: "American History",
    category: "Colonial Period and Independence",
    text: "Who lived in America before the Europeans arrived?",
    answers: ["American Indians", "Native Americans"],
  },
  {
    id: 60, number: 60, section: "American History",
    category: "Colonial Period and Independence",
    text: "What group of people was taken to America and sold as slaves?",
    answers: ["Africans", "people from Africa"],
  },
  {
    id: 61, number: 61, section: "American History",
    category: "Colonial Period and Independence",
    text: "Why did the colonists fight the British?",
    answers: [
      "because of high taxes (taxation without representation)",
      "because the British army stayed in their houses",
      "because they didn't have self-government",
    ],
  },
  {
    id: 62, number: 62, section: "American History",
    category: "Colonial Period and Independence",
    text: "Who wrote the Declaration of Independence?",
    answers: ["Thomas Jefferson", "Jefferson"],
  },
  {
    id: 63, number: 63, section: "American History",
    category: "Colonial Period and Independence",
    text: "When was the Declaration of Independence adopted?",
    answers: ["July 4, 1776"],
  },
  {
    id: 64, number: 64, section: "American History",
    category: "Colonial Period and Independence",
    text: "There were 13 original states. Name three.",
    answers: [
      "New Hampshire", "Massachusetts", "Rhode Island", "Connecticut",
      "New York", "New Jersey", "Pennsylvania", "Delaware",
      "Maryland", "Virginia", "North Carolina", "South Carolina", "Georgia",
    ],
  },
  {
    id: 65, number: 65, section: "American History",
    category: "Colonial Period and Independence",
    text: "What happened at the Constitutional Convention?",
    answers: ["The Constitution was written.", "The Founding Fathers wrote the Constitution."],
  },
  {
    id: 66, number: 66, section: "American History",
    category: "Colonial Period and Independence",
    text: "When was the Constitution written?",
    answers: ["1787"],
  },
  {
    id: 67, number: 67, section: "American History",
    category: "Colonial Period and Independence",
    text: "The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.",
    answers: ["James Madison", "Alexander Hamilton", "John Jay", "Publius"],
  },
  {
    id: 68, number: 68, section: "American History",
    category: "Colonial Period and Independence",
    text: "What is one thing Benjamin Franklin is famous for?",
    answers: [
      "U.S. diplomat", "oldest member of the Constitutional Convention",
      "first Postmaster General of the United States",
      "writer of Poor Richard's Almanac", "started the first free libraries",
    ],
  },
  {
    id: 69, number: 69, section: "American History",
    category: "Colonial Period and Independence",
    text: 'Who is the "Father of Our Country"?',
    answers: ["George Washington", "Washington"],
  },
  {
    id: 70, number: 70, section: "American History",
    category: "Colonial Period and Independence",
    text: "Who was the first President?",
    answers: ["George Washington", "Washington"],
  },
  // 1800s
  {
    id: 71, number: 71, section: "American History",
    category: "1800s",
    text: "What territory did the United States buy from France in 1803?",
    answers: ["the Louisiana Territory", "Louisiana"],
  },
  {
    id: 72, number: 72, section: "American History",
    category: "1800s",
    text: "Name one war fought by the United States in the 1800s.",
    answers: ["War of 1812", "Mexican-American War", "Civil War", "Spanish-American War"],
  },
  {
    id: 73, number: 73, section: "American History",
    category: "1800s",
    text: "Name the U.S. war between the North and the South.",
    answers: ["the Civil War", "the War between the States"],
  },
  {
    id: 74, number: 74, section: "American History",
    category: "1800s",
    text: "Name one problem that led to the Civil War.",
    answers: ["slavery", "economic reasons", "states' rights"],
  },
  {
    id: 75, number: 75, section: "American History",
    category: "1800s",
    text: "What was one important thing that Abraham Lincoln did?",
    answers: [
      "freed the slaves (Emancipation Proclamation)",
      "saved the Union", "led the United States during the Civil War",
    ],
  },
  {
    id: 76, number: 76, section: "American History",
    category: "1800s",
    text: "What did the Emancipation Proclamation do?",
    answers: [
      "freed the slaves", "freed slaves in the Confederacy",
      "freed slaves in the Confederate states", "freed slaves in most Southern states",
    ],
  },
  {
    id: 77, number: 77, section: "American History",
    category: "1800s",
    text: "What did Susan B. Anthony do?",
    answers: ["fought for women's rights", "fought for civil rights"],
  },
  // Recent American History
  {
    id: 78, number: 78, section: "American History",
    category: "Recent American History",
    text: "Name one war fought by the United States in the 1900s.",
    answers: ["World War I", "World War II", "Korean War", "Vietnam War", "Gulf War"],
  },
  {
    id: 79, number: 79, section: "American History",
    category: "Recent American History",
    text: "Who was President during World War I?",
    answers: ["Woodrow Wilson", "Wilson"],
  },
  {
    id: 80, number: 80, section: "American History",
    category: "Recent American History",
    text: "Who was President during the Great Depression and World War II?",
    answers: ["Franklin Roosevelt", "Roosevelt", "FDR"],
  },
  {
    id: 81, number: 81, section: "American History",
    category: "Recent American History",
    text: "Who did the United States fight in World War II?",
    answers: ["Japan, Germany, and Italy"],
  },
  {
    id: 82, number: 82, section: "American History",
    category: "Recent American History",
    text: "Before he was President, Eisenhower was a general. What war was he in?",
    answers: ["World War II"],
  },
  {
    id: 83, number: 83, section: "American History",
    category: "Recent American History",
    text: "During the Cold War, what was the main concern of the United States?",
    answers: ["Communism"],
  },
  {
    id: 84, number: 84, section: "American History",
    category: "Recent American History",
    text: "What movement tried to end racial discrimination?",
    answers: ["civil rights movement", "civil rights"],
  },
  {
    id: 85, number: 85, section: "American History",
    category: "Recent American History",
    text: "What did Martin Luther King Jr. do?",
    answers: ["fought for civil rights", "worked for equality for all Americans"],
  },
  {
    id: 86, number: 86, section: "American History",
    category: "Recent American History",
    text: "What major event happened on September 11, 2001, in the United States?",
    answers: ["Terrorists attacked the United States."],
  },
  {
    id: 87, number: 87, section: "American History",
    category: "Recent American History",
    text: "Name one American Indian tribe in the United States.",
    answers: [
      "Cherokee", "Navajo", "Sioux", "Chippewa", "Choctaw", "Pueblo",
      "Apache", "Iroquois", "Creek", "Blackfeet", "Seminole", "Cheyenne",
      "Arawak", "Shawnee", "Mohegan", "Huron", "Oneida", "Lakota",
      "Crow", "Teton", "Hopi", "Inuit",
    ],
  },
  // ─── INTEGRATED CIVICS ────────────────────────────────────────────────────────
  // Geography
  {
    id: 88, number: 88, section: "Integrated Civics",
    category: "Geography",
    text: "Name one of the two longest rivers in the United States.",
    answers: ["Missouri River", "Mississippi River"],
  },
  {
    id: 89, number: 89, section: "Integrated Civics",
    category: "Geography",
    text: "What ocean is on the West Coast of the United States?",
    answers: ["Pacific Ocean", "Pacific"],
  },
  {
    id: 90, number: 90, section: "Integrated Civics",
    category: "Geography",
    text: "What ocean is on the East Coast of the United States?",
    answers: ["Atlantic Ocean", "Atlantic"],
  },
  {
    id: 91, number: 91, section: "Integrated Civics",
    category: "Geography",
    text: "Name one U.S. territory.",
    answers: [
      "Puerto Rico", "U.S. Virgin Islands", "American Samoa",
      "Northern Mariana Islands", "Guam",
    ],
  },
  {
    id: 92, number: 92, section: "Integrated Civics",
    category: "Geography",
    text: "Name one state that borders Canada.",
    answers: [
      "Maine", "New Hampshire", "Vermont", "New York", "Pennsylvania",
      "Ohio", "Michigan", "Minnesota", "North Dakota", "Montana",
      "Idaho", "Washington", "Alaska",
    ],
  },
  {
    id: 93, number: 93, section: "Integrated Civics",
    category: "Geography",
    text: "Name one state that borders Mexico.",
    answers: ["California", "Arizona", "New Mexico", "Texas"],
  },
  {
    id: 94, number: 94, section: "Integrated Civics",
    category: "Geography",
    text: "What is the capital of the United States?",
    answers: ["Washington D.C.", "Washington", "D.C."],
  },
  {
    id: 95, number: 95, section: "Integrated Civics",
    category: "Geography",
    text: "Where is the Statue of Liberty?",
    answers: ["New York Harbor", "Liberty Island", "New York", "New Jersey"],
  },
  // Symbols
  {
    id: 96, number: 96, section: "Integrated Civics",
    category: "Symbols",
    text: "Why does the flag have 13 stripes?",
    answers: [
      "because there were 13 original colonies",
      "because the stripes represent the original colonies",
    ],
  },
  {
    id: 97, number: 97, section: "Integrated Civics",
    category: "Symbols",
    text: "Why does the flag have 50 stars?",
    answers: [
      "because there is one star for each state",
      "because each star represents a state",
      "because there are 50 states",
    ],
  },
  {
    id: 98, number: 98, section: "Integrated Civics",
    category: "Symbols",
    text: "What is the name of the national anthem?",
    answers: ["The Star-Spangled Banner"],
  },
  // Holidays
  {
    id: 99, number: 99, section: "Integrated Civics",
    category: "Holidays",
    text: "When do we celebrate Independence Day?",
    answers: ["July 4", "July 4th", "the Fourth of July"],
  },
  {
    id: 100, number: 100, section: "Integrated Civics",
    category: "Holidays",
    text: "Name two national U.S. holidays.",
    answers: [
      "New Year's Day", "Martin Luther King Jr. Day", "Presidents' Day",
      "Memorial Day", "Independence Day", "Labor Day", "Columbus Day",
      "Veterans Day", "Thanksgiving", "Christmas",
    ],
  },
  // ─── 2020 EXPANDED QUESTIONS (101–128) ──────────────────────────────────────
  {
    id: 101, number: 101, section: "American Government",
    category: "Principles of American Democracy",
    text: "What is the highest law of the United States?",
    answers: ["the Constitution", "the U.S. Constitution"],
  },
  {
    id: 102, number: 102, section: "American Government",
    category: "Principles of American Democracy",
    text: "Name one right guaranteed by the First Amendment.",
    answers: ["freedom of speech", "freedom of religion", "freedom of assembly", "freedom of the press", "right to petition"],
  },
  {
    id: 103, number: 103, section: "American Government",
    category: "System of Government",
    text: "The Constitution was written to protect Americans from a government with too much power. Why do we have a government?",
    answers: [
      "because the Constitution requires it",
      "to protect Americans' rights",
      "to govern the people fairly",
      "to maintain order",
    ],
  },
  {
    id: 104, number: 104, section: "American Government",
    category: "System of Government",
    text: "What does the U.S. Congress do?",
    answers: ["makes laws", "makes federal laws", "writes and passes federal laws"],
  },
  {
    id: 105, number: 105, section: "American Government",
    category: "System of Government",
    text: "What are the two houses of Congress?",
    answers: ["the Senate and the House of Representatives"],
  },
  {
    id: 106, number: 106, section: "American Government",
    category: "System of Government",
    text: "What are the duties of Congress?",
    answers: ["to write and pass laws", "to make laws", "to tax the people", "to declare war"],
  },
  {
    id: 107, number: 107, section: "American Government",
    category: "Rights and Responsibilities",
    text: "What is the Bill of Rights?",
    answers: [
      "the first ten amendments to the Constitution",
      "a list of rights and freedoms for Americans",
    ],
  },
  {
    id: 108, number: 108, section: "American Government",
    category: "Rights and Responsibilities",
    text: "What does the Fourteenth Amendment do?",
    answers: [
      "describes citizenship rights",
      "grants citizenship to people born in the U.S.",
      "gives citizenship to formerly enslaved people",
      "defines citizenship and provides equal protection",
    ],
  },
  {
    id: 109, number: 109, section: "American Government",
    category: "Rights and Responsibilities",
    text: "Name three rights or freedoms guaranteed by the Bill of Rights.",
    answers: [
      "freedom of speech", "freedom of religion", "freedom of assembly",
      "freedom of the press", "right to petition", "right to bear arms",
      "right to a fair and speedy trial", "right against unreasonable search and seizure",
      "right to remain silent", "right to an attorney",
    ],
  },
  {
    id: 110, number: 110, section: "American History",
    category: "Colonial Period and Independence",
    text: "What founding document was adopted on July 4, 1776?",
    answers: ["the Declaration of Independence"],
  },
  {
    id: 111, number: 111, section: "American History",
    category: "Colonial Period and Independence",
    text: "What does the Declaration of Independence say about people's rights?",
    answers: [
      "all people are created equal",
      "people have unalienable rights",
      "life, liberty, and the pursuit of happiness",
    ],
  },
  {
    id: 112, number: 112, section: "American History",
    category: "Colonial Period and Independence",
    text: "What group fought for independence from England in 1776?",
    answers: ["the American colonists", "colonists", "the thirteen colonies"],
  },
  {
    id: 113, number: 113, section: "American History",
    category: "1800s",
    text: "What did Abraham Lincoln's Emancipation Proclamation accomplish?",
    answers: [
      "freed enslaved people in Confederate states",
      "freed enslaved people in the South",
      "declared that enslaved people were free",
    ],
  },
  {
    id: 114, number: 114, section: "American History",
    category: "1800s",
    text: "What is the 13th Amendment?",
    answers: ["abolished slavery", "freed the slaves", "ended slavery in the United States"],
  },
  {
    id: 115, number: 115, section: "American History",
    category: "1800s",
    text: "What event is described in the 19th Amendment?",
    answers: ["gave women the right to vote", "women's suffrage"],
  },
  {
    id: 116, number: 116, section: "American History",
    category: "Recent American History",
    text: "Who was President during the Civil Rights Movement of the 1960s?",
    answers: ["Lyndon Johnson", "Lyndon B. Johnson", "LBJ", "John F. Kennedy", "Kennedy"],
  },
  {
    id: 117, number: 117, section: "American History",
    category: "Recent American History",
    text: "What is the longest river in the United States?",
    answers: ["Missouri River", "Mississippi River"],
  },
  {
    id: 118, number: 118, section: "American History",
    category: "Recent American History",
    text: "During World War II, what country dropped atomic bombs on Japan?",
    answers: ["the United States"],
  },
  {
    id: 119, number: 119, section: "Integrated Civics",
    category: "Geography",
    text: "What is the largest state by area?",
    answers: ["Alaska"],
  },
  {
    id: 120, number: 120, section: "Integrated Civics",
    category: "Geography",
    text: "What is the most populous state?",
    answers: ["California"],
  },
  {
    id: 121, number: 121, section: "Integrated Civics",
    category: "Symbols",
    text: "What colors are on the U.S. flag?",
    answers: ["red, white, and blue"],
  },
  {
    id: 122, number: 122, section: "Integrated Civics",
    category: "Symbols",
    text: "What is the national bird of the United States?",
    answers: ["the bald eagle"],
  },
  {
    id: 123, number: 123, section: "Integrated Civics",
    category: "Symbols",
    text: "What is the national flower of the United States?",
    answers: ["the rose"],
  },
  {
    id: 124, number: 124, section: "Integrated Civics",
    category: "Holidays",
    text: "What holiday is celebrated on the fourth Thursday in November?",
    answers: ["Thanksgiving"],
  },
  {
    id: 125, number: 125, section: "Integrated Civics",
    category: "Holidays",
    text: "What holiday honors people who have died in service to the United States?",
    answers: ["Memorial Day"],
  },
  {
    id: 126, number: 126, section: "Integrated Civics",
    category: "Path to Citizenship",
    text: "What are the steps in the naturalization process?",
    answers: [
      "file an application, be interviewed, pass the civics and English tests, take the Oath of Allegiance",
    ],
  },
  {
    id: 127, number: 127, section: "Integrated Civics",
    category: "Path to Citizenship",
    text: "What oath do new citizens take?",
    answers: [
      "the Oath of Allegiance", "the Oath of Citizenship",
      "to support and defend the Constitution",
    ],
  },
  {
    id: 128, number: 128, section: "Integrated Civics",
    category: "Path to Citizenship",
    text: "How long must someone be a permanent resident before applying for citizenship?",
    answers: ["five years", "5 years", "at least 5 years"],
  },
];

export const CATEGORIES = [...new Set(QUESTIONS.map(q => q.category))];

export function getRandomQuestions(count: number, pool = QUESTIONS): Question[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Weighted, no-replacement sample of `count` questions.
 * A question's weight (from its tracker) is its relative probability of being
 * drawn, so frequently-missed questions surface more often.
 */
export function getWeightedQuestions(
  count: number,
  weightById: Record<number, number>,
  pool = QUESTIONS
): Question[] {
  const remaining = [...pool];
  const picked: Question[] = [];
  const n = Math.min(count, remaining.length);

  for (let i = 0; i < n; i++) {
    const total = remaining.reduce(
      (sum, q) => sum + Math.max(0.01, weightById[q.id] ?? 1),
      0
    );
    let roll = Math.random() * total;
    let idx = 0;
    for (let j = 0; j < remaining.length; j++) {
      roll -= Math.max(0.01, weightById[remaining[j].id] ?? 1);
      if (roll <= 0) {
        idx = j;
        break;
      }
    }
    picked.push(remaining[idx]);
    remaining.splice(idx, 1);
  }
  return picked;
}

export function patchDynamicAnswers(
  questions: Question[],
  civicsData: import("@/types").CivicsData
): Question[] {
  return questions.map(q => {
    if (!q.isDynamic || !q.dynamicKey) return q;
    const key = q.dynamicKey;
    if (key === "president") return { ...q, answers: [civicsData.president] };
    if (key === "vicePresident") return { ...q, answers: [civicsData.vicePresident] };
    if (key === "speakerOfHouse") return { ...q, answers: [civicsData.speakerOfHouse] };
    if (key === "chiefJustice") return { ...q, answers: [civicsData.chiefJustice] };
    if (key === "governor") return { ...q, answers: [civicsData.governor] };
    if (key === "senators") return { ...q, answers: civicsData.senators };
    if (key === "representative") return { ...q, answers: [civicsData.representative] };
    if (key === "presidentParty") return { ...q, answers: [civicsData.presidentParty] };
    return q;
  });
}
