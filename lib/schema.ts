// lib/schema.ts
import { z } from "zod";
import { createSchema } from "zod-openapi";

// ========== Base Schemas ==========
export const UUID = z.string().uuid();
export const DateTime = z.string().datetime();

// ========== User ==========
export const UserSchema = createSchema(
  z.object({
    id: UUID,
    email: z.string().email(),
    password: z.string().min(6),
    createdAt: DateTime,
    verified: z.boolean().default(false),
    otp: z.string().nullable().optional(),
  }),
  { title: "User", description: "A user of the system" },
);

export type User = z.infer<typeof UserSchema.shape>;

// ========== Post ==========
export const PostSchema = createSchema(
  z.object({
    id: UUID,
    content: z.string(),
    college: z.string(),
    createdAt: DateTime,
    authorId: UUID,
    isFlagged: z.boolean().default(false),
  }),
  { title: "Post", description: "A post created by a user" },
);

export type Post = z.infer<typeof PostSchema.shape>;

// ========== Comment ==========
export const CommentSchema = createSchema(
  z.object({
    id: UUID,
    content: z.string(),
    createdAt: DateTime,
    postId: UUID,
    authorId: UUID,
    isFlagged: z.boolean().default(false),
  }),
  { title: "Comment", description: "A comment on a post" },
);

export type Comment = z.infer<typeof CommentSchema.shape>;

// ========== CommentLike ==========
export const CommentLikeSchema = createSchema(
  z.object({
    id: UUID,
    commentId: UUID,
    userId: UUID,
    createdAt: DateTime,
  }),
  { title: "CommentLike", description: "A like on a comment" },
);

export type CommentLike = z.infer<typeof CommentLikeSchema.shape>;

// ========== AnonMapping ==========
export const AnonMappingSchema = createSchema(
  z.object({
    id: UUID,
    userId: UUID,
    anonName: z.string(),
    createdAt: DateTime,
  }),
  { title: "AnonMapping", description: "Anonymous mapping for a user" },
);

export type AnonMapping = z.infer<typeof AnonMappingSchema.shape>;

// ========== Notification ==========
export const NotificationSchema = createSchema(
  z.object({
    id: UUID,
    userId: UUID,
    message: z.string(),
    read: z.boolean().default(false),
    createdAt: DateTime,
  }),
  { title: "Notification", description: "A notification for a user" },
);

export type Notification = z.infer<typeof NotificationSchema.shape>;

// ========== Log ==========
export const LogSchema = createSchema(
  z.object({
    id: UUID,
    action: z.string(),
    details: z.string().nullable().optional(),
    createdAt: DateTime,
  }),
  { title: "Log", description: "A system log entry" },
);

export type Log = z.infer<typeof LogSchema.shape>;
