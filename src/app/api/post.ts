// Advanced profanity filter with regex patterns
function isContentToxic(content: string): boolean {
  const text = content.toLowerCase();
  const profanityWords = [
    'damn', 'hell', 'crap', 'shit', 'fuck', 'bitch', 'ass', 'bastard',
    'piss', 'cock', 'dick', 'pussy', 'whore', 'slut', 'faggot', 'nigger',
    'retard', 'gay', 'homo', 'lesbian', 'tranny', 'dyke', 'queer'
  ];
  const patterns = profanityWords.map(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const charMap: { [key: string]: string } = {
      'a': '[a@4]', 'e': '[e3]', 'i': '[i1!]', 'o': '[o0]', 's': '[s$5]', 't': '[t7]', 'g': '[g9]', 'l': '[l1]'
    };
    let flexiblePattern = escaped.split('').map(char => {
      if (charMap[char as string]) return charMap[char as string] + '+';
      return char + '+';
    }).join('[\\s\\-_\\.]*');
    return `\\b${flexiblePattern}\\b`;
  });
  const combinedRegex = new RegExp(patterns.join('|'), 'gi');
  if (combinedRegex.test(text)) return true;
  const evasionPatterns = [
    /\b[a-z]*\*+[a-z]*\b/gi,
    /\b\w*([a-z])\1{3,}\w*\b/gi,
    /\b[a-z]*[A-Z]+[a-z]*[A-Z]+[a-z]*\b/g,
    /\b[a-z]*[0-9]+[a-z]*\b/gi,
  ];
  const suspiciousMatches = evasionPatterns.some(pattern => pattern.test(text));
  const toxicPatterns = [
    /\b(kill|die|suicide|harm)\s+(yourself|urself|ur\s*self)\b/gi,
    /\b(go|should)\s+(die|kill\s+yourself)\b/gi,
    /\b(stupid|dumb|idiot|moron)\s+(bitch|whore|slut)\b/gi,
    /\b(all|every)\s+\w+\s+(are|is)\s+(stupid|dumb|evil|bad)\b/gi,
  ];
  const hasToxicPatterns = toxicPatterns.some(pattern => pattern.test(text));
  return suspiciousMatches || hasToxicPatterns;
}
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new post
export async function POST(req: NextRequest) {
  try {
    const { content, authorId, college } = await req.json();
    if (!content || !authorId || !college) {
      return NextResponse.json(
        { error: "Missing content, authorId, or college" },
        { status: 400 },
      );
    }
    if (isContentToxic(content)) {
      return NextResponse.json(
        { error: "Content flagged as toxic/abusive. Please revise your post." },
        { status: 403 },
      );
    }
    const post = await prisma.post.create({
      data: { content, authorId, college },
    });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

// Get all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, email: true } },
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
