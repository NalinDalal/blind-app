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
);

export type User = z.infer<typeof UserSchema>;

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
);

export type Post = z.infer<typeof PostSchema>;

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
);

export type Comment = z.infer<typeof CommentSchema>;

// ========== CommentLike ==========
export const CommentLikeSchema = createSchema(
  z.object({
    id: UUID,
    commentId: UUID,
    userId: UUID,
    createdAt: DateTime,
  }),
);

export type CommentLike = z.infer<typeof CommentLikeSchema>;

// ========== AnonMapping ==========
export const AnonMappingSchema = createSchema(
  z.object({
    id: UUID,
    userId: UUID,
    anonName: z.string(),
    createdAt: DateTime,
  }),
);

export type AnonMapping = z.infer<typeof AnonMappingSchema>;

// ========== Notification ==========
export const NotificationSchema = createSchema(
  z.object({
    id: UUID,
    userId: UUID,
    message: z.string(),
    read: z.boolean().default(false),
    createdAt: DateTime,
  }),
);

export type Notification = z.infer<typeof NotificationSchema>;

// ========== Log ==========
export const LogSchema = createSchema(
  z.object({
    id: UUID,
    action: z.string(),
    details: z.string().nullable().optional(),
    createdAt: DateTime,
  }),
);

export type Log = z.infer<typeof LogSchema>;
