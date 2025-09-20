# Blind App

Anonymous Community App for College Students

- **Project:** Create an app similar to Blind for anonymous discussions among verified college students.

some rules:

- work on ui with ai, but not like directly gave it to handle
- ui needs to be like not ai generated

easy boy, first create a system design, what features you want to have, really try to think, don't think everything at once, step by step
layout fucking 1-2-3 steps, then push them step by step

## Getting Started

### Email/OTP Setup

To enable OTP delivery via email, set the following environment variables in your `.env` file:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=Blind App <noreply@example.com>
```

You can use any SMTP provider (Gmail, Outlook, custom, etc). For local testing, services like [Mailtrap](https://mailtrap.io/) or [Ethereal Email](https://ethereal.email/) are recommended.

The app will send OTP codes to the user's email using these credentials.

---

### How to Test OTP Email Delivery

1. Make sure you have set your SENDGRID_API_KEY and EMAIL_FROM in your `.env` file.
2. Start your app and database as described above.
3. Open your browser and go to `/auth` (e.g., http://localhost:3000/auth).
4. Switch to the "OTP Auth" tab.
5. Enter your email and click "Request OTP".
6. Check your email inbox for a message from Blind App with your OTP code (check spam if not found).
7. Enter the OTP code in the form and click "Verify OTP".
8. If successful, you will see a confirmation message.

**Troubleshooting:**

- If you do not receive the email, check your SendGrid dashboard for errors or quota issues.
- Make sure your `EMAIL_FROM` is a verified sender in SendGrid.
- Check your server logs for any errors related to email sending.

---

### Running Locally (Without Docker Compose)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up a local PostgreSQL database and update the `DATABASE_URL` in your `.env` file.
3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Running with Docker Compose

1. Make sure Docker is installed and running.
2. Start the PostgreSQL database with Docker Compose (required!):
   ```bash
   docker compose up -d
   ```
   This will start the database in the background. You must keep it running while you use the app.
3. Ensure your `.env` file contains:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blindapp"
   ```
4. Run Prisma migrations to set up the database tables:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
7. To stop the database, run:
   ```bash
   docker compose down
   ```

---

work on system design first

```mermaid
flowchart TD
    subgraph Client["📱 Client (Mobile/Web App)"]
        U[User Interface]
        AuthUI[Login & Verification Screen]
        FeedUI[Discussion Feed]
        PostUI[Post/Comment Screen]
        NotifUI[Notification Panel]
    end

    subgraph Backend["☁️ Backend (App Server)"]
        API[API Gateway]
        AuthService[Authentication Service]
        AnonService[Anonymity Layer]
        FeedService[Feed & Post Service]
        NotifService[Notification Service]
        ModerationService[Content Moderation]
        AnalyticsService[Analytics/Logs]
    end

    subgraph Verification["🎓 Student Verification"]
        EmailCheck[College Email Verification]
        IDCheck[Optional Student ID Verification]
    end

    subgraph DataStore["🗄️ Data Stores"]
        UserDB[(User Database)]
        PostDB[(Posts & Comments DB)]
        AnonMapDB[(Anon Identity Mapping - Ephemeral)]
        NotifDB[(Notification Store)]
        LogDB[(Audit & Reports)]
    end

    subgraph Ext["🌐 External Services"]
        EmailAPI[Email/OTP Provider]
        PushAPI[Push Notifications Service]
        AIAPI[AI-based Toxicity/Abuse Filter]
    end

    %% Client connections
    U --> AuthUI
    U --> FeedUI
    U --> PostUI
    U --> NotifUI

    %% Flow: Auth & Verification
    AuthUI --> API --> AuthService --> Verification
    Verification --> EmailCheck --> EmailAPI
    Verification --> IDCheck
    AuthService --> UserDB

    %% Flow: Anonymity
    PostUI --> API --> AnonService
    AnonService --> AnonMapDB
    AnonService --> FeedService

    %% Flow: Feed & Posts
    FeedUI --> API --> FeedService
    FeedService --> PostDB

    %% Flow: Moderation
    FeedService --> ModerationService
    ModerationService --> AIAPI
    ModerationService --> LogDB

    %% Flow: Notifications
    NotifService --> NotifDB
    NotifService --> PushAPI
    API --> NotifUI
    NotifService --> API

    %% Flow: Analytics
    API --> AnalyticsService
    AnalyticsService --> LogDB

```

note something here, we have implemented authentication with help of ai, the db needs to be accounted still, we actually are not using any real db, also the otp is implemented for now
so authentication with 2fa is done
authentication, anonymity, and mapping of anonName with userId is done

to do: step 6;post, get request for social media post, and comments on them