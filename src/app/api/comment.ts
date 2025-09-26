import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Advanced profanity filter with regex patterns
function isContentToxic(content: string): boolean {
  // Convert to lowercase for case-insensitive matching
  const text = content.toLowerCase();

  // Basic profanity words (add more as needed)
  const profanityWords = [
    "damn",
    "hell",
    "crap",
    "shit",
    "fuck",
    "bitch",
    "ass",
    "bastard",
    "piss",
    "cock",
    "dick",
    "pussy",
    "whore",
    "slut",
    "faggot",
    "nigger",
    "retard",
    "gay",
    "homo",
    "lesbian",
    "tranny",
    "dyke",
    "queer",
  ];

  // Create regex patterns for different variations
  const patterns = profanityWords.map((word) => {
    // Escape special regex characters
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Pattern that handles:
    // 1. Exact word boundaries
    // 2. Character substitutions (a->@, e->3, i->1, o->0, s->$, etc.)
    // 3. Extra characters/spaces between letters
    // 4. Repeated characters
    const charMap: { [key: string]: string } = {
      a: "[a@4]",
      e: "[e3]",
      i: "[i1!]",
      o: "[o0]",
      s: "[s$5]",
      t: "[t7]",
      g: "[g9]",
      l: "[l1]",
    };

    // Build flexible pattern
    let flexiblePattern = escaped
      .split("")
      .map((char) => {
        if (charMap[char]) {
          return charMap[char] + "+"; // Allow repeating
        }
        return char + "+"; // Allow repeating of any character
      })
      .join("[\\s\\-_\\.]*"); // Allow separators between characters

    return `\\b${flexiblePattern}\\b`;
  });

  // Combine all patterns
  const combinedRegex = new RegExp(patterns.join("|"), "gi");

  // Check for matches
  if (combinedRegex.test(text)) {
    return true;
  }

  // Additional patterns for common evasion techniques
  const evasionPatterns = [
    // Asterisk censoring: f*ck, sh*t
    /\b[a-z]*\*+[a-z]*\b/gi,
    // Excessive repeating characters: fuuuuck, shiiiit
    /\b\w*([a-z])\1{3,}\w*\b/gi,
    // Mixed case evasion: FuCk, ShIt
    /\b[a-z]*[A-Z]+[a-z]*[A-Z]+[a-z]*\b/g,
    // Number substitutions: f4ck, sh1t, b1tch
    /\b[a-z]*[0-9]+[a-z]*\b/gi,
  ];

  // Check suspicious patterns (you might want to be more selective here)
  const suspiciousMatches = evasionPatterns.some((pattern) =>
    pattern.test(text),
  );

  // Additional toxic content patterns
  const toxicPatterns = [
    // Hate speech indicators
    /\b(kill|die|suicide|harm)\s+(yourself|urself|ur\s*self)\b/gi,
    /\b(go|should)\s+(die|kill\s+yourself)\b/gi,
    // Harassment patterns
    /\b(stupid|dumb|idiot|moron)\s+(bitch|whore|slut)\b/gi,
    // Discriminatory language
    /\b(all|every)\s+\w+\s+(are|is)\s+(stupid|dumb|evil|bad)\b/gi,
  ];

  const hasToxicPatterns = toxicPatterns.some((pattern) => pattern.test(text));

  return suspiciousMatches || hasToxicPatterns;
}

// Alternative: More sophisticated word-boundary aware function
function isContentToxicAdvanced(content: string): boolean {
  const text = content.toLowerCase().replace(/[^\w\s]/g, " ");

  // Comprehensive profanity list with severity levels
  const severeProfanity = ["fuck", "shit", "bitch", "nigger", "faggot"];
  const moderateProfanity = ["damn", "hell", "crap", "ass", "piss"];
  const mildProfanity = ["stupid", "dumb", "idiot"];

  // Create word boundary regex for each category
  const createWordBoundaryRegex = (words: string[]) => {
    const pattern = words
      .map((word) => {
        // Handle character substitutions and variations
        return word
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
              case "u":
                return "[u]+";
              default:
                return char + "+";
            }
          })
          .join("[\\s\\-_]*"); // Allow separators
      })
      .join("|");

    return new RegExp(`\\b(${pattern})\\b`, "gi");
  };

  // Check severity levels
  const severeRegex = createWordBoundaryRegex(severeProfanity);
  const moderateRegex = createWordBoundaryRegex(moderateProfanity);

  // Severe profanity = immediate block
  if (severeRegex.test(text)) {
    return true;
  }

  // Moderate profanity = check context (you can implement context analysis)
  if (moderateRegex.test(text)) {
    // Could implement context checking here
    return true;
  }

  return false;
}

// Usage in your API
export async function POST(req: NextRequest) {
  try {
    const { content, postId, authorId } = await req.json();

    if (!content || !postId || !authorId) {
      return NextResponse.json(
        { error: "Missing content, postId, or authorId" },
        { status: 400 },
      );
    }

    // Use the advanced toxicity check
    if (isContentToxic(content)) {
      // Log moderation action
      await prisma.log.create({
        data: {
          action: "moderation_block_comment",
          details: `Blocked comment by user ${authorId} on post ${postId}: ${content}`,
        },
      });
      return NextResponse.json(
        {
          error:
            "Content flagged as inappropriate. Please revise your comment.",
        },
        { status: 403 },
      );
    }

    const comment = await prisma.comment.create({
      data: { content, postId, authorId },
    });

    // Notification logic...
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.authorId !== authorId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          message: `Your post received a new comment.`,
        },
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
