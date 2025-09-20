
# Blind App

Anonymous Community App for College Students

- **Project:** Create an app similar to Blind for anonymous discussions among verified college students.

some rules:

- work on ui with ai, but not like directly gave it to handle
- ui needs to be like not ai generated

easy boy, first create a system design, what features you want to have, really try to think, don't think everything at once, step by step
layout fucking 1-2-3 steps, then push them step by step


## Getting Started

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
2. Start the PostgreSQL database with Docker Compose:
    ```bash
    docker compose up -d
    ```
3. Update your `.env` file to use the following connection string:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blindapp"
    ```
4. Run Prisma migrations:
    ```bash
    npx prisma migrate dev --name init
    ```
5. Generate Prisma client:
    ```bash
    npx prisma generate
    ```
6. Start the development server:
    ```bash
    npm run dev
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
