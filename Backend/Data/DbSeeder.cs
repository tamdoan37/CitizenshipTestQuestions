using CitizenFlowApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CitizenFlowApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (!await db.Questions.AnyAsync())       await SeedQuestionsAsync(db);
        if (!await db.FederalOfficials.AnyAsync()) await SeedFederalOfficialsAsync(db);
        if (!await db.StateOfficials.AnyAsync())   await SeedStateOfficialsAsync(db);
        if (!await db.FluencySentences.AnyAsync()) await SeedFluencySentencesAsync(db);

        await db.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────
    //  QUESTIONS  — USCIS 2008 100 Civics Questions
    //  IsStateSpecific   → patch from StateOfficials at request time
    //  IsFederalExecutive→ patch from FederalOfficials at request time
    //  IsStarredQuestion → raised SRS starting weight (frequently tested)
    // ─────────────────────────────────────────────────────────────
    private static async Task SeedQuestionsAsync(AppDbContext db)
    {
        // Helper shorthand
        static Question Q(int id, string qid, string cat, string text,
            List<string> answers,
            bool starred = false, bool stateSpecific = false, bool federalExec = false)
            => new()
            {
                Id = id, QuestionId = qid, TestVersion = "2008",
                Category = cat, QuestionText = text, FixedAnswers = answers,
                IsStarredQuestion = starred, IsStateSpecific = stateSpecific, IsFederalExecutive = federalExec
            };

        const string GOV = "AMERICAN GOVERNMENT";
        const string HIS = "AMERICAN HISTORY";
        const string CIV = "INTEGRATED CIVICS";

        var questions = new List<Question>
        {
            // ── Principles of American Democracy ──────────────────────────────
            Q(1,"Q001",GOV,"What is the supreme law of the land?",
                ["the Constitution"],starred:true),
            Q(2,"Q002",GOV,"What does the Constitution do?",
                ["sets up the government","defines the government","protects basic rights of Americans"]),
            Q(3,"Q003",GOV,"The idea of self-government is in the first three words of the Constitution. What are these words?",
                ["We the People"]),
            Q(4,"Q004",GOV,"What is an amendment?",
                ["a change to the Constitution","an addition to the Constitution"]),
            Q(5,"Q005",GOV,"What do we call the first ten amendments to the Constitution?",
                ["the Bill of Rights"],starred:true),
            Q(6,"Q006",GOV,"What is one right or freedom from the First Amendment?",
                ["speech","religion","assembly","press","petition the government"],starred:true),
            Q(7,"Q007",GOV,"How many amendments does the Constitution have?",
                ["twenty-seven","27"]),
            Q(8,"Q008",GOV,"What did the Declaration of Independence do?",
                ["announced our independence from Great Britain","declared our independence from Great Britain","said that the United States is free from Great Britain"]),
            Q(9,"Q009",GOV,"What are two rights in the Declaration of Independence?",
                ["life","liberty","pursuit of happiness"]),
            Q(10,"Q010",GOV,"What is freedom of religion?",
                ["You can practice any religion, or not practice a religion."]),
            Q(11,"Q011",GOV,"What is the economic system in the United States?",
                ["capitalist economy","market economy"]),
            Q(12,"Q012",GOV,"What is the \"rule of law\"?",
                ["Everyone must follow the law.","Leaders must obey the law.","Government must obey the law.","No one is above the law."]),

            // ── System of Government ──────────────────────────────────────────
            Q(13,"Q013",GOV,"Name one branch or part of the government.",
                ["Congress","legislative","President","executive","the courts","judicial"],starred:true),
            Q(14,"Q014",GOV,"What stops one branch of government from becoming too powerful?",
                ["checks and balances","separation of powers"]),
            Q(15,"Q015",GOV,"Who is in charge of the executive branch?",
                ["the President"]),
            Q(16,"Q016",GOV,"Who makes federal laws?",
                ["Congress","Senate and House of Representatives","the national legislature"]),
            Q(17,"Q017",GOV,"What are the two parts of the U.S. Congress?",
                ["the Senate and House of Representatives","the Senate and the House"],starred:true),
            Q(18,"Q018",GOV,"How many U.S. Senators are there?",
                ["one hundred","100"]),
            Q(19,"Q019",GOV,"We elect a U.S. Senator for how many years?",
                ["six","6"]),
            Q(20,"Q020",GOV,"Who is one of your state's U.S. Senators now?",
                [],stateSpecific:true),
            Q(21,"Q021",GOV,"The House of Representatives has how many voting members?",
                ["four hundred thirty-five","435"]),
            Q(22,"Q022",GOV,"We elect a U.S. Representative for how many years?",
                ["two","2"]),
            Q(23,"Q023",GOV,"Name your U.S. Representative.",
                [],stateSpecific:true),
            Q(24,"Q024",GOV,"Who does a U.S. Senator represent?",
                ["all people of the state"]),
            Q(25,"Q025",GOV,"Why do some states have more Representatives than other states?",
                ["because of the state's population","because they have more people","because some states have more people"]),
            Q(26,"Q026",GOV,"We elect a President for how many years?",
                ["four","4"]),
            Q(27,"Q027",GOV,"In what month do we vote for President?",
                ["November"]),
            Q(28,"Q028",GOV,"What is the name of the President of the United States now?",
                [],starred:true,federalExec:true),
            Q(29,"Q029",GOV,"What is the name of the Vice President of the United States now?",
                [],starred:true,federalExec:true),
            Q(30,"Q030",GOV,"If the President can no longer serve, who becomes President?",
                ["the Vice President"]),
            Q(31,"Q031",GOV,"If both the President and the Vice President can no longer serve, who becomes President?",
                ["the Speaker of the House"]),
            Q(32,"Q032",GOV,"Who is the Commander in Chief of the military?",
                ["the President"]),
            Q(33,"Q033",GOV,"Who signs bills to become laws?",
                ["the President"]),
            Q(34,"Q034",GOV,"Who vetoes bills?",
                ["the President"]),
            Q(35,"Q035",GOV,"What does the President's Cabinet do?",
                ["advises the President"]),
            Q(36,"Q036",GOV,"What are two Cabinet-level positions?",
                ["Secretary of Agriculture","Secretary of Commerce","Secretary of Defense",
                 "Secretary of Education","Secretary of Energy","Secretary of Health and Human Services",
                 "Secretary of Homeland Security","Secretary of Housing and Urban Development",
                 "Secretary of the Interior","Secretary of Labor","Secretary of State",
                 "Secretary of Transportation","Secretary of the Treasury","Secretary of Veterans Affairs",
                 "Attorney General","Vice President"]),
            Q(37,"Q037",GOV,"What does the judicial branch do?",
                ["reviews laws","explains laws","resolves disputes","decides if a law goes against the Constitution"]),
            Q(38,"Q038",GOV,"What is the highest court in the United States?",
                ["the Supreme Court"],starred:true),
            Q(39,"Q039",GOV,"How many justices are on the Supreme Court?",
                ["nine","9"]),
            Q(40,"Q040",GOV,"Who is the Chief Justice of the United States now?",
                [],federalExec:true),
            Q(41,"Q041",GOV,"Under our Constitution, some powers belong to the federal government. What is one power of the federal government?",
                ["to print money","to declare war","to create an army","to make treaties"]),
            Q(42,"Q042",GOV,"Under our Constitution, some powers belong to the states. What is one power of the states?",
                ["provide schooling and education","provide protection (police)","provide safety (fire departments)","give a driver's license","approve zoning and land use"]),
            Q(43,"Q043",GOV,"Who is the Governor of your state now?",
                [],stateSpecific:true),
            Q(44,"Q044",GOV,"What is the capital of your state?",
                [],stateSpecific:true),
            Q(45,"Q045",GOV,"What are the two major political parties in the United States?",
                ["Democratic and Republican"],starred:true),

            // ── Rights and Responsibilities ────────────────────────────────────
            Q(46,"Q046",GOV,"What is the political party of the President now?",
                [],federalExec:true),
            Q(47,"Q047",GOV,"What is the name of the Speaker of the House of Representatives now?",
                [],starred:true,federalExec:true),
            Q(48,"Q048",GOV,"There are four amendments to the Constitution about who can vote. Describe one of them.",
                ["Citizens eighteen (18) and older can vote.",
                 "You don't have to pay a poll tax to vote.",
                 "Any citizen can vote. (Women and men can vote.)",
                 "A male citizen of any race can vote."]),
            Q(49,"Q049",GOV,"What is one responsibility that is only for United States citizens?",
                ["serve on a jury","vote in a federal election"]),
            Q(50,"Q050",GOV,"Name one right only for United States citizens.",
                ["vote in a federal election","run for federal office"]),
            Q(51,"Q051",GOV,"What are two rights of everyone living in the United States?",
                ["freedom of expression","freedom of speech","freedom of assembly",
                 "freedom to petition the government","freedom of religion","the right to bear arms"]),
            Q(52,"Q052",GOV,"Who do we show loyalty to when we say the Pledge of Allegiance?",
                ["the United States","the flag"]),
            Q(53,"Q053",GOV,"What is one promise you make when you become a United States citizen?",
                ["give up loyalty to other countries","defend the Constitution and laws of the United States",
                 "obey the laws of the United States","serve in the U.S. military (if needed)",
                 "serve the nation (if needed)","be loyal to the United States"]),
            Q(54,"Q054",GOV,"How old do citizens have to be to vote for President?",
                ["eighteen (18) and older"]),
            Q(55,"Q055",GOV,"What are two ways that Americans can participate in their democracy?",
                ["vote","join a political party","help with a campaign","join a civic group",
                 "join a community group","give an elected official your opinion on an issue",
                 "call Senators and Representatives","publicly support or oppose an issue or policy",
                 "run for office","write to a newspaper"]),
            Q(56,"Q056",GOV,"When is the last day you can send in federal income tax forms?",
                ["April 15"]),
            Q(57,"Q057",GOV,"When must all men register for the Selective Service?",
                ["at age eighteen (18)","between eighteen (18) and twenty-six (26)"]),

            // ── Colonial Period and Independence ───────────────────────────────
            Q(58,"Q058",HIS,"What is one reason colonists came to America?",
                ["freedom","political liberty","religious freedom","economic opportunity",
                 "practice their religion","escape persecution"]),
            Q(59,"Q059",HIS,"Who lived in America before the Europeans arrived?",
                ["American Indians","Native Americans"]),
            Q(60,"Q060",HIS,"What group of people was taken to America and sold as slaves?",
                ["Africans","people from Africa"]),
            Q(61,"Q061",HIS,"Why did the colonists fight the British?",
                ["because of high taxes (taxation without representation)",
                 "because the British army stayed in their houses (boarding, quartering)",
                 "because they didn't have self-government"]),
            Q(62,"Q062",HIS,"Who wrote the Declaration of Independence?",
                ["(Thomas) Jefferson"],starred:true),
            Q(63,"Q063",HIS,"When was the Declaration of Independence adopted?",
                ["July 4, 1776"],starred:true),
            Q(64,"Q064",HIS,"There were 13 original states. Name three.",
                ["New Hampshire","Massachusetts","Rhode Island","Connecticut","New York",
                 "New Jersey","Pennsylvania","Delaware","Maryland","Virginia",
                 "North Carolina","South Carolina","Georgia"]),
            Q(65,"Q065",HIS,"What happened at the Constitutional Convention?",
                ["The Constitution was written.","The Founding Fathers wrote the Constitution."]),
            Q(66,"Q066",HIS,"When was the Constitution written?",
                ["1787"]),
            Q(67,"Q067",HIS,"The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.",
                ["(James) Madison","(Alexander) Hamilton","(John) Jay","Publius"]),
            Q(68,"Q068",HIS,"What is one thing Benjamin Franklin is famous for?",
                ["U.S. diplomat","oldest member of the Constitutional Convention",
                 "first Postmaster General of the United States",
                 "writer of Poor Richard's Almanac","started the first free libraries"]),
            Q(69,"Q069",HIS,"Who is the \"Father of Our Country\"?",
                ["(George) Washington"],starred:true),
            Q(70,"Q070",HIS,"Who was the first President?",
                ["(George) Washington"],starred:true),

            // ── 1800s ─────────────────────────────────────────────────────────
            Q(71,"Q071",HIS,"What territory did the United States buy from France in 1803?",
                ["the Louisiana Territory","Louisiana"]),
            Q(72,"Q072",HIS,"Name one war fought by the United States in the 1800s.",
                ["War of 1812","Mexican-American War","Civil War","Spanish-American War"]),
            Q(73,"Q073",HIS,"Name the U.S. war between the North and the South.",
                ["the Civil War","the War between the States"]),
            Q(74,"Q074",HIS,"Name one problem that led to the Civil War.",
                ["slavery","economic reasons","states' rights"]),
            Q(75,"Q075",HIS,"What was one important thing that Abraham Lincoln did?",
                ["freed the slaves (Emancipation Proclamation)","saved (or preserved) the Union",
                 "led the United States during the Civil War"],starred:true),
            Q(76,"Q076",HIS,"What did the Emancipation Proclamation do?",
                ["freed the slaves","freed slaves in the Confederacy",
                 "freed slaves in the Confederate states","freed slaves in most Southern states"]),
            Q(77,"Q077",HIS,"What did Susan B. Anthony do?",
                ["fought for women's rights","fought for civil rights"]),

            // ── Recent American History ────────────────────────────────────────
            Q(78,"Q078",HIS,"Name one war fought by the United States in the 1900s.",
                ["World War I","World War II","Korean War","Vietnam War","(Persian) Gulf War"]),
            Q(79,"Q079",HIS,"Who was President during World War I?",
                ["(Woodrow) Wilson"]),
            Q(80,"Q080",HIS,"Who was President during the Great Depression and World War II?",
                ["(Franklin) Roosevelt"]),
            Q(81,"Q081",HIS,"Who did the United States fight in World War II?",
                ["Japan, Germany, and Italy"]),
            Q(82,"Q082",HIS,"Before he was President, Eisenhower was a general. What war was he in?",
                ["World War II"]),
            Q(83,"Q083",HIS,"During the Cold War, what was the main concern of the United States?",
                ["Communism"]),
            Q(84,"Q084",HIS,"What movement tried to end racial discrimination?",
                ["civil rights (movement)"]),
            Q(85,"Q085",HIS,"What did Martin Luther King, Jr. do?",
                ["fought for civil rights","worked for equality for all Americans"]),
            Q(86,"Q086",HIS,"What major event happened on September 11, 2001 in the United States?",
                ["Terrorists attacked the United States."]),
            Q(87,"Q087",HIS,"Name one American Indian tribe in the United States.",
                ["Cherokee","Navajo","Sioux","Chippewa","Choctaw","Pueblo","Apache","Iroquois",
                 "Creek","Blackfeet","Seminole","Cheyenne","Arawak","Shawnee","Mohegan","Huron",
                 "Oneida","Lakota","Crow","Teton","Hopi","Inuit"]),

            // ── Geography ─────────────────────────────────────────────────────
            Q(88,"Q088",CIV,"Name one of the two longest rivers in the United States.",
                ["Missouri River","Mississippi River"]),
            Q(89,"Q089",CIV,"What ocean is on the West Coast of the United States?",
                ["Pacific Ocean"]),
            Q(90,"Q090",CIV,"What ocean is on the East Coast of the United States?",
                ["Atlantic Ocean"]),
            Q(91,"Q091",CIV,"Name one U.S. territory.",
                ["Puerto Rico","U.S. Virgin Islands","American Samoa","Northern Mariana Islands","Guam"]),
            Q(92,"Q092",CIV,"Name one state that borders Canada.",
                ["Maine","New Hampshire","Vermont","New York","Pennsylvania","Ohio","Michigan",
                 "Minnesota","North Dakota","Montana","Idaho","Washington","Alaska"]),
            Q(93,"Q093",CIV,"Name one state that borders Mexico.",
                ["California","Arizona","New Mexico","Texas"]),
            Q(94,"Q094",CIV,"What is the capital of the United States?",
                ["Washington, D.C."],starred:true),
            Q(95,"Q095",CIV,"Where is the Statue of Liberty?",
                ["New York (Harbor)","Liberty Island","New Jersey","near New York City","on the Hudson River"]),

            // ── Symbols ───────────────────────────────────────────────────────
            Q(96,"Q096",CIV,"Why does the flag have 13 stripes?",
                ["because there were 13 original colonies","because the stripes represent the original colonies"]),
            Q(97,"Q097",CIV,"Why does the flag have 50 stars?",
                ["because there is one star for each state","because each star represents a state","because there are 50 states"]),
            Q(98,"Q098",CIV,"What is the name of the national anthem?",
                ["The Star-Spangled Banner"],starred:true),

            // ── Holidays ──────────────────────────────────────────────────────
            Q(99,"Q099",CIV,"What do we call the first 10 amendments to the Constitution?",
                ["the Bill of Rights"]),
            Q(100,"Q100",CIV,"Name two national U.S. holidays.",
                ["New Year's Day","Martin Luther King, Jr. Day","Presidents' Day","Memorial Day",
                 "Independence Day","Labor Day","Columbus Day","Veterans Day","Thanksgiving","Christmas"]),
        };

        await db.Questions.AddRangeAsync(questions);
    }

    // ─────────────────────────────────────────────────────────────
    //  FEDERAL OFFICIALS  (update via Admin API after elections)
    // ─────────────────────────────────────────────────────────────
    private static async Task SeedFederalOfficialsAsync(AppDbContext db)
    {
        await db.FederalOfficials.AddRangeAsync(
            new FederalOfficial { Title = "President",       Name = "Donald J. Trump",       Party = "Republican" },
            new FederalOfficial { Title = "VicePresident",   Name = "JD Vance",              Party = "Republican" },
            new FederalOfficial { Title = "SpeakerOfHouse",  Name = "Mike Johnson",          Party = "Republican" },
            new FederalOfficial { Title = "ChiefJustice",    Name = "John G. Roberts, Jr.",  Party = "" }
        );
    }

    // ─────────────────────────────────────────────────────────────
    //  STATE OFFICIALS  (all 50 states — update via Admin API)
    // ─────────────────────────────────────────────────────────────
    private static async Task SeedStateOfficialsAsync(AppDbContext db)
    {
        static StateOfficial S(string code, string name, string capital, string gov, string s1, string s2)
            => new() { StateCode = code, StateName = name, Capital = capital, Governor = gov, Senators = [s1, s2] };

        await db.StateOfficials.AddRangeAsync(
            S("AL","Alabama",          "Montgomery",    "Kay Ivey",                    "Tommy Tuberville",       "Katie Britt"),
            S("AK","Alaska",           "Juneau",        "Mike Dunleavy",               "Lisa Murkowski",         "Dan Sullivan"),
            S("AZ","Arizona",          "Phoenix",       "Katie Hobbs",                 "Mark Kelly",             "Ruben Gallego"),
            S("AR","Arkansas",         "Little Rock",   "Sarah Huckabee Sanders",      "John Boozman",           "Tom Cotton"),
            S("CA","California",       "Sacramento",    "Gavin Newsom",                "Adam Schiff",            "Alex Padilla"),
            S("CO","Colorado",         "Denver",        "Jared Polis",                 "Michael Bennet",         "John Hickenlooper"),
            S("CT","Connecticut",      "Hartford",      "Ned Lamont",                  "Chris Murphy",           "Richard Blumenthal"),
            S("DE","Delaware",         "Dover",         "Matt Meyer",                  "Chris Coons",            "Lisa Blunt Rochester"),
            S("FL","Florida",          "Tallahassee",   "Ron DeSantis",                "Rick Scott",             "Ashley Moody"),
            S("GA","Georgia",          "Atlanta",       "Brian Kemp",                  "Jon Ossoff",             "Raphael Warnock"),
            S("HI","Hawaii",           "Honolulu",      "Josh Green",                  "Brian Schatz",           "Mazie Hirono"),
            S("ID","Idaho",            "Boise",         "Brad Little",                 "Mike Crapo",             "Jim Risch"),
            S("IL","Illinois",         "Springfield",   "JB Pritzker",                 "Dick Durbin",            "Tammy Duckworth"),
            S("IN","Indiana",          "Indianapolis",  "Mike Braun",                  "Todd Young",             "Jim Banks"),
            S("IA","Iowa",             "Des Moines",    "Kim Reynolds",                "Chuck Grassley",         "Joni Ernst"),
            S("KS","Kansas",           "Topeka",        "Laura Kelly",                 "Jerry Moran",            "Roger Marshall"),
            S("KY","Kentucky",         "Frankfort",     "Andy Beshear",                "Mitch McConnell",        "Rand Paul"),
            S("LA","Louisiana",        "Baton Rouge",   "Jeff Landry",                 "Bill Cassidy",           "John Kennedy"),
            S("ME","Maine",            "Augusta",       "Janet Mills",                 "Susan Collins",          "Angus King"),
            S("MD","Maryland",         "Annapolis",     "Wes Moore",                   "Chris Van Hollen",       "Angela Alsobrooks"),
            S("MA","Massachusetts",    "Boston",        "Maura Healey",                "Elizabeth Warren",       "Ed Markey"),
            S("MI","Michigan",         "Lansing",       "Gretchen Whitmer",            "Gary Peters",            "Elissa Slotkin"),
            S("MN","Minnesota",        "Saint Paul",    "Tim Walz",                    "Amy Klobuchar",          "Tina Smith"),
            S("MS","Mississippi",      "Jackson",       "Tate Reeves",                 "Roger Wicker",           "Cindy Hyde-Smith"),
            S("MO","Missouri",         "Jefferson City","Mike Kehoe",                  "Josh Hawley",            "Eric Schmitt"),
            S("MT","Montana",          "Helena",        "Greg Gianforte",              "Steve Daines",           "Tim Sheehy"),
            S("NE","Nebraska",         "Lincoln",       "Jim Pillen",                  "Pete Ricketts",          "Deb Fischer"),
            S("NV","Nevada",           "Carson City",   "Joe Lombardo",                "Catherine Cortez Masto", "Jacky Rosen"),
            S("NH","New Hampshire",    "Concord",       "Kelly Ayotte",                "Jeanne Shaheen",         "Maggie Hassan"),
            S("NJ","New Jersey",       "Trenton",       "Jon Bramnick",                "Andy Kim",               "Cory Booker"),
            S("NM","New Mexico",       "Santa Fe",      "Michelle Lujan Grisham",      "Martin Heinrich",        "Ben Ray Luján"),
            S("NY","New York",         "Albany",        "Kathy Hochul",                "Chuck Schumer",          "Kirsten Gillibrand"),
            S("NC","North Carolina",   "Raleigh",       "Josh Stein",                  "Thom Tillis",            "Ted Budd"),
            S("ND","North Dakota",     "Bismarck",      "Kelly Armstrong",             "John Hoeven",            "Kevin Cramer"),
            S("OH","Ohio",             "Columbus",      "Mike DeWine",                 "Bernie Moreno",          "Jon Husted"),
            S("OK","Oklahoma",         "Oklahoma City", "Kevin Stitt",                 "James Lankford",         "Markwayne Mullin"),
            S("OR","Oregon",           "Salem",         "Tina Kotek",                  "Ron Wyden",              "Jeff Merkley"),
            S("PA","Pennsylvania",     "Harrisburg",    "Josh Shapiro",                "John Fetterman",         "Dave McCormick"),
            S("RI","Rhode Island",     "Providence",    "Dan McKee",                   "Jack Reed",              "Sheldon Whitehouse"),
            S("SC","South Carolina",   "Columbia",      "Henry McMaster",              "Lindsey Graham",         "Tim Scott"),
            S("SD","South Dakota",     "Pierre",        "Kristi Noem",                 "John Thune",             "Mike Rounds"),
            S("TN","Tennessee",        "Nashville",     "Bill Lee",                    "Marsha Blackburn",       "Bill Hagerty"),
            S("TX","Texas",            "Austin",        "Greg Abbott",                 "John Cornyn",            "Ted Cruz"),
            S("UT","Utah",             "Salt Lake City","Spencer Cox",                 "Mike Lee",               "John Curtis"),
            S("VT","Vermont",          "Montpelier",    "Phil Scott",                  "Bernie Sanders",         "Peter Welch"),
            S("VA","Virginia",         "Richmond",      "Glenn Youngkin",              "Mark Warner",            "Tim Kaine"),
            S("WA","Washington",       "Olympia",       "Bob Ferguson",                "Patty Murray",           "Maria Cantwell"),
            S("WV","West Virginia",    "Charleston",    "Patrick Morrisey",            "Shelley Moore Capito",   "Jim Justice"),
            S("WI","Wisconsin",        "Madison",       "Tony Evers",                  "Tammy Baldwin",          "Ron Johnson"),
            S("WY","Wyoming",          "Cheyenne",      "Mark Gordon",                 "John Barrasso",          "Cynthia Lummis")
        );
    }

    // ─────────────────────────────────────────────────────────────
    //  FLUENCY SENTENCES  (USCIS reading / writing test vocabulary)
    // ─────────────────────────────────────────────────────────────
    private static async Task SeedFluencySentencesAsync(AppDbContext db)
    {
        static FluencySentence F(string type, string text, List<string> vocab)
            => new() { ExerciseType = type, SentenceText = text, CoreVocabulary = vocab };

        await db.FluencySentences.AddRangeAsync(
            // Reading
            F("reading","The flag is red, white, and blue.",["flag","red","white","blue"]),
            F("reading","The President lives in the White House.",["President","White House"]),
            F("reading","Congress makes the laws in the United States.",["Congress","laws","United States"]),
            F("reading","Citizens have the right to vote.",["Citizens","right","vote"]),
            F("reading","George Washington was the first President.",["George Washington","first","President"]),
            F("reading","The Constitution is the supreme law of the land.",["Constitution","supreme","law"]),
            F("reading","There are one hundred senators in Congress.",["senators","Congress"]),
            F("reading","The Bill of Rights protects the freedoms of Americans.",["Bill of Rights","freedoms","Americans"]),
            F("reading","Independence Day is on July fourth.",["Independence Day","July fourth"]),
            F("reading","The Supreme Court is the highest court in the United States.",["Supreme Court","highest court"]),
            F("reading","The Declaration of Independence was adopted on July 4, 1776.",["Declaration of Independence","adopted","1776"]),
            F("reading","Checks and balances prevent any branch of government from becoming too powerful.",["Checks and balances","branch","government"]),
            F("reading","The Emancipation Proclamation freed the slaves in the Confederate states.",["Emancipation Proclamation","freed","Confederate states"]),
            F("reading","The First Amendment protects freedom of speech, religion, and the press.",["First Amendment","freedom of speech","religion","press"]),
            F("reading","The United States fought against Japan, Germany, and Italy in World War II.",["Japan","Germany","Italy","World War II"]),
            // Writing
            F("writing","I want to be a citizen.",["citizen"]),
            F("writing","He has a big dog.",[]),
            F("writing","She came here today.",[]),
            F("writing","The people vote in November.",["vote","November"]),
            F("writing","I pay my taxes.",["taxes"]),
            F("writing","Washington, D.C. is the capital of the United States.",["Washington D.C.","capital"]),
            F("writing","The President signs bills to become laws.",["President","bills","laws"]),
            F("writing","All people want to be free.",["free"]),
            F("writing","Abraham Lincoln was a great President.",["Abraham Lincoln","President"]),
            F("writing","Citizens must obey the laws.",["Citizens","obey","laws"]),
            F("writing","The Civil War was fought between the North and the South.",["Civil War","North","South"]),
            F("writing","The government is made up of three branches.",["government","three branches"]),
            F("writing","American citizens have the right to freedom of speech.",["citizens","freedom of speech"])
        );
    }
}
