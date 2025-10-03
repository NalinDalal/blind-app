# Project Steps

---

> A step-by-step breakdown for building the Blind App, updated to reflect current progress and outline the remaining
frontend implementation.

### **Phase 1: Backend Foundation & Authentication (Largely Complete) ✅**

1. **Define Initial Database Schema**
    * **Status: COMPLETE**
    * The core database schema is defined in `prisma/schema.prisma`.
    * Models include `User`, `Post`, `Comment` (with self-relation for replies), `CommentLike`, `AnonMapping`,
      `Notification`, and `Log`.

2. **Set Up Project Structure and Dependencies**
    * **Status: COMPLETE**
    * The project is initialized as a **Next.js** application with **TypeScript**.
    * Folder structure is in place, including API routes, Redux state management, and component-based UI.
    * Dependencies are managed via `package.json` and include **Prisma**, **Redux Toolkit**, and **bcryptjs** for core
      functionality.

3. **Implement User Authentication Routes**
    * **Status: COMPLETE**
    * Backend routes for handling the custom authentication flow are implemented, including `register`, `login`, and
      `token` generation using JWTs.

4. **Develop Student Verification Logic**
    * **Status: COMPLETE**
    * College email verification is implemented, restricting sign-ups to `@oriental.ac.in` domains.
    * A complete OTP (One-Time Password) flow is in place:
        * `POST /api/request-otp` sends an OTP to the user's email.
        * `POST /api/verify-otp` validates the OTP and marks the user as verified.

5. **Create Anonymity Layer Service**
    * **Status: COMPLETE**
    * The service to map real users to anonymous identities is implemented.
    * The `AnonMapping` model links a `userId` to a unique `anonName`.
    * The `POST /api/anon/set` endpoint allows a user to set their anonymous name once, with checks for uniqueness and
      toxicity.

### **Phase 2: Core API Features (Largely Complete) ✅**

1. **Build Post, Comment, and Interaction Routes**
    * **Status: COMPLETE**
    * API endpoints for `Post`, `Comment`, and `CommentLike` are functional, supporting creation, fetching, and
      interactions.

2. **Implement Feed Service and Logic**
    * **Status: COMPLETE (V1)**
    * A V1 feed generation service is implemented in the `GET` handler of `/api/post/route.ts`. The next step is to
      enhance this on the frontend with advanced data fetching.

3. **Add Notification Service and Routes**
    * **Status: COMPLETE (Backend)**
    * Backend endpoints for creating, fetching, and updating notifications are implemented and ready for frontend
      integration.

### **Phase 3: Frontend Implementation & Integration (In Progress) 🚧**

1. **Set Up Frontend Server State Management**
    * **Status: TO-DO**
    * Integrate **TanStack Query** into the frontend providers. This will be used for all server-side data fetching,
      caching, and state management for posts, comments, and notifications.

2. **Build Authentication & Onboarding UI**
   * **Status: COMPLETE**
   * The multi-mode UI for Register, Login, OTP, and setting an Anonymous Name is fully functional and connected to the
     Redux state.

3. **Implement Infinite Scroll Feed with TanStack Query**
   * **Status: TO-DO**
   * Use TanStack Query's `useInfiniteQuery` hook to fetch post data from the `GET /api/posts` endpoint.
   * Implement lazy loading ("Load More" button or on-scroll trigger) using the cursor-based pagination we designed.
   * Build the React components to display posts, nested comments, and replies from the fetched data.
   * Implement mutations with `useMutation` for creating comments/replies and automatically refetching the feed by
     invalidating the query cache to handle stale data.

4. **Develop User Dashboard and Other UI Elements**
   * **Status: TO-DO**
   * Create a dedicated user dashboard page where users can view their own posts, comments, and manage profile
     settings.
   * Build out other necessary UI elements like a dedicated post detail page.

5. **Integrate Real-Time Notification UI**
   * **Status: TO-DO**
   * Implement a WebSocket client (e.g., using **Socket.IO**) to listen for real-time events from the server.
   * Build the frontend UI (e.g., a notification dropdown/panel) to display incoming push notifications for new
     comments and replies.

### **Phase 4: Moderation, Testing & Deployment (In Progress) 🚀**

1. **Content Moderation & Logging**
   * **Status: COMPLETE**
   * The local toxicity filter and logging for blocked content are fully integrated on the backend.

2. **Comprehensive Testing**
   * **Status: IN PROGRESS**
   * Automated testing workflows are set up via GitHub Actions. Evolve this by adding unit, integration, and E2E tests
     for both frontend and backend logic.

3. **Deployment & CI/CD**
   * **Status: IN PROGRESS**
   * The project has `Dockerfile`, `docker-compose.yml`, and a CI/CD workflow, establishing a solid foundation for
     automated deployments.

4. **Final Documentation**
   * **Status: IN PROGRESS**
   * Extensive documentation for the API, architecture, and components already exists. This should be continuously
     updated as new features are built.