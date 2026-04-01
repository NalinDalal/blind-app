# --------------------------
# Builder stage
# --------------------------
FROM node:22-alpine AS builder

WORKDIR /app

ARG JWT_SECRET
ARG SENDGRID_API_KEY

ENV JWT_SECRET=$JWT_SECRET
ENV SENDGRID_API_KEY=$SENDGRID_API_KEY

COPY package.json package-lock.json* yarn.lock* ./
COPY prisma ./prisma
RUN npm install --frozen-lockfile

COPY . .

RUN npx prisma generate

# Build Next.js
RUN npm run build || yarn build

# --------------------------
# Runner stage
# --------------------------
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Optional: set runtime env if needed
ARG JWT_SECRET
ARG SENDGRID_API_KEY
ENV JWT_SECRET=$JWT_SECRET
ENV SENDGRID_API_KEY=$SENDGRID_API_KEY

# Copy build artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts

# Copy the custom-generated Prisma Client
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

EXPOSE 3000
CMD ["npm", "start"]