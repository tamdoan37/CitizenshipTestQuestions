using CitizenFlowApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CitizenFlowApi.Data;

public static class DbSeeder
{
    private const string CurrentTestVersion = "2025";

    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        // Reseed questions if empty or if the stored set is a different test
        // version (e.g. upgrading an existing 2008 database to the 2025 test).
        var hasCurrent = await db.Questions.AnyAsync(q => q.TestVersion == CurrentTestVersion);
        if (!hasCurrent)
        {
            var stale = await db.Questions.ToListAsync();
            if (stale.Count > 0)
            {
                db.Questions.RemoveRange(stale);
                await db.SaveChangesAsync(); // commit deletes before re-inserting (avoids PK/index clash)
            }
            await SeedQuestionsAsync(db);
        }

        if (!await db.FederalOfficials.AnyAsync()) await SeedFederalOfficialsAsync(db);
        if (!await db.StateOfficials.AnyAsync())   await SeedStateOfficialsAsync(db);
        if (!await db.FluencySentences.AnyAsync()) await SeedFluencySentencesAsync(db);

        await db.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────
    //  QUESTIONS  — USCIS 2020 version (128 Civics Questions)
    //  Required for N-400 applications received on/after Oct 20, 2025.
    //  Officer asks up to 20 questions; applicant must answer 12 correctly.
    //  IsStateSpecific    → patch from StateOfficials at request time
    //  IsFederalExecutive → patch from FederalOfficials at request time
    //  IsStarredQuestion  → 65/20 special-consideration questions (asterisked)
    // ─────────────────────────────────────────────────────────────
    private static async Task SeedQuestionsAsync(AppDbContext db)
    {
        // Helper shorthand
        static Question Q(int id, string cat, string text,
            List<string> answers,
            bool starred = false, bool stateSpecific = false, bool federalExec = false)
            => new()
            {
                Id = id, QuestionId = $"Q{id:D3}", TestVersion = "2025",
                Category = cat, QuestionText = text, FixedAnswers = answers,
                IsStarredQuestion = starred, IsStateSpecific = stateSpecific, IsFederalExecutive = federalExec
            };

        const string GOV = "AMERICAN GOVERNMENT";
        const string HIS = "AMERICAN HISTORY";
        const string SYM = "SYMBOLS AND HOLIDAYS";

        var questions = new List<Question>
        {
            // ══ AMERICAN GOVERNMENT — A: Principles of American Government ══════
            Q(1,GOV,"What is the form of government of the United States?",
                ["Republic","Constitution-based federal republic","Representative democracy"]),
            Q(2,GOV,"What is the supreme law of the land?",
                ["(U.S.) Constitution"],starred:true),
            Q(3,GOV,"Name one thing the U.S. Constitution does.",
                ["Forms the government","Defines powers of government","Defines the parts of government","Protects the rights of the people"]),
            Q(4,GOV,"The U.S. Constitution starts with the words \"We the People.\" What does \"We the People\" mean?",
                ["Self-government","Popular sovereignty","Consent of the governed","People should govern themselves","(Example of) social contract"]),
            Q(5,GOV,"How are changes made to the U.S. Constitution?",
                ["Amendments","The amendment process"]),
            Q(6,GOV,"What does the Bill of Rights protect?",
                ["(The basic) rights of Americans","(The basic) rights of people living in the United States"]),
            Q(7,GOV,"How many amendments does the U.S. Constitution have?",
                ["Twenty-seven (27)"],starred:true),
            Q(8,GOV,"Why is the Declaration of Independence important?",
                ["It says America is free from British control.","It says all people are created equal.","It identifies inherent rights.","It identifies individual freedoms."]),
            Q(9,GOV,"What founding document said the American colonies were free from Britain?",
                ["Declaration of Independence"]),
            Q(10,GOV,"Name two important ideas from the Declaration of Independence and the U.S. Constitution.",
                ["Equality","Liberty","Social contract","Natural rights","Limited government","Self-government"]),
            Q(11,GOV,"The words \"Life, Liberty, and the pursuit of Happiness\" are in what founding document?",
                ["Declaration of Independence"]),
            Q(12,GOV,"What is the economic system of the United States?",
                ["Capitalism","Free market economy"],starred:true),
            Q(13,GOV,"What is the rule of law?",
                ["Everyone must follow the law.","Leaders must obey the law.","Government must obey the law.","No one is above the law."]),
            Q(14,GOV,"Many documents influenced the U.S. Constitution. Name one.",
                ["Declaration of Independence","Articles of Confederation","Federalist Papers","Anti-Federalist Papers",
                 "Virginia Declaration of Rights","Fundamental Orders of Connecticut","Mayflower Compact","Iroquois Great Law of Peace"]),
            Q(15,GOV,"There are three branches of government. Why?",
                ["So one part does not become too powerful","Checks and balances","Separation of powers"]),

            // ══ AMERICAN GOVERNMENT — B: System of Government ══════════════════
            Q(16,GOV,"Name the three branches of government.",
                ["Legislative, executive, and judicial","Congress, president, and the courts"]),
            Q(17,GOV,"The President of the United States is in charge of which branch of government?",
                ["Executive branch"]),
            Q(18,GOV,"What part of the federal government writes laws?",
                ["(U.S.) Congress","(U.S. or national) legislature","Legislative branch"]),
            Q(19,GOV,"What are the two parts of the U.S. Congress?",
                ["Senate and House (of Representatives)"]),
            Q(20,GOV,"Name one power of the U.S. Congress.",
                ["Writes laws","Declares war","Makes the federal budget"],starred:true),
            Q(21,GOV,"How many U.S. senators are there?",
                ["One hundred (100)"]),
            Q(22,GOV,"How long is a term for a U.S. senator?",
                ["Six (6) years"]),
            Q(23,GOV,"Who is one of your state's U.S. senators now?",
                [],stateSpecific:true),
            Q(24,GOV,"How many voting members are in the House of Representatives?",
                ["Four hundred thirty-five (435)"]),
            Q(25,GOV,"How long is a term for a member of the House of Representatives?",
                ["Two (2) years"]),
            Q(26,GOV,"Why do U.S. representatives serve shorter terms than U.S. senators?",
                ["To more closely follow public opinion"]),
            Q(27,GOV,"How many senators does each state have?",
                ["Two (2)"]),
            Q(28,GOV,"Why does each state have two senators?",
                ["Equal representation (for small states)","The Great Compromise (Connecticut Compromise)"]),
            Q(29,GOV,"Name your U.S. representative.",
                [],stateSpecific:true),
            Q(30,GOV,"What is the name of the Speaker of the House of Representatives now?",
                [],starred:true,federalExec:true),
            Q(31,GOV,"Who does a U.S. senator represent?",
                ["Citizens of their state"]),
            Q(32,GOV,"Who elects U.S. senators?",
                ["Citizens from their state"]),
            Q(33,GOV,"Who does a member of the House of Representatives represent?",
                ["Citizens in their (congressional) district","Citizens in their district"]),
            Q(34,GOV,"Who elects members of the House of Representatives?",
                ["Citizens from their (congressional) district"]),
            Q(35,GOV,"Some states have more representatives than other states. Why?",
                ["(Because of) the state's population","(Because) they have more people","(Because) some states have more people"]),
            Q(36,GOV,"The President of the United States is elected for how many years?",
                ["Four (4) years"],starred:true),
            Q(37,GOV,"The President of the United States can serve only two terms. Why?",
                ["(Because of) the 22nd Amendment","To keep the president from becoming too powerful"]),
            Q(38,GOV,"What is the name of the President of the United States now?",
                [],starred:true,federalExec:true),
            Q(39,GOV,"What is the name of the Vice President of the United States now?",
                [],starred:true,federalExec:true),
            Q(40,GOV,"If the president can no longer serve, who becomes president?",
                ["The Vice President (of the United States)"]),
            Q(41,GOV,"Name one power of the president.",
                ["Signs bills into law","Vetoes bills","Enforces laws","Commander in Chief (of the military)","Chief diplomat"]),
            Q(42,GOV,"Who is Commander in Chief of the U.S. military?",
                ["The President (of the United States)"]),
            Q(43,GOV,"Who signs bills to become laws?",
                ["The President (of the United States)"]),
            Q(44,GOV,"Who vetoes bills?",
                ["The President (of the United States)"],starred:true),
            Q(45,GOV,"Who appoints federal judges?",
                ["The President (of the United States)"]),
            Q(46,GOV,"The executive branch has many parts. Name one.",
                ["President (of the United States)","Cabinet","Federal departments and agencies"]),
            Q(47,GOV,"What does the President's Cabinet do?",
                ["Advises the President (of the United States)"]),
            Q(48,GOV,"What are two Cabinet-level positions?",
                ["Attorney General","Secretary of Agriculture","Secretary of Commerce","Secretary of Defense",
                 "Secretary of Education","Secretary of Energy","Secretary of Health and Human Services",
                 "Secretary of Homeland Security","Secretary of Housing and Urban Development","Secretary of the Interior",
                 "Secretary of Labor","Secretary of State","Secretary of Transportation","Secretary of the Treasury",
                 "Secretary of Veterans Affairs","Vice President (of the United States)"]),
            Q(49,GOV,"Why is the Electoral College important?",
                ["It decides who is elected president.","It provides a compromise between the popular election of the president and congressional selection."]),
            Q(50,GOV,"What is one part of the judicial branch?",
                ["Supreme Court","Federal Courts"]),
            Q(51,GOV,"What does the judicial branch do?",
                ["Reviews laws","Explains laws","Resolves disputes (disagreements) about the law","Decides if a law goes against the (U.S.) Constitution"]),
            Q(52,GOV,"What is the highest court in the United States?",
                ["Supreme Court"],starred:true),
            Q(53,GOV,"How many seats are on the Supreme Court?",
                ["Nine (9)"]),
            Q(54,GOV,"How many Supreme Court justices are usually needed to decide a case?",
                ["Five (5)"]),
            Q(55,GOV,"How long do Supreme Court justices serve?",
                ["(For) life","Lifetime appointment","(Until) retirement"]),
            Q(56,GOV,"Supreme Court justices serve for life. Why?",
                ["To be independent (of politics)","To limit outside (political) influence"]),
            Q(57,GOV,"Who is the Chief Justice of the United States now?",
                [],federalExec:true),
            Q(58,GOV,"Name one power that is only for the federal government.",
                ["Print paper money","Mint coins","Declare war","Create an army","Make treaties","Set foreign policy"]),
            Q(59,GOV,"Name one power that is only for the states.",
                ["Provide schooling and education","Provide protection (police)","Provide safety (fire departments)","Give a driver's license","Approve zoning and land use"]),
            Q(60,GOV,"What is the purpose of the 10th Amendment?",
                ["(It states that the) powers not given to the federal government belong to the states or to the people."]),
            Q(61,GOV,"Who is the governor of your state now?",
                [],starred:true,stateSpecific:true),
            Q(62,GOV,"What is the capital of your state?",
                [],stateSpecific:true),

            // ══ AMERICAN GOVERNMENT — C: Rights and Responsibilities ══════════
            Q(63,GOV,"There are four amendments to the U.S. Constitution about who can vote. Describe one of them.",
                ["Citizens eighteen (18) and older (can vote).","You don't have to pay (a poll tax) to vote.",
                 "Any citizen can vote. (Women and men can vote.)","A male citizen of any race (can vote)."]),
            Q(64,GOV,"Who can vote in federal elections, run for federal office, and serve on a jury in the United States?",
                ["Citizens","Citizens of the United States","U.S. citizens"]),
            Q(65,GOV,"What are three rights of everyone living in the United States?",
                ["Freedom of expression","Freedom of speech","Freedom of assembly","Freedom to petition the government","Freedom of religion","The right to bear arms"]),
            Q(66,GOV,"What do we show loyalty to when we say the Pledge of Allegiance?",
                ["The United States","The flag"],starred:true),
            Q(67,GOV,"Name two promises that new citizens make in the Oath of Allegiance.",
                ["Give up loyalty to other countries","Defend the (U.S.) Constitution","Obey the laws of the United States",
                 "Serve in the military (if needed)","Serve (help, do important work for) the nation (if needed)","Be loyal to the United States"]),
            Q(68,GOV,"How can people become United States citizens?",
                ["Naturalize","Derive citizenship","Be born in the United States"]),
            Q(69,GOV,"What are two examples of civic participation in the United States?",
                ["Vote","Run for office","Join a political party","Help with a campaign","Join a civic group","Join a community group",
                 "Give an elected official your opinion (on an issue)","Contact elected officials","Support or oppose an issue or policy","Write to a newspaper"]),
            Q(70,GOV,"What is one way Americans can serve their country?",
                ["Vote","Pay taxes","Obey the law","Serve in the military","Run for office","Work for local, state, or federal government"]),
            Q(71,GOV,"Why is it important to pay federal taxes?",
                ["Required by law","All people pay to fund the federal government","Required by the (U.S.) Constitution (16th Amendment)","Civic duty"]),
            Q(72,GOV,"It is important for all men age 18 through 25 to register for the Selective Service. Name one reason why.",
                ["Required by law","Civic duty","Makes the draft fair, if needed"]),

            // ══ AMERICAN HISTORY — A: Colonial Period and Independence ═════════
            Q(73,HIS,"The colonists came to America for many reasons. Name one.",
                ["Freedom","Political liberty","Religious freedom","Economic opportunity","Escape persecution"]),
            Q(74,HIS,"Who lived in America before the Europeans arrived?",
                ["American Indians","Native Americans"],starred:true),
            Q(75,HIS,"What group of people was taken and sold as slaves?",
                ["Africans","People from Africa"]),
            Q(76,HIS,"What war did the Americans fight to win independence from Britain?",
                ["American Revolution","The (American) Revolutionary War","War for (American) Independence"]),
            Q(77,HIS,"Name one reason why the Americans declared independence from Britain.",
                ["High taxes","Taxation without representation","British soldiers stayed in Americans' houses (boarding, quartering)",
                 "They did not have self-government","Boston Massacre","Boston Tea Party (Tea Act)","Stamp Act","Sugar Act","Townshend Acts","Intolerable (Coercive) Acts"]),
            Q(78,HIS,"Who wrote the Declaration of Independence?",
                ["(Thomas) Jefferson"],starred:true),
            Q(79,HIS,"When was the Declaration of Independence adopted?",
                ["July 4, 1776"]),
            Q(80,HIS,"The American Revolution had many important events. Name one.",
                ["(Battle of) Bunker Hill","Declaration of Independence","Washington Crossing the Delaware (Battle of Trenton)",
                 "(Battle of) Saratoga","Valley Forge (Encampment)","(Battle of) Yorktown (British surrender at Yorktown)"]),
            Q(81,HIS,"There were 13 original states. Name five.",
                ["New Hampshire","Massachusetts","Rhode Island","Connecticut","New York","New Jersey","Pennsylvania",
                 "Delaware","Maryland","Virginia","North Carolina","South Carolina","Georgia"]),
            Q(82,HIS,"What founding document was written in 1787?",
                ["(U.S.) Constitution"]),
            Q(83,HIS,"The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.",
                ["(James) Madison","(Alexander) Hamilton","(John) Jay","Publius"]),
            Q(84,HIS,"Why were the Federalist Papers important?",
                ["They helped people understand the (U.S.) Constitution.","They supported passing the (U.S.) Constitution."]),
            Q(85,HIS,"Benjamin Franklin is famous for many things. Name one.",
                ["Founded the first free public libraries","First Postmaster General of the United States","Helped write the Declaration of Independence","Inventor","U.S. diplomat"]),
            Q(86,HIS,"George Washington is famous for many things. Name one.",
                ["\"Father of Our Country\"","First president of the United States","General of the Continental Army","President of the Constitutional Convention"],starred:true),
            Q(87,HIS,"Thomas Jefferson is famous for many things. Name one.",
                ["Writer of the Declaration of Independence","Third president of the United States","Doubled the size of the United States (Louisiana Purchase)",
                 "First Secretary of State","Founded the University of Virginia","Writer of the Virginia Statute on Religious Freedom"]),
            Q(88,HIS,"James Madison is famous for many things. Name one.",
                ["\"Father of the Constitution\"","Fourth president of the United States","President during the War of 1812","One of the writers of the Federalist Papers"]),
            Q(89,HIS,"Alexander Hamilton is famous for many things. Name one.",
                ["First Secretary of the Treasury","One of the writers of the Federalist Papers","Helped establish the First Bank of the United States",
                 "Aide to General George Washington","Member of the Continental Congress"]),

            // ══ AMERICAN HISTORY — B: 1800s ═══════════════════════════════════
            Q(90,HIS,"What territory did the United States buy from France in 1803?",
                ["Louisiana Territory","Louisiana"]),
            Q(91,HIS,"Name one war fought by the United States in the 1800s.",
                ["War of 1812","Mexican-American War","Civil War","Spanish-American War"]),
            Q(92,HIS,"Name the U.S. war between the North and the South.",
                ["The Civil War"]),
            Q(93,HIS,"The Civil War had many important events. Name one.",
                ["(Battle of) Fort Sumter","Emancipation Proclamation","(Battle of) Vicksburg","(Battle of) Gettysburg",
                 "Sherman's March","(Surrender at) Appomattox","(Battle of) Antietam/Sharpsburg","Lincoln was assassinated."]),
            Q(94,HIS,"Abraham Lincoln is famous for many things. Name one.",
                ["Freed the slaves (Emancipation Proclamation)","Saved (or preserved) the Union","Led the United States during the Civil War",
                 "16th president of the United States","Delivered the Gettysburg Address"],starred:true),
            Q(95,HIS,"What did the Emancipation Proclamation do?",
                ["Freed the slaves","Freed slaves in the Confederacy","Freed slaves in the Confederate states","Freed slaves in most Southern states"]),
            Q(96,HIS,"What U.S. war ended slavery?",
                ["The Civil War"]),
            Q(97,HIS,"What amendment gives citizenship to all persons born in the United States?",
                ["14th Amendment"]),
            Q(98,HIS,"When did all men get the right to vote?",
                ["After the Civil War","During Reconstruction","(With the) 15th Amendment","1870"]),
            Q(99,HIS,"Name one leader of the women's rights movement in the 1800s.",
                ["Susan B. Anthony","Elizabeth Cady Stanton","Sojourner Truth","Harriet Tubman","Lucretia Mott","Lucy Stone"]),

            // ══ AMERICAN HISTORY — C: Recent American History ═════════════════
            Q(100,HIS,"Name one war fought by the United States in the 1900s.",
                ["World War I","World War II","Korean War","Vietnam War","(Persian) Gulf War"]),
            Q(101,HIS,"Why did the United States enter World War I?",
                ["Because Germany attacked U.S. (civilian) ships","To support the Allied Powers (England, France, Italy, and Russia)",
                 "To oppose the Central Powers (Germany, Austria-Hungary, the Ottoman Empire, and Bulgaria)"]),
            Q(102,HIS,"When did all women get the right to vote?",
                ["1920","After World War I","(With the) 19th Amendment"]),
            Q(103,HIS,"What was the Great Depression?",
                ["Longest economic recession in modern history"]),
            Q(104,HIS,"When did the Great Depression start?",
                ["The Great Crash (1929)","Stock market crash of 1929"]),
            Q(105,HIS,"Who was president during the Great Depression and World War II?",
                ["(Franklin) Roosevelt"]),
            Q(106,HIS,"Why did the United States enter World War II?",
                ["(Bombing of) Pearl Harbor","Japanese attacked Pearl Harbor","To support the Allied Powers (England, France, and Russia)","To oppose the Axis Powers (Germany, Italy, and Japan)"]),
            Q(107,HIS,"Dwight Eisenhower is famous for many things. Name one.",
                ["General during World War II","President at the end of (during) the Korean War","34th president of the United States","Signed the Federal-Aid Highway Act of 1956 (Created the Interstate System)"]),
            Q(108,HIS,"Who was the United States' main rival during the Cold War?",
                ["Soviet Union","USSR","Russia"]),
            Q(109,HIS,"During the Cold War, what was one main concern of the United States?",
                ["Communism","Nuclear war"]),
            Q(110,HIS,"Why did the United States enter the Korean War?",
                ["To stop the spread of communism"]),
            Q(111,HIS,"Why did the United States enter the Vietnam War?",
                ["To stop the spread of communism"]),
            Q(112,HIS,"What did the civil rights movement do?",
                ["Fought to end racial discrimination"]),
            Q(113,HIS,"Martin Luther King, Jr. is famous for many things. Name one.",
                ["Fought for civil rights","Worked for equality for all Americans","Worked to ensure that people would \"not be judged by the color of their skin, but by the content of their character\""],starred:true),
            Q(114,HIS,"Why did the United States enter the Persian Gulf War?",
                ["To force the Iraqi military from Kuwait"]),
            Q(115,HIS,"What major event happened on September 11, 2001 in the United States?",
                ["Terrorists attacked the United States","Terrorists took over two planes and crashed them into the World Trade Center in New York City",
                 "Terrorists took over a plane and crashed into the Pentagon in Arlington, Virginia",
                 "Terrorists took over a plane originally aimed at Washington, D.C., and crashed in a field in Pennsylvania"],starred:true),
            Q(116,HIS,"Name one U.S. military conflict after the September 11, 2001 attacks.",
                ["(Global) War on Terror","War in Afghanistan","War in Iraq"]),
            Q(117,HIS,"Name one American Indian tribe in the United States.",
                ["Apache","Blackfeet","Cayuga","Cherokee","Cheyenne","Chippewa","Choctaw","Creek","Crow","Hopi","Huron",
                 "Inupiat","Lakota","Mohawk","Mohegan","Navajo","Oneida","Onondaga","Pueblo","Seminole","Seneca","Shawnee","Sioux","Teton","Tuscarora"]),
            Q(118,HIS,"Name one example of an American innovation.",
                ["Light bulb","Automobile (cars, combustible engine)","Skyscrapers","Airplane","Assembly line","Landing on the moon","Integrated circuit (IC)"]),

            // ══ SYMBOLS AND HOLIDAYS — A: Symbols ═════════════════════════════
            Q(119,SYM,"What is the capital of the United States?",
                ["Washington, D.C."]),
            Q(120,SYM,"Where is the Statue of Liberty?",
                ["New York (Harbor)","Liberty Island","New Jersey","near New York City","on the Hudson (River)"]),
            Q(121,SYM,"Why does the flag have 13 stripes?",
                ["(Because there were) 13 original colonies","(Because the stripes) represent the original colonies"],starred:true),
            Q(122,SYM,"Why does the flag have 50 stars?",
                ["(Because there is) one star for each state","(Because) each star represents a state","(Because there are) 50 states"]),
            Q(123,SYM,"What is the name of the national anthem?",
                ["The Star-Spangled Banner"]),
            Q(124,SYM,"The Nation's first motto was \"E Pluribus Unum.\" What does that mean?",
                ["Out of many, one","We all become one"]),

            // ══ SYMBOLS AND HOLIDAYS — B: Holidays ════════════════════════════
            Q(125,SYM,"What is Independence Day?",
                ["A holiday to celebrate U.S. independence (from Britain)","The country's birthday"]),
            Q(126,SYM,"Name three national U.S. holidays.",
                ["New Year's Day","Martin Luther King, Jr. Day","Presidents Day (Washington's Birthday)","Memorial Day","Independence Day",
                 "Labor Day","Columbus Day","Veterans Day","Thanksgiving Day","Christmas Day"],starred:true),
            Q(127,SYM,"What is Memorial Day?",
                ["A holiday to honor soldiers who died in military service"]),
            Q(128,SYM,"What is Veterans Day?",
                ["A holiday to honor people in the (U.S.) military","A holiday to honor people who have served (in the U.S. military)"]),
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
