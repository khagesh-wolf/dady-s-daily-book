# Project Documentation

## Sagar Anna Bhandar - Business Management System

This document provides comprehensive documentation of all features, workflows, and functionality in the Sagar Anna Bhandar application.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [User Authentication](#user-authentication)
3. [Customer Management](#customer-management)
4. [Transaction System](#transaction-system)
5. [Dashboard & Analytics](#dashboard--analytics)
6. [Expense Tracking](#expense-tracking)
7. [Data Backup & Recovery](#data-backup--recovery)
8. [Localization](#localization)
9. [Security Features](#security-features)
10. [Progressive Web App](#progressive-web-app)

---

## Application Overview

### Purpose

Sagar Anna Bhandar is designed for agricultural businesses in Nepal that:
- Provide tractor services to farmers
- Buy and sell crops (wheat, rice, maize)
- Manage customer credit accounts
- Track business expenses

### Target Users

- Agricultural traders
- Tractor service providers
- Grain merchants
- Small business owners in rural Nepal

### Core Workflow

```
Customer Registration → Transaction Entry → Due Tracking → Payment Collection
                                ↓
                    Dashboard Analytics ← Expense Tracking
```

---

## User Authentication

### Login System

The application uses Firebase Authentication with email/password.

**Login Flow:**
1. User opens the app
2. If not authenticated, LoginScreen is displayed
3. User enters email and password
4. On success, redirected to main app
5. Session persists until logout

### PIN Lock

An additional security layer using a 4-digit PIN:

**PIN Creation:**
- First-time users are prompted to create a PIN
- PIN is stored in `localStorage` as `app_pin`

**PIN Verification:**
- Required when app is opened after session expires
- 30-day inactivity timeout triggers re-authentication
- Activity tracking via `sessionStorage`

**PIN Management:**
- Change PIN via Settings → Security → Set/Change PIN

---

## Customer Management

### Customer List

**Features:**
- Alphabetically grouped customer list
- Search by name or phone number
- Filter by balance status (All / To Receive / To Pay)
- "Recently Added" section highlighting newest customer

**Display Information:**
- Customer name
- Phone number and address
- Current due amount with color coding:
  - 🟢 Green: Customer owes you (due)
  - 🔴 Red: You owe customer (owed)
  - ⚫ Gray: Settled balance

### Customer Detail View

**Customer Information:**
- Name, phone, address
- QR code for sharing transaction history
- Quick action buttons:
  - 📞 Call (tel: link)
  - 💬 WhatsApp (wa.me link)

**Balance Display:**
- Large balance amount
- Dynamic label: "Remaining Dues" / "We Owe" / "Balance Settled"

**Transaction History:**
- Latest 3 transactions shown
- "Show All Transactions" expands to full history
- Edit transaction by tapping

**Actions:**
- Add New Transaction
- Send WhatsApp Reminder (pre-formatted message)
- Delete Customer (soft delete with 60-day recovery)

### Adding/Editing Customers

**Required Fields:**
- Name (required)
- Phone (optional)
- Address (optional)

**Duplicate Detection:**
- System warns if customer name already exists
- User can confirm to create duplicate

### QR Code Feature

Each customer gets a unique QR code that:
- Contains a shareable URL
- Links to a public transaction view
- Allows customers to view their history without logging in

---

## Transaction System

### Transaction Types

#### 1. Tractor Services

**Sub-types:**
- **Hourly Rate**: Hours × Rate per hour
- **Trolley Rate**: Number of trolleys × Rate per trolley

**Fields:**
- Date (Nepali calendar)
- Hours and Minutes (or Trolley count)
- Rate
- Amount Paid
- Auto-calculated: Total Amount, Due Amount

#### 2. Crop Buy/Sell

**Trade Types:**
- Buy (खरिद) - Purchasing crops from customer
- Sell (बिक्रि) - Selling crops to customer

**Crop Types:**
- Wheat (गहुँ)
- Rice/Paddy (धान)
- Rice/Grain (चामल)
- Maize (मकै)
- Gas (ग्यास)

**Fields:**
- Date
- Trade type (Buy/Sell)
- Crop type
- Weight in Kg
- Rate per Kg
- Amount Paid/Received
- Auto-calculated: Total Amount, Due Amount

**Business Logic:**
- Crop Buy: Money goes out, negative due
- Crop Sell: Money comes in, positive due

#### 3. Cash Transactions

**Sub-types:**
- Cash Given: You give money to customer (increases credit)
- Cash Received: Customer pays you (reduces their dues)

**Fields:**
- Date
- Amount
- Details/Notes

### Transaction Calculations

```
Total Amount = Quantity × Rate
Due Amount = Total Amount - Amount Paid
```

For crop trades, due direction depends on buy/sell:
- Buy: Due = Amount Paid - Total (negative = you owe)
- Sell: Due = Total - Amount Received (positive = they owe)

### Nepali Date Picker

Transactions use the Bikram Sambat calendar:
- Visual calendar picker
- Converts to standard format for storage
- Displays in Nepali format

---

## Dashboard & Analytics

### Time Period Filter

Filter all analytics by:
- 3 Months
- 6 Months
- 1 Year
- Lifetime

### Summary Cards

**To Collect (Green):**
Sum of all positive customer balances

**To Pay (Red):**
Sum of all negative customer balances (absolute value)

### Recent Activity

Shows last 3 activities (transactions + expenses):
- Color-coded icons (incoming/outgoing)
- Amount with +/- prefix
- Edit/Delete options for expenses

### Tractor Report

**Metrics:**
- Total Income: Sum of all tractor service transactions
- Total Expenses: Sum of all recorded expenses
- Net Profit/Loss: Income - Expenses

### Crop Profit/Loss Chart

Bar chart visualization:
- X-axis: Crop types
- Y-axis: Profit/Loss amount
- Green bars: Profit
- Red bars: Loss

Calculation: `Sell Revenue - Buy Cost` per crop type

### Crop Inventory

**Stock Tracking:**
```
Current Stock = Total Bought - Total Sold
```

Displays remaining weight (Kg) for each crop type.

---

## Expense Tracking

### Adding Expenses

**Fields:**
- Type (category name)
- Amount
- Details/Notes
- Date (auto-set to current date)

### Expense Management

- View in Recent Activity section
- Edit expense details
- Delete expense

### Categories

User-defined categories (examples):
- Fuel/Diesel
- Maintenance
- Labor
- Parts
- Miscellaneous

---

## Data Backup & Recovery

### Local Backup (JSON Export)

**Creates a complete backup including:**
- All customers
- All transactions
- All expenses
- Backup timestamp

**File format:** `sagar-anna-bhandar-backup-{timestamp}.json`

### Import from Backup

**Process:**
1. Select JSON backup file
2. System validates file structure
3. Preview shows record counts
4. Confirm to import
5. Data merged with existing records

### Recently Deleted

**Soft Delete System:**
- Deleted customers moved to "Recently Deleted"
- 60-day retention period
- Restore function available
- Automatic permanent deletion after 60 days

### Refresh Data

Force sync with Firebase server:
- Clears local cache
- Reloads all data from Firestore

---

## Localization

### Supported Languages

| Language | Code | Native Name |
|----------|------|-------------|
| English  | en   | English     |
| Nepali   | ne   | नेपाली      |

### Language Switching

- Settings → Preferences → Language
- Instant switch, no reload required
- Preference saved in localStorage

### Translation Coverage

All UI elements are translated:
- Navigation labels
- Form labels and placeholders
- Button text
- Status messages
- Error messages

### Currency Formatting

- Symbol: Rs. (Nepali Rupees)
- Number format: Indian system (lakhs, crores)
- Example: Rs. 1,50,000

---

## Security Features

### Authentication Layers

1. **Firebase Auth**: Email/password login
2. **PIN Lock**: 4-digit local protection
3. **Session Management**: Activity-based timeout

### Data Protection

- **Firestore Rules**: Server-side access control
- **Offline Persistence**: Local encrypted IndexedDB
- **No Plain Text Secrets**: Config in environment

### Session Timeout

- 30-day inactivity triggers PIN re-entry
- Activity tracking on:
  - Mouse movement
  - Keyboard input
  - Touch events
  - Scroll events

---

## Progressive Web App

### Installation

**Android/iOS:**
1. Open in Chrome/Safari
2. Tap browser menu (⋮ or share)
3. Select "Add to Home Screen"
4. Confirm installation

### Offline Capabilities

- Full app works without internet
- Data cached in IndexedDB
- Changes sync when online
- Offline indicator (planned)

### PWA Features

- Standalone display mode
- Custom icons (192x192, 512x512)
- Splash screen
- Push notifications (planned)

### Service Worker

Handles:
- Asset caching
- Offline fallback
- Background sync

---

## Data Models

### Customer

```javascript
{
  id: string,           // Firestore document ID
  name: string,         // Customer name
  phone: string,        // Phone number
  address: string,      // Address/Village
  accessKey: string,    // QR code access key
  isDeleted: boolean,   // Soft delete flag
  deletedAt: Timestamp, // Deletion timestamp
  createdAt: Timestamp  // Creation timestamp
}
```

### Transaction

```javascript
{
  id: string,
  customerId: string,   // Reference to customer
  date: string,         // YYYY-MM-DD format
  mainType: string,     // 'tractor' | 'crops' | 'cash'
  type: string,         // Sub-type
  totalAmount: number,  // Calculated total
  dueAmount: number,    // Remaining balance
  details: string,      // Notes
  
  // Tractor-specific
  hours: number,
  minutes: number,
  rate: number,
  trolleys: number,
  
  // Crop-specific
  cropType: string,
  weight: number,
  
  isDeleted: boolean,
  deletedAt: Timestamp,
  createdAt: Timestamp
}
```

### Expense

```javascript
{
  id: string,
  type: string,         // Category
  amount: number,
  details: string,
  date: string,
  createdAt: Timestamp
}
```

---

## Component Architecture

```
App.jsx
├── LoginScreen
├── PinLock
├── CustomerList
│   └── CustomerListItem
├── CustomerDetail
│   ├── TransactionItem
│   └── CustomerQRModal
├── Dashboard
│   └── ActivityItem
├── Settings
├── AddCustomerForm
├── AddTransactionForm
├── AddExpenseForm
├── FullHistoryPage
├── RecentActivityPage
├── RecentlyDeleted
├── CropAnalysis
├── ImportBackup
└── BottomNav
```

---

## Keyboard Shortcuts

Currently, the app is optimized for touch interfaces. No keyboard shortcuts are implemented.

---

## Known Limitations

1. **Single User**: No multi-user collaboration
2. **No Cloud Backup**: Google Drive sync not implemented
3. **No Receipt Printing**: Manual only
4. **No Image Attachments**: Text-only records
5. **No Export to Excel**: JSON export only

---

## Future Enhancements (Planned)

- [ ] Multi-user support with roles
- [ ] Google Drive automatic backup
- [ ] Receipt generation and printing
- [ ] SMS reminders
- [ ] Inventory management
- [ ] Supplier management
- [ ] Report generation (PDF)
- [ ] Data export to Excel

---

## Support

For questions or issues:
- Review this documentation
- Check browser console for errors
- Verify Firebase connectivity
- Contact: [Developer Contact Info]
