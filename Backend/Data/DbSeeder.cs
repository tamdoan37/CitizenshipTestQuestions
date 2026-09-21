using CitizenFlowApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CitizenFlowApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (!await db.Questions.AnyAsync())
            await SeedQuestionsAsync(db);

        if (!await db.FederalOfficials.AnyAsync())
            await SeedFederalOfficialsAsync(db);

        if (!await db.StateOfficials.AnyAsync())
            await SeedStateOfficialsAsync(db);

        if (!await db.FluencySentences.AnyAsync())
            await SeedFluencySentencesAsync(db);

        await db.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────
    //  QUESTIONS  (USCIS 2008 100 Civics Questions)
    //  IsDynamic=true → answers injected from officials DB at runtime
    //  Is65PlusExempt=true → included in the 65+/20yr exception set
    //  IsFrequent=true → higher SRS starting weight
    // ─────────────────────────────────────────────────────────────
    private static async Task SeedQuestionsAsync(AppDbContext db)
    {
        var questions = new List<Question>
        {
            // ── AMERICAN GOVERNMENT ── Principles of American Democracy ──
            new() { Id = 1, QuestionText = "What is the supreme law of the land?",
                FixedAnswers = ["the Constitution"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy",
                IsFrequent = true, Is65PlusExempt = true },

            new() { Id = 2, QuestionText = "What does the Constitution do?",
                FixedAnswers = ["sets up the government", "defines the government", "protects basic rights of Americans"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy",
                Is65PlusExempt = true },

            new() { Id = 3, QuestionText = "The idea of self-government is in the first three words of the Constitution. What are these words?",
                FixedAnswers = ["We the People"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy",
                Is65PlusExempt = true },

            new() { Id = 4, QuestionText = "What is an amendment?",
                FixedAnswers = ["a change to the Constitution", "an addition to the Constitution"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy",
                Is65PlusExempt = true },

            new() { Id = 5, QuestionText = "What do we call the first ten amendments to the Constitution?",
                FixedAnswers = ["the Bill of Rights"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy",
                IsFrequent = true, Is65PlusExempt = true },

            new() { Id = 6, QuestionText = "What is one right or freedom from the First Amendment?",
                FixedAnswers = ["speech", "religion", "assembly", "press", "petition the government"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy",
                IsFrequent = true, Is65PlusExempt = true },

            new() { Id = 7, QuestionText = "How many amendments does the Constitution have?",
                FixedAnswers = ["twenty-seven", "27"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy",
                Is65PlusExempt = true },

            new() { Id = 8, QuestionText = "What did the Declaration of Independence do?",
                FixedAnswers = ["announced our independence from Great Britain", "declared our independence from Great Britain", "said that the United States is free from Great Britain"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy" },

            new() { Id = 9, QuestionText = "What are two rights in the Declaration of Independence?",
                FixedAnswers = ["life", "liberty", "pursuit of happiness"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy" },

            new() { Id = 10, QuestionText = "What is freedom of religion?",
                FixedAnswers = ["You can practice any religion, or not practice a religion."],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy" },

            new() { Id = 11, QuestionText = "What is the economic system in the United States?",
                FixedAnswers = ["capitalist economy", "market economy"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy",
                Is65PlusExempt = true },

            new() { Id = 12, QuestionText = "What is the \"rule of law\"?",
                FixedAnswers = ["Everyone must follow the law.", "Leaders must obey the law.", "Government must obey the law.", "No one is above the law."],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Principles of American Democracy",
                Is65PlusExempt = true },

            // ── AMERICAN GOVERNMENT ── System of Government ──
            new() { Id = 13, QuestionText = "Name one branch or part of the government.",
                FixedAnswers = ["Congress", "legislative", "President", "executive", "the courts", "judicial"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsFrequent = true, Is65PlusExempt = true },

            new() { Id = 14, QuestionText = "What stops one branch of government from becoming too powerful?",
                FixedAnswers = ["checks and balances", "separation of powers"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 15, QuestionText = "Who is in charge of the executive branch?",
                FixedAnswers = ["the President"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 16, QuestionText = "Who makes federal laws?",
                FixedAnswers = ["Congress", "Senate and House of Representatives", "the U.S. legislature", "the national legislature"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 17, QuestionText = "What are the two parts of the U.S. Congress?",
                FixedAnswers = ["the Senate and House of Representatives", "the Senate and the House"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsFrequent = true, Is65PlusExempt = true },

            new() { Id = 18, QuestionText = "How many U.S. Senators are there?",
                FixedAnswers = ["one hundred", "100"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                Is65PlusExempt = true },

            new() { Id = 19, QuestionText = "We elect a U.S. Senator for how many years?",
                FixedAnswers = ["six", "6"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 20, QuestionText = "Who is one of your state's U.S. Senators now?",
                FixedAnswers = [],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsDynamic = true, Is65PlusExempt = true },

            new() { Id = 21, QuestionText = "The House of Representatives has how many voting members?",
                FixedAnswers = ["four hundred thirty-five", "435"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                Is65PlusExempt = true },

            new() { Id = 22, QuestionText = "We elect a U.S. Representative for how many years?",
                FixedAnswers = ["two", "2"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                Is65PlusExempt = true },

            new() { Id = 23, QuestionText = "Name your U.S. Representative.",
                FixedAnswers = [],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsDynamic = true },

            new() { Id = 24, QuestionText = "Who does a U.S. Senator represent?",
                FixedAnswers = ["all people of the state"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                Is65PlusExempt = true },

            new() { Id = 25, QuestionText = "Why do some states have more Representatives than other states?",
                FixedAnswers = ["because of the state's population", "because they have more people", "because some states have more people"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 26, QuestionText = "We elect a President for how many years?",
                FixedAnswers = ["four", "4"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 27, QuestionText = "In what month do we vote for President?",
                FixedAnswers = ["November"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                Is65PlusExempt = true },

            new() { Id = 28, QuestionText = "What is the name of the President of the United States now?",
                FixedAnswers = [],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsDynamic = true, IsFrequent = true, Is65PlusExempt = true },

            new() { Id = 29, QuestionText = "What is the name of the Vice President of the United States now?",
                FixedAnswers = [],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsDynamic = true, IsFrequent = true },

            new() { Id = 30, QuestionText = "If the President can no longer serve, who becomes President?",
                FixedAnswers = ["the Vice President"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 31, QuestionText = "If both the President and the Vice President can no longer serve, who becomes President?",
                FixedAnswers = ["the Speaker of the House"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 32, QuestionText = "Who is the Commander in Chief of the military?",
                FixedAnswers = ["the President"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 33, QuestionText = "Who signs bills to become laws?",
                FixedAnswers = ["the President"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 34, QuestionText = "Who vetoes bills?",
                FixedAnswers = ["the President"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 35, QuestionText = "What does the President's Cabinet do?",
                FixedAnswers = ["advises the President"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 36, QuestionText = "What are two Cabinet-level positions?",
                FixedAnswers = ["Secretary of Agriculture", "Secretary of Commerce", "Secretary of Defense",
                    "Secretary of Education", "Secretary of Energy", "Secretary of Health and Human Services",
                    "Secretary of Homeland Security", "Secretary of Housing and Urban Development",
                    "Secretary of the Interior", "Secretary of Labor", "Secretary of State",
                    "Secretary of Transportation", "Secretary of the Treasury", "Secretary of Veterans Affairs",
                    "Attorney General", "Vice President"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 37, QuestionText = "What does the judicial branch do?",
                FixedAnswers = ["reviews laws", "explains laws", "resolves disputes", "decides if a law goes against the Constitution"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 38, QuestionText = "What is the highest court in the United States?",
                FixedAnswers = ["the Supreme Court"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsFrequent = true },

            new() { Id = 39, QuestionText = "How many justices are on the Supreme Court?",
                FixedAnswers = ["nine", "9"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 40, QuestionText = "Who is the Chief Justice of the United States now?",
                FixedAnswers = [],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsDynamic = true },

            new() { Id = 41, QuestionText = "Under our Constitution, some powers belong to the federal government. What is one power of the federal government?",
                FixedAnswers = ["to print money", "to declare war", "to create an army", "to make treaties"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 42, QuestionText = "Under our Constitution, some powers belong to the states. What is one power of the states?",
                FixedAnswers = ["provide schooling and education", "provide protection (police)", "provide safety (fire departments)", "give a driver's license", "approve zoning and land use"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government" },

            new() { Id = 43, QuestionText = "Who is the Governor of your state now?",
                FixedAnswers = [],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsDynamic = true },

            new() { Id = 44, QuestionText = "What is the capital of your state?",
                FixedAnswers = [],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsDynamic = true, Is65PlusExempt = true },

            new() { Id = 45, QuestionText = "What are the two major political parties in the United States?",
                FixedAnswers = ["Democratic and Republican"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "System of Government",
                IsFrequent = true },

            // ── AMERICAN GOVERNMENT ── Rights and Responsibilities ──
            new() { Id = 46, QuestionText = "What is the political party of the President now?",
                FixedAnswers = [],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities",
                IsDynamic = true, Is65PlusExempt = true },

            new() { Id = 47, QuestionText = "What is the name of the Speaker of the House of Representatives now?",
                FixedAnswers = [],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities",
                IsDynamic = true, Is65PlusExempt = true },

            new() { Id = 48, QuestionText = "There are four amendments to the Constitution about who can vote. Describe one of them.",
                FixedAnswers = ["Citizens eighteen (18) and older can vote.", "You don't have to pay a poll tax to vote.", "Any citizen can vote.", "A male citizen of any race can vote."],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities",
                Is65PlusExempt = true },

            new() { Id = 49, QuestionText = "What is one responsibility that is only for United States citizens?",
                FixedAnswers = ["serve on a jury", "vote in a federal election"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities",
                Is65PlusExempt = true },

            new() { Id = 50, QuestionText = "Name one right only for United States citizens.",
                FixedAnswers = ["vote in a federal election", "run for federal office"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities" },

            new() { Id = 51, QuestionText = "What are two rights of everyone living in the United States?",
                FixedAnswers = ["freedom of expression", "freedom of speech", "freedom of assembly", "freedom to petition the government", "freedom of religion", "the right to bear arms"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities" },

            new() { Id = 52, QuestionText = "Who do we show loyalty to when we say the Pledge of Allegiance?",
                FixedAnswers = ["the United States", "the flag"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities" },

            new() { Id = 53, QuestionText = "What is one promise you make when you become a United States citizen?",
                FixedAnswers = ["give up loyalty to other countries", "defend the Constitution and laws of the United States", "obey the laws of the United States", "serve in the U.S. military (if needed)", "serve the nation if needed", "be loyal to the United States"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities" },

            new() { Id = 54, QuestionText = "How old do citizens have to be to vote for President?",
                FixedAnswers = ["eighteen (18) and older"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities",
                Is65PlusExempt = true },

            new() { Id = 55, QuestionText = "What are two ways that Americans can participate in their democracy?",
                FixedAnswers = ["vote", "join a political party", "help with a campaign", "join a civic group", "join a community group", "give an elected official your opinion on an issue", "call Senators and Representatives", "publicly support or oppose an issue or policy", "run for office", "write to a newspaper"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities",
                Is65PlusExempt = true },

            new() { Id = 56, QuestionText = "When is the last day you can send in federal income tax forms?",
                FixedAnswers = ["April 15"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities",
                Is65PlusExempt = true },

            new() { Id = 57, QuestionText = "When must all men register for the Selective Service?",
                FixedAnswers = ["at age eighteen (18)", "between eighteen (18) and twenty-six (26)"],
                Category = "AMERICAN GOVERNMENT", SubCategory = "Rights and Responsibilities",
                Is65PlusExempt = true },

            // ── AMERICAN HISTORY ── Colonial Period and Independence ──
            new() { Id = 58, QuestionText = "What is one reason colonists came to America?",
                FixedAnswers = ["freedom", "political liberty", "religious freedom", "economic opportunity", "practice their religion", "escape persecution"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence" },

            new() { Id = 59, QuestionText = "Who lived in America before the Europeans arrived?",
                FixedAnswers = ["American Indians", "Native Americans"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence" },

            new() { Id = 60, QuestionText = "What group of people was taken to America and sold as slaves?",
                FixedAnswers = ["Africans", "people from Africa"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence" },

            new() { Id = 61, QuestionText = "Why did the colonists fight the British?",
                FixedAnswers = ["because of high taxes (taxation without representation)", "because the British army stayed in their houses (boarding, quartering)", "because they didn't have self-government"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence" },

            new() { Id = 62, QuestionText = "Who wrote the Declaration of Independence?",
                FixedAnswers = ["(Thomas) Jefferson"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence",
                IsFrequent = true },

            new() { Id = 63, QuestionText = "When was the Declaration of Independence adopted?",
                FixedAnswers = ["July 4, 1776"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence",
                IsFrequent = true },

            new() { Id = 64, QuestionText = "There were 13 original states. Name three.",
                FixedAnswers = ["New Hampshire", "Massachusetts", "Rhode Island", "Connecticut", "New York", "New Jersey", "Pennsylvania", "Delaware", "Maryland", "Virginia", "North Carolina", "South Carolina", "Georgia"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence" },

            new() { Id = 65, QuestionText = "What happened at the Constitutional Convention?",
                FixedAnswers = ["The Constitution was written.", "The Founding Fathers wrote the Constitution."],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence" },

            new() { Id = 66, QuestionText = "When was the Constitution written?",
                FixedAnswers = ["1787"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence" },

            new() { Id = 67, QuestionText = "The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.",
                FixedAnswers = ["(James) Madison", "(Alexander) Hamilton", "(John) Jay", "Publius"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence" },

            new() { Id = 68, QuestionText = "What is one thing Benjamin Franklin is famous for?",
                FixedAnswers = ["U.S. diplomat", "oldest member of the Constitutional Convention", "first Postmaster General of the United States", "writer of Poor Richard's Almanac", "started the first free libraries"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence" },

            new() { Id = 69, QuestionText = "Who is the \"Father of Our Country\"?",
                FixedAnswers = ["(George) Washington"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence",
                IsFrequent = true },

            new() { Id = 70, QuestionText = "Who was the first President?",
                FixedAnswers = ["(George) Washington"],
                Category = "AMERICAN HISTORY", SubCategory = "Colonial Period and Independence",
                IsFrequent = true, Is65PlusExempt = true },

            // ── AMERICAN HISTORY ── 1800s ──
            new() { Id = 71, QuestionText = "What territory did the United States buy from France in 1803?",
                FixedAnswers = ["the Louisiana Territory", "Louisiana"],
                Category = "AMERICAN HISTORY", SubCategory = "1800s",
                Is65PlusExempt = true },

            new() { Id = 72, QuestionText = "Name one war fought by the United States in the 1800s.",
                FixedAnswers = ["War of 1812", "Mexican-American War", "Civil War", "Spanish-American War"],
                Category = "AMERICAN HISTORY", SubCategory = "1800s",
                Is65PlusExempt = true },

            new() { Id = 73, QuestionText = "Name the U.S. war between the North and the South.",
                FixedAnswers = ["the Civil War", "the War between the States"],
                Category = "AMERICAN HISTORY", SubCategory = "1800s" },

            new() { Id = 74, QuestionText = "Name one problem that led to the Civil War.",
                FixedAnswers = ["slavery", "economic reasons", "states' rights"],
                Category = "AMERICAN HISTORY", SubCategory = "1800s" },

            new() { Id = 75, QuestionText = "What was one important thing that Abraham Lincoln did?",
                FixedAnswers = ["freed the slaves (Emancipation Proclamation)", "saved the Union", "preserved the Union", "led the United States during the Civil War"],
                Category = "AMERICAN HISTORY", SubCategory = "1800s",
                IsFrequent = true, Is65PlusExempt = true },

            new() { Id = 76, QuestionText = "What did the Emancipation Proclamation do?",
                FixedAnswers = ["freed the slaves", "freed slaves in the Confederacy", "freed slaves in the Confederate states", "freed slaves in most Southern states"],
                Category = "AMERICAN HISTORY", SubCategory = "1800s",
                Is65PlusExempt = true },

            new() { Id = 77, QuestionText = "What did Susan B. Anthony do?",
                FixedAnswers = ["fought for women's rights", "fought for civil rights"],
                Category = "AMERICAN HISTORY", SubCategory = "1800s",
                Is65PlusExempt = true },

            // ── AMERICAN HISTORY ── Recent American History ──
            new() { Id = 78, QuestionText = "Name one war fought by the United States in the 1900s.",
                FixedAnswers = ["World War I", "World War II", "Korean War", "Vietnam War", "(Persian) Gulf War"],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History",
                Is65PlusExempt = true },

            new() { Id = 79, QuestionText = "Who was President during World War I?",
                FixedAnswers = ["(Woodrow) Wilson"],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History",
                Is65PlusExempt = true },

            new() { Id = 80, QuestionText = "Who was President during the Great Depression and World War II?",
                FixedAnswers = ["(Franklin) Roosevelt"],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History" },

            new() { Id = 81, QuestionText = "Who did the United States fight in World War II?",
                FixedAnswers = ["Japan, Germany, and Italy"],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History",
                Is65PlusExempt = true },

            new() { Id = 82, QuestionText = "Before he was President, Eisenhower was a general. What war was he in?",
                FixedAnswers = ["World War II"],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History",
                Is65PlusExempt = true },

            new() { Id = 83, QuestionText = "During the Cold War, what was the main concern of the United States?",
                FixedAnswers = ["Communism"],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History",
                Is65PlusExempt = true },

            new() { Id = 84, QuestionText = "What movement tried to end racial discrimination?",
                FixedAnswers = ["civil rights (movement)"],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History",
                Is65PlusExempt = true },

            new() { Id = 85, QuestionText = "What did Martin Luther King, Jr. do?",
                FixedAnswers = ["fought for civil rights", "worked for equality for all Americans"],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History" },

            new() { Id = 86, QuestionText = "What major event happened on September 11, 2001 in the United States?",
                FixedAnswers = ["Terrorists attacked the United States."],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History" },

            new() { Id = 87, QuestionText = "Name one American Indian tribe in the United States.",
                FixedAnswers = ["Cherokee", "Navajo", "Sioux", "Chippewa", "Choctaw", "Pueblo", "Apache", "Iroquois", "Creek", "Blackfeet", "Seminole", "Cheyenne", "Arawak", "Shawnee", "Mohegan", "Huron", "Oneida", "Lakota", "Crow", "Teton", "Hopi", "Inuit"],
                Category = "AMERICAN HISTORY", SubCategory = "Recent American History",
                Is65PlusExempt = true },

            // ── INTEGRATED CIVICS ── Geography ──
            new() { Id = 88, QuestionText = "Name one of the two longest rivers in the United States.",
                FixedAnswers = ["Missouri River", "Mississippi River"],
                Category = "INTEGRATED CIVICS", SubCategory = "Geography",
                Is65PlusExempt = true },

            new() { Id = 89, QuestionText = "What ocean is on the West Coast of the United States?",
                FixedAnswers = ["Pacific Ocean"],
                Category = "INTEGRATED CIVICS", SubCategory = "Geography",
                Is65PlusExempt = true },

            new() { Id = 90, QuestionText = "What ocean is on the East Coast of the United States?",
                FixedAnswers = ["Atlantic Ocean"],
                Category = "INTEGRATED CIVICS", SubCategory = "Geography",
                Is65PlusExempt = true },

            new() { Id = 91, QuestionText = "Name one U.S. territory.",
                FixedAnswers = ["Puerto Rico", "U.S. Virgin Islands", "American Samoa", "Northern Mariana Islands", "Guam"],
                Category = "INTEGRATED CIVICS", SubCategory = "Geography",
                Is65PlusExempt = true },

            new() { Id = 92, QuestionText = "Name one state that borders Canada.",
                FixedAnswers = ["Maine", "New Hampshire", "Vermont", "New York", "Pennsylvania", "Ohio", "Michigan", "Minnesota", "North Dakota", "Montana", "Idaho", "Washington", "Alaska"],
                Category = "INTEGRATED CIVICS", SubCategory = "Geography",
                Is65PlusExempt = true },

            new() { Id = 93, QuestionText = "Name one state that borders Mexico.",
                FixedAnswers = ["California", "Arizona", "New Mexico", "Texas"],
                Category = "INTEGRATED CIVICS", SubCategory = "Geography",
                Is65PlusExempt = true },

            new() { Id = 94, QuestionText = "What is the capital of the United States?",
                FixedAnswers = ["Washington, D.C."],
                Category = "INTEGRATED CIVICS", SubCategory = "Geography",
                IsFrequent = true },

            new() { Id = 95, QuestionText = "Where is the Statue of Liberty?",
                FixedAnswers = ["New York (Harbor)", "Liberty Island", "New Jersey", "near New York City", "on the Hudson River"],
                Category = "INTEGRATED CIVICS", SubCategory = "Geography",
                Is65PlusExempt = true },

            // ── INTEGRATED CIVICS ── Symbols ──
            new() { Id = 96, QuestionText = "Why does the flag have 13 stripes?",
                FixedAnswers = ["because there were 13 original colonies", "because the stripes represent the original colonies"],
                Category = "INTEGRATED CIVICS", SubCategory = "Symbols",
                Is65PlusExempt = true },

            new() { Id = 97, QuestionText = "Why does the flag have 50 stars?",
                FixedAnswers = ["because there is one star for each state", "because each star represents a state", "because there are 50 states"],
                Category = "INTEGRATED CIVICS", SubCategory = "Symbols",
                Is65PlusExempt = true },

            new() { Id = 98, QuestionText = "What is the name of the national anthem?",
                FixedAnswers = ["The Star-Spangled Banner"],
                Category = "INTEGRATED CIVICS", SubCategory = "Symbols",
                IsFrequent = true, Is65PlusExempt = true },

            // ── INTEGRATED CIVICS ── Holidays ──
            new() { Id = 99, QuestionText = "What do we call the first 10 amendments to the Constitution?",
                FixedAnswers = ["the Bill of Rights"],
                Category = "INTEGRATED CIVICS", SubCategory = "Holidays",
                Is65PlusExempt = true },

            new() { Id = 100, QuestionText = "Name two national U.S. holidays.",
                FixedAnswers = ["New Year's Day", "Martin Luther King, Jr. Day", "Presidents' Day", "Memorial Day", "Independence Day", "Labor Day", "Columbus Day", "Veterans Day", "Thanksgiving", "Christmas"],
                Category = "INTEGRATED CIVICS", SubCategory = "Holidays",
                Is65PlusExempt = true },
        };

        await db.Questions.AddRangeAsync(questions);
    }

    // ─────────────────────────────────────────────────────────────
    //  FEDERAL OFFICIALS  (update via Admin API after elections)
    // ─────────────────────────────────────────────────────────────
    private static async Task SeedFederalOfficialsAsync(AppDbContext db)
    {
        var officials = new List<FederalOfficial>
        {
            new() { Role = "President",       Name = "Donald J. Trump",  PartyAffiliation = "Republican" },
            new() { Role = "VicePresident",   Name = "JD Vance",         PartyAffiliation = "Republican" },
            new() { Role = "SpeakerOfHouse",  Name = "Mike Johnson",     PartyAffiliation = "Republican" },
            new() { Role = "ChiefJustice",    Name = "John G. Roberts, Jr.", PartyAffiliation = null },
        };

        await db.FederalOfficials.AddRangeAsync(officials);
    }

    // ─────────────────────────────────────────────────────────────
    //  STATE OFFICIALS  (all 50 states — update via Admin API)
    //  Data reflects approximate 2025 state. Always verify before use.
    // ─────────────────────────────────────────────────────────────
    private static async Task SeedStateOfficialsAsync(AppDbContext db)
    {
        var states = new List<StateOfficial>
        {
            new() { StateAbbr = "AL", StateName = "Alabama",        Governor = "Kay Ivey",                Capital = "Montgomery",   Senators = ["Tommy Tuberville", "Katie Britt"] },
            new() { StateAbbr = "AK", StateName = "Alaska",         Governor = "Mike Dunleavy",           Capital = "Juneau",       Senators = ["Lisa Murkowski", "Dan Sullivan"] },
            new() { StateAbbr = "AZ", StateName = "Arizona",        Governor = "Katie Hobbs",             Capital = "Phoenix",      Senators = ["Mark Kelly", "Ruben Gallego"] },
            new() { StateAbbr = "AR", StateName = "Arkansas",       Governor = "Sarah Huckabee Sanders",  Capital = "Little Rock",  Senators = ["John Boozman", "Tom Cotton"] },
            new() { StateAbbr = "CA", StateName = "California",     Governor = "Gavin Newsom",            Capital = "Sacramento",   Senators = ["Adam Schiff", "Alex Padilla"] },
            new() { StateAbbr = "CO", StateName = "Colorado",       Governor = "Jared Polis",             Capital = "Denver",       Senators = ["Michael Bennet", "John Hickenlooper"] },
            new() { StateAbbr = "CT", StateName = "Connecticut",    Governor = "Ned Lamont",              Capital = "Hartford",     Senators = ["Chris Murphy", "Richard Blumenthal"] },
            new() { StateAbbr = "DE", StateName = "Delaware",       Governor = "Matt Meyer",              Capital = "Dover",        Senators = ["Chris Coons", "Lisa Blunt Rochester"] },
            new() { StateAbbr = "FL", StateName = "Florida",        Governor = "Ron DeSantis",            Capital = "Tallahassee",  Senators = ["Rick Scott", "Ashley Moody"] },
            new() { StateAbbr = "GA", StateName = "Georgia",        Governor = "Brian Kemp",              Capital = "Atlanta",      Senators = ["Jon Ossoff", "Raphael Warnock"] },
            new() { StateAbbr = "HI", StateName = "Hawaii",         Governor = "Josh Green",              Capital = "Honolulu",     Senators = ["Brian Schatz", "Mazie Hirono"] },
            new() { StateAbbr = "ID", StateName = "Idaho",          Governor = "Brad Little",             Capital = "Boise",        Senators = ["Mike Crapo", "Jim Risch"] },
            new() { StateAbbr = "IL", StateName = "Illinois",       Governor = "JB Pritzker",             Capital = "Springfield",  Senators = ["Dick Durbin", "Tammy Duckworth"] },
            new() { StateAbbr = "IN", StateName = "Indiana",        Governor = "Mike Braun",              Capital = "Indianapolis", Senators = ["Todd Young", "Jim Banks"] },
            new() { StateAbbr = "IA", StateName = "Iowa",           Governor = "Kim Reynolds",            Capital = "Des Moines",   Senators = ["Chuck Grassley", "Joni Ernst"] },
            new() { StateAbbr = "KS", StateName = "Kansas",         Governor = "Laura Kelly",             Capital = "Topeka",       Senators = ["Jerry Moran", "Roger Marshall"] },
            new() { StateAbbr = "KY", StateName = "Kentucky",       Governor = "Andy Beshear",            Capital = "Frankfort",    Senators = ["Mitch McConnell", "Rand Paul"] },
            new() { StateAbbr = "LA", StateName = "Louisiana",      Governor = "Jeff Landry",             Capital = "Baton Rouge",  Senators = ["Bill Cassidy", "John Kennedy"] },
            new() { StateAbbr = "ME", StateName = "Maine",          Governor = "Janet Mills",             Capital = "Augusta",      Senators = ["Susan Collins", "Angus King"] },
            new() { StateAbbr = "MD", StateName = "Maryland",       Governor = "Wes Moore",               Capital = "Annapolis",    Senators = ["Chris Van Hollen", "Angela Alsobrooks"] },
            new() { StateAbbr = "MA", StateName = "Massachusetts",  Governor = "Maura Healey",            Capital = "Boston",       Senators = ["Elizabeth Warren", "Ed Markey"] },
            new() { StateAbbr = "MI", StateName = "Michigan",       Governor = "Gretchen Whitmer",        Capital = "Lansing",      Senators = ["Gary Peters", "Elissa Slotkin"] },
            new() { StateAbbr = "MN", StateName = "Minnesota",      Governor = "Tim Walz",                Capital = "Saint Paul",   Senators = ["Amy Klobuchar", "Tina Smith"] },
            new() { StateAbbr = "MS", StateName = "Mississippi",    Governor = "Tate Reeves",             Capital = "Jackson",      Senators = ["Roger Wicker", "Cindy Hyde-Smith"] },
            new() { StateAbbr = "MO", StateName = "Missouri",       Governor = "Mike Kehoe",              Capital = "Jefferson City",Senators = ["Josh Hawley", "Eric Schmitt"] },
            new() { StateAbbr = "MT", StateName = "Montana",        Governor = "Greg Gianforte",          Capital = "Helena",       Senators = ["Steve Daines", "Tim Sheehy"] },
            new() { StateAbbr = "NE", StateName = "Nebraska",       Governor = "Jim Pillen",              Capital = "Lincoln",      Senators = ["Pete Ricketts", "Deb Fischer"] },
            new() { StateAbbr = "NV", StateName = "Nevada",         Governor = "Joe Lombardo",            Capital = "Carson City",  Senators = ["Catherine Cortez Masto", "Jacky Rosen"] },
            new() { StateAbbr = "NH", StateName = "New Hampshire",  Governor = "Kelly Ayotte",            Capital = "Concord",      Senators = ["Jeanne Shaheen", "Maggie Hassan"] },
            new() { StateAbbr = "NJ", StateName = "New Jersey",     Governor = "Jon Bramnick",            Capital = "Trenton",      Senators = ["Andy Kim", "Cory Booker"] },
            new() { StateAbbr = "NM", StateName = "New Mexico",     Governor = "Michelle Lujan Grisham",  Capital = "Santa Fe",     Senators = ["Martin Heinrich", "Ben Ray Luján"] },
            new() { StateAbbr = "NY", StateName = "New York",       Governor = "Kathy Hochul",            Capital = "Albany",       Senators = ["Chuck Schumer", "Kirsten Gillibrand"] },
            new() { StateAbbr = "NC", StateName = "North Carolina", Governor = "Josh Stein",              Capital = "Raleigh",      Senators = ["Thom Tillis", "Ted Budd"] },
            new() { StateAbbr = "ND", StateName = "North Dakota",   Governor = "Kelly Armstrong",         Capital = "Bismarck",     Senators = ["John Hoeven", "Kevin Cramer"] },
            new() { StateAbbr = "OH", StateName = "Ohio",           Governor = "Mike DeWine",             Capital = "Columbus",     Senators = ["Bernie Moreno", "Jon Husted"] },
            new() { StateAbbr = "OK", StateName = "Oklahoma",       Governor = "Kevin Stitt",             Capital = "Oklahoma City",Senators = ["James Lankford", "Markwayne Mullin"] },
            new() { StateAbbr = "OR", StateName = "Oregon",         Governor = "Tina Kotek",              Capital = "Salem",        Senators = ["Ron Wyden", "Jeff Merkley"] },
            new() { StateAbbr = "PA", StateName = "Pennsylvania",   Governor = "Josh Shapiro",            Capital = "Harrisburg",   Senators = ["John Fetterman", "Dave McCormick"] },
            new() { StateAbbr = "RI", StateName = "Rhode Island",   Governor = "Dan McKee",               Capital = "Providence",   Senators = ["Jack Reed", "Sheldon Whitehouse"] },
            new() { StateAbbr = "SC", StateName = "South Carolina", Governor = "Henry McMaster",          Capital = "Columbia",     Senators = ["Lindsey Graham", "Tim Scott"] },
            new() { StateAbbr = "SD", StateName = "South Dakota",   Governor = "Kristi Noem",             Capital = "Pierre",       Senators = ["John Thune", "Mike Rounds"] },
            new() { StateAbbr = "TN", StateName = "Tennessee",      Governor = "Bill Lee",                Capital = "Nashville",    Senators = ["Marsha Blackburn", "Bill Hagerty"] },
            new() { StateAbbr = "TX", StateName = "Texas",          Governor = "Greg Abbott",             Capital = "Austin",       Senators = ["John Cornyn", "Ted Cruz"] },
            new() { StateAbbr = "UT", StateName = "Utah",           Governor = "Spencer Cox",             Capital = "Salt Lake City",Senators = ["Mike Lee", "John Curtis"] },
            new() { StateAbbr = "VT", StateName = "Vermont",        Governor = "Phil Scott",              Capital = "Montpelier",   Senators = ["Bernie Sanders", "Peter Welch"] },
            new() { StateAbbr = "VA", StateName = "Virginia",       Governor = "Glenn Youngkin",          Capital = "Richmond",     Senators = ["Mark Warner", "Tim Kaine"] },
            new() { StateAbbr = "WA", StateName = "Washington",     Governor = "Bob Ferguson",            Capital = "Olympia",      Senators = ["Patty Murray", "Maria Cantwell"] },
            new() { StateAbbr = "WV", StateName = "West Virginia",  Governor = "Patrick Morrisey",        Capital = "Charleston",   Senators = ["Shelley Moore Capito", "Jim Justice"] },
            new() { StateAbbr = "WI", StateName = "Wisconsin",      Governor = "Tony Evers",              Capital = "Madison",      Senators = ["Tammy Baldwin", "Ron Johnson"] },
            new() { StateAbbr = "WY", StateName = "Wyoming",        Governor = "Mark Gordon",             Capital = "Cheyenne",     Senators = ["John Barrasso", "Cynthia Lummis"] },
        };

        await db.StateOfficials.AddRangeAsync(states);
    }

    // ─────────────────────────────────────────────────────────────
    //  FLUENCY SENTENCES  (USCIS reading/writing test vocabulary)
    // ─────────────────────────────────────────────────────────────
    private static async Task SeedFluencySentencesAsync(AppDbContext db)
    {
        var sentences = new List<FluencySentence>
        {
            // Reading — Level 1
            new() { Text = "The flag is red, white, and blue.", Type = "reading", DifficultyLevel = 1, CoreVocabulary = ["flag", "red", "white", "blue"] },
            new() { Text = "The President lives in the White House.", Type = "reading", DifficultyLevel = 1, CoreVocabulary = ["President", "White House"] },
            new() { Text = "Congress makes the laws in the United States.", Type = "reading", DifficultyLevel = 1, CoreVocabulary = ["Congress", "laws", "United States"] },
            new() { Text = "Citizens have the right to vote.", Type = "reading", DifficultyLevel = 1, CoreVocabulary = ["Citizens", "right", "vote"] },
            new() { Text = "George Washington was the first President.", Type = "reading", DifficultyLevel = 1, CoreVocabulary = ["George Washington", "first", "President"] },

            // Reading — Level 2
            new() { Text = "The Constitution is the supreme law of the land.", Type = "reading", DifficultyLevel = 2, CoreVocabulary = ["Constitution", "supreme", "law"] },
            new() { Text = "There are one hundred senators in Congress.", Type = "reading", DifficultyLevel = 2, CoreVocabulary = ["senators", "Congress"] },
            new() { Text = "The Bill of Rights protects the freedoms of Americans.", Type = "reading", DifficultyLevel = 2, CoreVocabulary = ["Bill of Rights", "freedoms", "Americans"] },
            new() { Text = "Independence Day is on July fourth.", Type = "reading", DifficultyLevel = 2, CoreVocabulary = ["Independence Day", "July fourth"] },
            new() { Text = "The Supreme Court is the highest court in the United States.", Type = "reading", DifficultyLevel = 2, CoreVocabulary = ["Supreme Court", "highest court"] },

            // Reading — Level 3
            new() { Text = "The Declaration of Independence was adopted on July 4, 1776.", Type = "reading", DifficultyLevel = 3, CoreVocabulary = ["Declaration of Independence", "adopted", "July 4, 1776"] },
            new() { Text = "Checks and balances prevent any branch of government from becoming too powerful.", Type = "reading", DifficultyLevel = 3, CoreVocabulary = ["Checks and balances", "branch", "government"] },
            new() { Text = "The Emancipation Proclamation freed the slaves in the Confederate states.", Type = "reading", DifficultyLevel = 3, CoreVocabulary = ["Emancipation Proclamation", "freed", "Confederate states"] },
            new() { Text = "The First Amendment protects freedom of speech, religion, and the press.", Type = "reading", DifficultyLevel = 3, CoreVocabulary = ["First Amendment", "freedom of speech", "religion", "press"] },
            new() { Text = "The United States fought against Japan, Germany, and Italy in World War II.", Type = "reading", DifficultyLevel = 3, CoreVocabulary = ["United States", "Japan", "Germany", "Italy", "World War II"] },

            // Writing — Level 1
            new() { Text = "I want to be a citizen.", Type = "writing", DifficultyLevel = 1, CoreVocabulary = ["citizen"] },
            new() { Text = "He has a big dog.", Type = "writing", DifficultyLevel = 1, CoreVocabulary = [] },
            new() { Text = "She came here today.", Type = "writing", DifficultyLevel = 1, CoreVocabulary = [] },
            new() { Text = "The people vote in November.", Type = "writing", DifficultyLevel = 1, CoreVocabulary = ["vote", "November"] },
            new() { Text = "I pay my taxes.", Type = "writing", DifficultyLevel = 1, CoreVocabulary = ["taxes"] },

            // Writing — Level 2
            new() { Text = "Washington, D.C. is the capital of the United States.", Type = "writing", DifficultyLevel = 2, CoreVocabulary = ["Washington D.C.", "capital"] },
            new() { Text = "The President signs bills to become laws.", Type = "writing", DifficultyLevel = 2, CoreVocabulary = ["President", "bills", "laws"] },
            new() { Text = "All people want to be free.", Type = "writing", DifficultyLevel = 2, CoreVocabulary = ["free"] },
            new() { Text = "Abraham Lincoln was a great President.", Type = "writing", DifficultyLevel = 2, CoreVocabulary = ["Abraham Lincoln", "President"] },
            new() { Text = "Citizens must obey the laws.", Type = "writing", DifficultyLevel = 2, CoreVocabulary = ["Citizens", "obey", "laws"] },

            // Writing — Level 3
            new() { Text = "The Civil War was fought between the North and the South.", Type = "writing", DifficultyLevel = 3, CoreVocabulary = ["Civil War", "North", "South"] },
            new() { Text = "The government is made up of three branches.", Type = "writing", DifficultyLevel = 3, CoreVocabulary = ["government", "three branches"] },
            new() { Text = "American citizens have the right to freedom of speech.", Type = "writing", DifficultyLevel = 3, CoreVocabulary = ["citizens", "freedom of speech"] },
        };

        await db.FluencySentences.AddRangeAsync(sentences);
    }
}
