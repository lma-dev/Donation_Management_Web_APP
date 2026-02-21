# Spring Liberation Rose — Business Flow Diagrams

## 1. Authentication Flow

```mermaid
flowchart TD
    A([User visits login page]) --> B[Enter email & password]
    B --> C{Form validation}
    C -- Invalid --> D[Show validation error]
    D --> B
    C -- Valid --> E[Call NextAuth signIn]
    E --> F{User exists?}
    F -- No --> G[Show error: Invalid credentials]
    G --> B
    F -- Yes --> H{Account locked?}
    H -- Yes --> I[Show error: Account locked]
    I --> B
    H -- No --> J{Password correct?}
    J -- No --> K[Increment failed attempts]
    K --> L{Attempts >= 5?}
    L -- Yes --> M[Lock account]
    M --> I
    L -- No --> G
    J -- Yes --> N{Failed attempts > 0?}
    N -- Yes --> O[Reset failed attempts to 0]
    O --> P[Create JWT session]
    N -- No --> P
    P --> Q[Log activity: Login]
    Q --> R([Redirect to /dashboard])
```

## 2. Dashboard Tab

```mermaid
flowchart TD
    A([User navigates to Dashboard]) --> B[Fetch dashboard data]
    B --> C[GET /api/dashboard]
    C --> D{Auth check}
    D -- Unauthorized --> E([Redirect to login])
    D -- Authorized --> F[Query aggregated data]
    F --> G[Render KPI cards]
    F --> H[Render Donation Bar Chart]
    F --> I[Render Distribution Pie Chart]
    G --> J([Dashboard displayed])
    H --> J
    I --> J
```

## 3. Monthly Overview Tab

```mermaid
flowchart TD
    A([User navigates to Monthly Overview]) --> B[Select Year & Month]
    B --> C[GET /api/monthly?year&month]
    C --> D{Data exists?}
    D -- No --> E{User is ADMIN?}
    E -- No --> F[Show: No data available]
    E -- Yes --> G[Fetch previous month balance]
    G --> H[Show Create Monthly Form]
    H --> I[Enter exchange rate & carry over]
    I --> J[POST /api/monthly]
    J --> K[Reload monthly data]
    D -- Yes --> L[Display Monthly Overview]

    L --> M[Show KPI Cards]
    L --> N[Supporter Donations Table]
    L --> O[Distribution Records Table]

    subgraph Exchange Rate
        L --> P{User is ADMIN?}
        P -- Yes --> Q[Edit exchange rate inline]
        Q --> R[PATCH /api/monthly]
        R --> S[Recalculate JPY donations]
        S --> K
    end

    subgraph Supporter Donations
        N --> N1{User is ADMIN?}
        N1 -- Yes --> N2[Add / Edit / Delete buttons visible]
        N2 --> N3{Action?}
        N3 -- Add --> N4[Open Add Supporter Dialog]
        N4 --> N5[Select name, enter amount, select currency]
        N5 --> N6{Currency = JPY?}
        N6 -- Yes --> N7[Auto-calculate kyatAmount]
        N6 -- No --> N8[kyatAmount = amount]
        N7 --> N9[POST /api/monthly/supporter]
        N8 --> N9
        N9 --> K
        N3 -- Edit --> N10[Open Edit Dialog with prefilled data]
        N10 --> N11[PUT /api/monthly/supporter]
        N11 --> K
        N3 -- Delete --> N12[Confirm deletion]
        N12 --> N13[DELETE /api/monthly/supporter]
        N13 --> K
    end

    subgraph Distribution Records
        O --> O1{User is ADMIN?}
        O1 -- Yes --> O2[Add / Edit / Delete buttons visible]
        O2 --> O3{Action?}
        O3 -- Add --> O4[Open Add Distribution Dialog]
        O4 --> O5[Select donation place, enter recipient & amount]
        O5 --> O6[POST /api/monthly/distribution]
        O6 --> K
        O3 -- Edit --> O7[Open Edit Dialog]
        O7 --> O8[PUT /api/monthly/distribution]
        O8 --> K
        O3 -- Delete --> O9[Confirm deletion]
        O9 --> O10[DELETE /api/monthly/distribution]
        O10 --> K
    end

    subgraph Export
        L --> X1[Click Export dropdown]
        X1 --> X2{Select format}
        X2 -- Excel --> X3[POST /api/monthly/export type=excel]
        X2 -- PDF --> X4[POST /api/monthly/export type=pdf]
        X2 -- JSON --> X5[POST /api/monthly/export type=json]
        X3 --> X6[Download file]
        X4 --> X6
        X5 --> X6
    end
```

## 4. Yearly Overview Tab

```mermaid
flowchart TD
    A([User navigates to Yearly Overview]) --> B[Fetch available years]
    B --> C[GET /api/yearly/available-years]
    C --> D[Select fiscal year]
    D --> E[GET /api/yearly?year]
    E --> F{Data exists?}
    F -- No --> G[Show: No data for this year]
    F -- Yes --> H[Display Yearly Summary]
    H --> I[KPI Cards: Total Collected, Total Donated, Remaining]
    H --> J[Monthly Breakdown Table]
    H --> K{Export?}
    K -- Yes --> L{Select format}
    L -- Excel --> M[POST /api/yearly/export type=excel]
    L -- PDF --> N[POST /api/yearly/export type=pdf]
    L -- JSON --> O[POST /api/yearly/export type=json]
    M --> P[Download file]
    N --> P
    O --> P
```

## 5. User Management Tab

```mermaid
flowchart TD
    A([Admin navigates to User Management]) --> B{Role >= ADMIN?}
    B -- No --> C([Access denied / redirect])
    B -- Yes --> D[GET /api/users]
    D --> E[Display user list with search & pagination]

    E --> F{Action?}
    F -- Create --> G[Open Create User Dialog]
    G --> H[Enter name, email, password, role]
    H --> I{Form valid?}
    I -- No --> J[Show validation errors]
    J --> H
    I -- Yes --> K[POST /api/users]
    K --> L{Success?}
    L -- Duplicate email --> M[Show error: Email already exists]
    M --> H
    L -- Yes --> N[Log activity: Added user]
    N --> O[Refresh user list]

    F -- Edit --> P[Open Edit User Dialog]
    P --> Q[Modify fields, password optional]
    Q --> R[PUT /api/users/:id]
    R --> S[Log activity: Updated user]
    S --> O

    F -- Delete --> T[Show confirmation dialog]
    T --> U[DELETE /api/users/:id]
    U --> V[Log activity: Deleted user]
    V --> O

    F -- Lock --> W[Show confirmation dialog]
    W --> X[POST /api/users/:id/lock]
    X --> Y[Log activity: Locked user]
    Y --> O

    F -- Unlock --> Z[Show confirmation dialog]
    Z --> AA[DELETE /api/users/:id/lock]
    AA --> AB[Log activity: Unlocked user]
    AB --> O

    E --> AC[Search by name or email]
    AC --> AD[Client-side filter]
    AD --> E
```

## 6. Donation Place Management Tab

```mermaid
flowchart TD
    A([Admin navigates to Donation Place Management]) --> B{Role >= ADMIN?}
    B -- No --> C([Access denied / redirect])
    B -- Yes --> D[GET /api/donation-places]
    D --> E[Display place list with search & pagination]

    E --> F{Action?}
    F -- Create --> G[Open Create Dialog]
    G --> H[Enter name, note, isActive toggle]
    H --> I{Form valid?}
    I -- No --> J[Show validation errors]
    J --> H
    I -- Yes --> K[POST /api/donation-places]
    K --> L[Refresh list]

    F -- Edit --> M[Open Edit Dialog with prefilled data]
    M --> N[Modify fields]
    N --> O[PUT /api/donation-places/:id]
    O --> L

    F -- Delete --> P[Show confirmation dialog]
    P --> Q[DELETE /api/donation-places/:id]
    Q --> L

    E --> R[Search by name]
    R --> S[Client-side filter]
    S --> E
```

## 7. Activity Logs Tab

```mermaid
flowchart TD
    A([System Admin navigates to Activity Logs]) --> B{Role = SYSTEM_ADMIN?}
    B -- No --> C([Access denied / redirect])
    B -- Yes --> D[GET /api/activity-logs]
    D --> E[Display logs table with pagination]

    E --> F[Apply filters]
    F --> G{Filter type?}
    G -- User --> H[Filter by user name]
    G -- Action Type --> I[Filter by action type]
    G -- Date Range --> J[Filter by date from/to]
    G -- Clear All --> K[Reset all filters]
    H --> L[Refetch with filter params]
    I --> L
    J --> L
    K --> L
    L --> E

    E --> M{Export?}
    M -- Yes --> N[POST /api/activity-logs/export]
    N --> O[Download CSV file]

    E --> P[Navigate pages]
    P --> Q[Server-side pagination]
    Q --> E

    E --> R[Click Refresh]
    R --> D
```

## 8. Profile & Settings

```mermaid
flowchart TD
    A([User navigates to Profile]) --> B[GET /api/profile]
    B --> C[Display user info: name, email, role, avatar]

    C --> D{Change password?}
    D -- Yes --> E[Enter current password]
    E --> F[Enter new password & confirm]
    F --> G{Client validation}
    G -- Weak password --> H[Show strength indicator errors]
    H --> F
    G -- Mismatch --> I[Show: Passwords do not match]
    I --> F
    G -- Valid --> J[POST /api/profile/change-password]
    J --> K{Success?}
    K -- Wrong current password --> L[Show error]
    L --> E
    K -- Yes --> M[Show success toast]

    subgraph Settings
        N([User navigates to Settings]) --> O[Display settings page]
        O --> P{Action?}
        P -- Change language --> Q[Select EN / JA / MM]
        Q --> R[Update locale, reload page]
        P -- View login history --> S[GET /api/profile/login-history]
        S --> T[Display login history list]
    end
```
