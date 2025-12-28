# Project Documentation - Sagar Anna Bhandar Customer Portal

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Data Flow](#data-flow)
5. [Security Model](#security-model)
6. [PWA Features](#pwa-features)
7. [Internationalization](#internationalization)

---

## Project Overview

### Purpose

The Sagar Anna Bhandar Customer Portal is a read-only web application that allows customers to view their transaction history with the business. It's designed to be simple, fast, and accessible via QR codes.

### Business Context

Sagar Anna Bhandar is an agricultural business in Nepal that:
- Buys and sells crops (rice, wheat, maize)
- Provides tractor services
- Manages customer accounts with running balances

Customers need a way to check their transaction history and outstanding balance without contacting the business directly.

### Key Features

| Feature | Description |
|---------|-------------|
| QR Code Access | Customers scan a unique QR to access their data |
| Transaction History | Complete list of all transactions |
| Balance Display | Shows current outstanding amount |
| PWA Install | Can be installed as a home screen app |
| Offline Support | Works without internet using cached data |

---

## Architecture

### System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Admin App     │────▶│   Firestore     │◀────│ Customer Portal │
│   (Main App)    │     │   Database      │     │   (This App)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
   Admin Auth             Security Rules          Anonymous Auth
   (Email/Pass)           (RLS-like)              (Firebase)
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Routing | React Router DOM v7 |
| Backend | Firebase Firestore |
| Auth | Firebase Anonymous Auth |
| Hosting | Firebase Hosting |

---

## Components

### PublicCustomerPage.jsx

The main (and only) page component. Handles:

1. **URL Parameter Extraction** - Gets `accessKey` from URL
2. **Firebase Authentication** - Signs in anonymously
3. **Data Fetching** - Queries Firestore for customer and transactions
4. **PWA Prompts** - Handles install prompts
5. **Data Display** - Renders transaction list and balance

#### Key Functions

```javascript
// Format currency in Indian Rupee format
formatCurrency(amount) → "Rs. 1,234"

// Format Nepali date with time
formatTimestamp(nepaliDate, createdAt) → "2081-05-15 (3:45 PM)"

// Calculate total balance
totalDue = transactions.reduce((acc, tx) => acc + tx.dueAmount, 0)

// Get customer-friendly descriptions
getCustomerFriendlyDescription(tx) → "Sold 50kg Rice"
```

### App.jsx

Simple router setup with:
- Main route: `/customer/:accessKey`
- 404 fallback page
- Service worker registration for PWA

---

## Data Flow

### Access Flow

```
1. Customer scans QR code
   └── QR contains URL: https://portal.example.com/customer/abc123def456...

2. App extracts accessKey from URL
   └── accessKey = "abc123def456..."

3. App signs in anonymously to Firebase
   └── Creates temporary anonymous session

4. App queries Firestore
   └── customers WHERE accessKey == "abc123def456..." LIMIT 1
   └── transactions WHERE accessKey == "abc123def456..." LIMIT 5000

5. Firestore returns matching documents
   └── Security rules validate the query

6. App renders customer data and transactions
```

### Data Structure

#### Customer Document
```javascript
{
  id: "firestore-doc-id",
  name: "Customer Name",
  phone: "9841234567",
  address: "Village, District",
  accessKey: "32-char-hex-string",
  createdAt: Timestamp
}
```

#### Transaction Document
```javascript
{
  id: "firestore-doc-id",
  customerId: "customer-doc-id",
  accessKey: "32-char-hex-string",  // For portal queries
  mainType: "crops" | "tractor" | "cash",
  type: "crop_buy" | "crop_sell" | "cash_given" | ...,
  date: "2081-05-15",  // Nepali date
  totalAmount: 5000,
  amountPaid: 3000,
  dueAmount: 2000,
  details: "Sold 50kg Rice(धान)",
  createdAt: Timestamp,
  isDeleted: false
}
```

---

## Security Model

### Authentication

- Uses **Firebase Anonymous Authentication**
- No user accounts required
- Session is temporary and stateless

### Access Control

| User Type | Customers | Transactions | Expenses |
|-----------|-----------|--------------|----------|
| Admin (Email Auth) | Read/Write | Read/Write | Read/Write |
| Anonymous (Portal) | Read (scoped) | Read (scoped) | No Access |

### Access Key Security

- **128-bit entropy** (32 hex characters)
- Generated using `crypto.getRandomValues()`
- Unique per customer
- Cannot be guessed or brute-forced

### Firestore Rules

```javascript
match /customers/{customerId} {
  allow read, write: if isAdmin();
  
  // Anonymous: limited queries only
  allow list: if isAnonymous()
    && request.query.limit <= 1;
  
  // Document must have accessKey
  allow read: if isAnonymous() 
    && resource.data.accessKey != null;
}
```

---

## PWA Features

### Manifest Configuration

```json
{
  "name": "Sagar Anna Bhandar Portal",
  "short_name": "Sagar Anna Bhandar",
  "display": "standalone",
  "theme_color": "#2563eb",
  "background_color": "#ffffff"
}
```

### Service Worker

- Caches static assets for offline use
- Uses cache-first strategy
- Enables install prompts on mobile

### Install Prompts

The app shows install prompts in three locations:
1. Top banner (sticky)
2. Card in content area
3. Bottom prompt

Users can dismiss prompts (stored in localStorage for 7 days).

---

## Internationalization

### Supported Languages

Currently supports Nepali translations for key terms.

### Language Hook

```javascript
const { t } = useLanguage();

// Usage
t('transaction_history') // Returns translated string
```

### Translation File

Located at `src/lang.js`:
```javascript
export const translations = {
  en: {
    transaction_history: "Transaction History",
    balance: "Balance",
    // ...
  },
  ne: {
    transaction_history: "कारोबार इतिहास",
    balance: "बाँकी",
    // ...
  }
};
```

---

## Future Improvements

1. **Key Rotation** - Allow admin to regenerate access keys
2. **Access Logging** - Track when customers view their data
3. **Push Notifications** - Notify customers of new transactions
4. **PDF Export** - Allow customers to download statements
5. **Multi-language UI** - Full Nepali/English toggle
