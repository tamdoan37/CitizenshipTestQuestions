/**
 * USCIS English test practice sentences (reading + writing), drawn from the
 * official reading/writing vocabulary. Used by the Read & Write study mode.
 */
export interface FluencySentence {
  id: number;
  type: "reading" | "writing";
  text: string;
}

export const READING: FluencySentence[] = [
  { id: 1, type: "reading", text: "Why do we have a flag?" },
  { id: 2, type: "reading", text: "Who was the first President?" },
  { id: 3, type: "reading", text: "What is the capital of the United States?" },
  { id: 4, type: "reading", text: "When is Presidents' Day?" },
  { id: 5, type: "reading", text: "Where is the White House?" },
  { id: 6, type: "reading", text: "Who wrote the Declaration of Independence?" },
  { id: 7, type: "reading", text: "Name one right of the people." },
  { id: 8, type: "reading", text: "What do we pay to the government?" },
  { id: 9, type: "reading", text: "Who elects Congress?" },
  { id: 10, type: "reading", text: "Why do we vote?" },
  { id: 11, type: "reading", text: "When do we vote for President?" },
  { id: 12, type: "reading", text: "Who lives in the White House?" },
  { id: 13, type: "reading", text: "What is the largest state?" },
  { id: 14, type: "reading", text: "Name one American Indian tribe." },
];

export const WRITING: FluencySentence[] = [
  { id: 101, type: "writing", text: "The flag is red, white, and blue." },
  { id: 102, type: "writing", text: "The President lives in the White House." },
  { id: 103, type: "writing", text: "Congress meets in Washington, D.C." },
  { id: 104, type: "writing", text: "Citizens can vote for the President." },
  { id: 105, type: "writing", text: "George Washington was the first President." },
  { id: 106, type: "writing", text: "The people have the right to vote." },
  { id: 107, type: "writing", text: "Presidents' Day is in February." },
  { id: 108, type: "writing", text: "Independence Day is in July." },
  { id: 109, type: "writing", text: "We pay taxes to the government." },
  { id: 110, type: "writing", text: "Many people come to America to be free." },
  { id: 111, type: "writing", text: "Alaska is the largest state." },
  { id: 112, type: "writing", text: "The capital of the United States is Washington, D.C." },
  { id: 113, type: "writing", text: "Citizens have the right of free speech." },
  { id: 114, type: "writing", text: "Columbus Day is in October." },
];

export const FLUENCY_ALL: FluencySentence[] = [...READING, ...WRITING];
