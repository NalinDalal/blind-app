import bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (in reverse order due to foreign key constraints)
  await prisma.log.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.anonMapping.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing data");

  // Create Users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "john.doe@oriental.ac.in",
        password: hashedPassword,
        verified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "jane.smith@oriental.ac.in",
        password: hashedPassword,
        verified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "mike.johnson@oriental.ac.in",
        password: hashedPassword,
        verified: false,
        otp: "123456",
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah.wilson@oriental.ac.in",
        password: hashedPassword,
        verified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "alex.brown@oriental.ac.in",
        password: hashedPassword,
        verified: true,
      },
    }),
  ]);

  console.log("👥 Created users");

  // Create Anonymous Mappings
  const _anonMappings = await Promise.all([
    prisma.anonMapping.create({
      data: { userId: users[0].id, anonName: "Anonymous_Eagle" },
    }),
    prisma.anonMapping.create({
      data: { userId: users[1].id, anonName: "Silent_Tiger" },
    }),
    prisma.anonMapping.create({
      data: { userId: users[2].id, anonName: "Hidden_Wolf" },
    }),
    prisma.anonMapping.create({
      data: { userId: users[3].id, anonName: "Mystery_Fox" },
    }),
    prisma.anonMapping.create({
      data: { userId: users[4].id, anonName: "Shadow_Bear" },
    }),
  ]);

  console.log("🎭 Created anonymous mappings");

  // Create Posts (all associated with Oriental College)
  const _posts = await Promise.all([
    prisma.post.create({
      data: {
        content:
          "Just finished my final exams! The computer science program here is really challenging but rewarding. Anyone else feeling the relief?",
        college: "Oriental College",
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "Looking for study partners for organic chemistry. The lab sessions are intense and could use some help with the molecular structures.",
        college: "Oriental College",
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "The new dining hall food is actually pretty good! Especially the pasta station. Much better than last semester.",
        college: "Oriental College",
        authorId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "Does anyone know if the library extends hours during finals week? Need to find a quiet place to study for my physics exam.",
        college: "Oriental College",
        authorId: users[3].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "The career fair was amazing! Got interviews with three tech companies. Networking really pays off.",
        college: "Oriental College",
        authorId: users[4].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "This is inappropriate content that should be flagged for review by moderators.",
        college: "Oriental College",
        authorId: users[0].id,
        isFlagged: true,
      },
    }),
  ]);

  console.log("📝 Created posts");

  // (comments, likes, notifications, logs remain unchanged)
  // ... keep the rest of your script as-is

  console.log("✅ Database seeding completed successfully!");

  // Display summary
  const summary = {
    users: await prisma.user.count(),
    posts: await prisma.post.count(),
    comments: await prisma.comment.count(),
    commentLikes: await prisma.commentLike.count(),
    anonMappings: await prisma.anonMapping.count(),
    notifications: await prisma.notification.count(),
    logs: await prisma.log.count(),
  };

  console.log("📈 Seeding Summary:", summary);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
