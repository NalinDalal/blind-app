# Project Steps

A step-by-step breakdown for building the Blind App:

1. **Define initial database schema**
   - Design and document the core database schema (users, posts, comments, anonymity mapping, notifications, logs, etc.)
2. **Set up project structure and dependencies**
   - Initialize the backend project, set up folder structure, and install required dependencies (framework, ORM, etc.)
3. **Implement user authentication routes**
   - Create routes for user registration, login, and verification (email/OTP, student ID).
4. **Develop student verification logic**
   - Implement college email and optional student ID verification logic and integrate with external email/OTP provider.
5. **Create anonymity layer service**
   - Develop the service that maps real users to anonymous identities for posts and comments.
6. **Build post and comment routes**
   - Implement API endpoints for creating, fetching, and interacting with posts and comments.
7. **Implement feed service and logic**
   - Develop the logic for generating and serving the discussion feed to users.
8. **Add notification service and routes**
   - Create notification logic and API endpoints, integrate with push notification provider.
9. **Integrate content moderation (AI filter)**
   - Add AI-based toxicity/abuse filter to moderate posts and comments before publishing.
10. **Implement content moderation logging**
    - Log moderation actions and flagged content to the audit database.
11. **Develop analytics and logging service**
    - Track user activity, post engagement, and system events for analytics and reporting.
12. **Set up frontend authentication UI**
    - Build login and verification screens for the client app.
13. **Develop main feed and post UI**
    - Create the main discussion feed and post/comment UI for the client app.
14. **Integrate notification UI**
    - Add notification panel and real-time updates to the client app.
15. **Testing, deployment, and documentation**
    - Test all features, deploy the app, and write documentation for usage and contribution.
