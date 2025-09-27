// Define a more informative return type for the analysis
interface ToxicityResult {
  isToxic: boolean;
  severity: "none" | "moderate" | "severe";
  matchedValue?: string; // The specific word or phrase that was flagged
}

/**
 * Analyzes content for toxicity by combining a tiered word list with
 * advanced evasion and contextual phrase detection.
 * @param content The string content to analyze.
 * @returns An object detailing if the content is toxic and its severity.
 */
export function analyzeToxicity(content: string): ToxicityResult {
  if (!content) {
    return { isToxic: false, severity: "none" };
  }

  // Convert to lowercase for case-insensitive matching
  const text = content.toLowerCase();

  // --- Tiered Profanity & Pattern Definitions ---

  // 1. Severe Content: Direct insults, slurs, and harmful phrases
  const severeWords = [
    "fuck",
    "shit",
    "bitch",
    "cunt",
    "nigger",
    "faggot",
    "retard",
    "whore",
    "slut",
    "cock",
    "dick",
    "pussy",
  ];
  const severePatterns = [
    // Phrases telling someone to self-harm (from the first function)
    /\b(kill|die|suicide|harm)\s+(yourself|urself|ur\s*self)\b/gi,
    /\b(go|should)\s+(die|kill\s+yourself)\b/gi,
  ];

  // 2. Moderate Content: General profanity and evasion techniques
  const moderateWords = ["damn", "hell", "crap", "ass", "bastard", "piss"];
  const evasionPatterns = [
    // Asterisk or another character censoring: f*ck, sh.t
    /\b[a-z]\w*(?:\*|\.|@|\$|#|!)\w*[a-z]\b/gi,
    // Excessive repeating characters: fuuuuuck, shiiiit
    /\b\w*([a-z])\1{3,}\w*\b/gi,
  ];

  // --- Regex Generation Helper ---

  /**
   * Creates a flexible, word-boundary-aware regex from a list of words.
   * Handles character substitutions and various separators.
   */
  const createWordBoundaryRegex = (words: string[]): RegExp => {
    const pattern = words
      .map((word) => {
        // Escape special regex characters
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Handle character substitutions and allow repetition
        const flexiblePattern = escaped
          .split("")
          .map((char) => {
            switch (char) {
              case "a":
                return "[a@4]+";
              case "e":
                return "[e3]+";
              case "i":
                return "[i1!]+";
              case "o":
                return "[o0]+";
              case "s":
                return "[s$5]+";
              case "t":
                return "[t7]+";
              default:
                return `${char}+`;
            }
          })
          .join("[\\s\\-_.]*"); // Allow various separators (space, -, _, .)

        return flexiblePattern;
      })
      .join("|");

    return new RegExp(`\\b(${pattern})\\b`, "gi");
  };

  // --- Execution Logic (from highest to lowest priority) ---

  // 1. Check for SEVERE contextual phrases
  for (const pattern of severePatterns) {
    const match = text.match(pattern);
    if (match) {
      return { isToxic: true, severity: "severe", matchedValue: match[0] };
    }
  }

  // 2. Check for SEVERE profanity words
  const severeWordRegex = createWordBoundaryRegex(severeWords);
  let match = text.match(severeWordRegex);
  if (match) {
    return { isToxic: true, severity: "severe", matchedValue: match[0] };
  }

  // 3. Check for MODERATE profanity words
  const moderateWordRegex = createWordBoundaryRegex(moderateWords);
  match = text.match(moderateWordRegex);
  if (match) {
    return { isToxic: true, severity: "moderate", matchedValue: match[0] };
  }

  // 4. Check for MODERATE evasion patterns (intent to offend)
  for (const pattern of evasionPatterns) {
    const match = text.match(pattern);
    if (match) {
      return { isToxic: true, severity: "moderate", matchedValue: match[0] };
    }
  }

  // 5. If nothing is found, the content is clean
  return { isToxic: false, severity: "none" };
}
