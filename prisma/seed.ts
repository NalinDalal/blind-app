import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

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
        email: "john.doe@university.edu",
        password: hashedPassword,
        verified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "jane.smith@university.edu",
        password: hashedPassword,
        verified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "mike.johnson@university.edu",
        password: hashedPassword,
        verified: false,
        otp: "123456",
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah.wilson@university.edu",
        password: hashedPassword,
        verified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "alex.brown@university.edu",
        password: hashedPassword,
        verified: true,
      },
    }),
  ]);

  console.log("👥 Created users");

  // Create Anonymous Mappings
  const anonMappings = await Promise.all([
    prisma.anonMapping.create({
      data: {
        userId: users[0].id,
        anonName: "Anonymous_Eagle",
      },
    }),
    prisma.anonMapping.create({
      data: {
        userId: users[1].id,
        anonName: "Silent_Tiger",
      },
    }),
    prisma.anonMapping.create({
      data: {
        userId: users[2].id,
        anonName: "Hidden_Wolf",
      },
    }),
    prisma.anonMapping.create({
      data: {
        userId: users[3].id,
        anonName: "Mystery_Fox",
      },
    }),
    prisma.anonMapping.create({
      data: {
        userId: users[4].id,
        anonName: "Shadow_Bear",
      },
    }),
  ]);

  console.log("🎭 Created anonymous mappings");

  // Create Posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content:
          "Just finished my final exams! The computer science program here is really challenging but rewarding. Anyone else feeling the relief?",
        college: "MIT",
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "Looking for study partners for organic chemistry. The lab sessions are intense and could use some help with the molecular structures.",
        college: "Harvard University",
        authorId: users[1].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "The new dining hall food is actually pretty good! Especially the pasta station. Much better than last semester.",
        college: "Stanford University",
        authorId: users[2].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "Does anyone know if the library extends hours during finals week? Need to find a quiet place to study for my physics exam.",
        college: "UC Berkeley",
        authorId: users[3].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "The career fair was amazing! Got interviews with three tech companies. Networking really pays off.",
        college: "Carnegie Mellon",
        authorId: users[4].id,
      },
    }),
    prisma.post.create({
      data: {
        content:
          "This is inappropriate content that should be flagged for review by moderators.",
        college: "MIT",
        authorId: users[0].id,
        isFlagged: true,
      },
    }),
  ]);

  console.log("📝 Created posts");

  // Create Comments
  const comments = await Promise.all([
    // Comments on first post
    prisma.comment.create({
      data: {
        content:
          "Congratulations! CS at MIT is no joke. You should be proud of yourself!",
        postId: posts[0].id,
        authorId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "I felt the same way after my exams. The relief is incredible! What was your hardest subject?",
        postId: posts[0].id,
        authorId: users[2].id,
      },
    }),

    // Comments on second post
    prisma.comment.create({
      data: {
        content:
          "I'm also taking organic chem! Would love to study together. The molecular diagrams are killing me.",
        postId: posts[1].id,
        authorId: users[3].id,
      },
    }),
    prisma.comment.create({
      data: {
        content:
          "Check out the Khan Academy organic chemistry videos. They really helped me understand the concepts better.",
        postId: posts[1].id,
        authorId: users[4].id,
      },
    }),

    // Comments on third post
    prisma.comment.create({
      data: {
        content:
          "Really? I haven't tried the new dining hall yet. Maybe I'll check it out tomorrow.",
        postId: posts[2].id,
        authorId: users[0].id,
      },
    }),

    // Comments on fourth post
    prisma.comment.create({
      data: {
        content:
          "Yes! The library is open 24/7 during finals week. Perfect for late night studying.",
        postId: posts[3].id,
        authorId: users[1].id,
      },
    }),

    // Flagged comment
    prisma.comment.create({
      data: {
        content:
          "This comment contains inappropriate language and should be flagged.",
        postId: posts[0].id,
        authorId: users[4].id,
        isFlagged: true,
      },
    }),
  ]);

  console.log("💬 Created comments");

  // Create Comment Likes
  await Promise.all([
    prisma.commentLike.create({
      data: {
        commentId: comments[0].id,
        userId: users[0].id, // Author of the original post likes the comment
      },
    }),
    prisma.commentLike.create({
      data: {
        commentId: comments[0].id,
        userId: users[2].id, // Another user likes the comment
      },
    }),
    prisma.commentLike.create({
      data: {
        commentId: comments[1].id,
        userId: users[1].id,
      },
    }),
    prisma.commentLike.create({
      data: {
        commentId: comments[2].id,
        userId: users[1].id, // Author of the original post likes the response
      },
    }),
    prisma.commentLike.create({
      data: {
        commentId: comments[3].id,
        userId: users[3].id, // User who made the study partner request likes the helpful response
      },
    }),
    prisma.commentLike.create({
      data: {
        commentId: comments[5].id,
        userId: users[3].id,
      },
    }),
  ]);

  console.log("👍 Created comment likes");

  // Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        message: "Your post received a new comment",
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[1].id,
        message: "Someone liked your comment",
        read: true,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[2].id,
        message: "Welcome to the platform! Please verify your email.",
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[3].id,
        message: "Your comment received a like",
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[4].id,
        message: "Your post about the career fair is trending!",
        read: true,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        message: "Your content has been flagged for review",
        read: false,
      },
    }),
  ]);

  console.log("🔔 Created notifications");

  // Create Logs
  await Promise.all([
    prisma.log.create({
      data: {
        action: "USER_REGISTRATION",
        details: `New user registered: ${users[0].email}`,
      },
    }),
    prisma.log.create({
      data: {
        action: "POST_CREATED",
        details: `Post created by user ${users[0].id}`,
      },
    }),
    prisma.log.create({
      data: {
        action: "COMMENT_FLAGGED",
        details: `Comment ${comments[6].id} was flagged for inappropriate content`,
      },
    }),
    prisma.log.create({
      data: {
        action: "POST_FLAGGED",
        details: `Post ${posts[5].id} was flagged for review`,
      },
    }),
    prisma.log.create({
      data: {
        action: "USER_LOGIN",
        details: `User ${users[1].email} logged in`,
      },
    }),
    prisma.log.create({
      data: {
        action: "EMAIL_VERIFICATION_SENT",
        details: `Verification email sent to ${users[2].email}`,
      },
    }),
    prisma.log.create({
      data: {
        action: "COMMENT_LIKED",
        details: `Comment ${comments[0].id} received a like`,
      },
    }),
  ]);

  console.log("📊 Created logs");

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
