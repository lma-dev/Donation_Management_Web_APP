# Spring Liberation Rose Database Schema

```mermaid
erDiagram

    User {
        string id PK
        string name
        string email UK
        datetime emailVerified
        string image
        string password
        Role role
        boolean isLocked
        datetime lockedAt
        int failedLoginAttempts
        string lockedBy
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }

    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }

    VerificationToken {
        string identifier
        string token UK
        datetime expires
    }

    DonationPlace {
        string id PK
        string name UK
        string note
        boolean isActive
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    MonthlyOverview {
        string id PK
        int year
        int month
        float exchangeRate
        bigint carryOver
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    SupporterDonation {
        string id PK
        string monthlyOverviewId FK
        string name
        bigint amount
        string currency
        bigint kyatAmount
        datetime deletedAt
        datetime createdAt
    }

    DistributionRecord {
        string id PK
        string monthlyOverviewId FK
        string donationPlaceId FK
        string recipient
        bigint amountMMK
        string remarks
        datetime deletedAt
        datetime createdAt
    }

    YearlySummary {
        string id PK
        int fiscalYear UK
        decimal totalCollected
        decimal totalDonated
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    MonthlyRecord {
        string id PK
        string yearId FK
        string month
        decimal collectedAmount
        decimal donatedAmount
        datetime deletedAt
    }

    AppSetting {
        string id PK
        string key UK
        string value
        datetime createdAt
        datetime updatedAt
    }

    ActivityLog {
        string id PK
        datetime timestamp
        string userId FK
        string userName
        string userRole
        string actionType
        string actionLabel
        string details
        string ipAddress
        string status
        datetime createdAt
        datetime updatedAt
    }

    %% Auth Relationships
    User ||--o{ Account : "has many"
    User ||--o{ Session : "has many"

    %% Monthly Overview Relationships
    MonthlyOverview ||--o{ SupporterDonation : "has many"
    MonthlyOverview ||--o{ DistributionRecord : "has many"
    DonationPlace ||--o{ DistributionRecord : "distributes to"

    %% Yearly Summary Relationships
    YearlySummary ||--o{ MonthlyRecord : "has many"

    %% Activity Log Relationships
    User ||--o{ ActivityLog : "has many"
```
