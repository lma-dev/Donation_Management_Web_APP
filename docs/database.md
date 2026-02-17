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

    Campaign {
        string id PK
        string name
        string description
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    IncomingDonation {
        string id PK
        string campaignId FK
        string userId FK
        string donorName
        decimal originalAmount
        string originalCurrency
        decimal exchangeRate
        decimal convertedAmountMMK
        string note
        datetime donatedAt
        datetime createdAt
        datetime updatedAt
    }

    FundDistribution {
        string id PK
        string campaignId FK
        string userId FK
        string recipient
        decimal amountMMK
        string note
        datetime distributedAt
        datetime createdAt
        datetime updatedAt
    }

    MonthlyExchangeRate {
        string id PK
        string campaignId FK
        int month
        int year
        string fromCurrency
        string toCurrency
        decimal rate
    }

    %% Auth Relationships
    User ||--o{ Account : "has many"
    User ||--o{ Session : "has many"

    %% Domain Relationships
    User ||--o{ IncomingDonation : "records"
    User ||--o{ FundDistribution : "records"

    Campaign ||--o{ IncomingDonation : "receives"
    Campaign ||--o{ FundDistribution : "distributes"
    Campaign ||--o{ MonthlyExchangeRate : "has rates"
```
