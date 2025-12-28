# Technical Setup Guide

This guide provides step-by-step instructions for setting up the development environment for Sagar Anna Bhandar.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Development Workflow](#development-workflow)
5. [Project Structure](#project-structure)
6. [Configuration Files](#configuration-files)
7. [Adding Features](#adding-features)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Download |
|----------|-----------------|----------|
| Node.js  | 18.0.0          | [nodejs.org](https://nodejs.org/) |
| npm      | 9.0.0           | Included with Node.js |
| Git      | 2.30.0          | [git-scm.com](https://git-scm.com/) |

### Recommended Tools

- **VS Code**: Recommended IDE with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint
- **Firebase CLI**: `npm install -g firebase-tools`
- **Chrome DevTools**: For debugging and PWA testing

### Accounts Required

- **Firebase Account**: [console.firebase.google.com](https://console.firebase.google.com/)
- **GitHub Account**: For version control (optional but recommended)

---

## Project Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd sagar-anna-bhandar
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages:
- React 19
- Firebase 12.5
- Tailwind CSS
- Chart.js
- Lucide React icons
- Nepali date picker
- QR code generator
- And more...

### Step 3: Verify Installation

```bash
npm run dev
```

The app should open at `http://localhost:8080` (or 5173 if 8080 is busy).

---

## Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "sagar-anna-bhandar")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your region (asia-south1 recommended for Nepal)
5. Click **Enable**

### Step 4: Get Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps**
3. Click the Web icon (`</>`)
4. Register app with nickname
5. Copy the `firebaseConfig` object

### Step 5: Configure Application

Edit `src/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Step 6: Set Up Firestore Security Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Customers collection
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
    
    // Expenses collection
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish** to deploy rules.

### Step 7: Create Test User

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter email and password
4. Click **Add user**

---

## Development Workflow

### Starting Development Server

```bash
npm run dev
```

Features:
- Hot Module Replacement (HMR)
- Fast refresh
- Error overlay
- Opens at http://localhost:8080

### Building for Production

```bash
npm run build
```

Output: `dist/` directory with optimized assets

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

---

## Project Structure

```
sagar-anna-bhandar/
├── public/                 # Static assets
│   ├── icon.png           # App icon
│   ├── logo.png           # Logo image
│   ├── manifest.json      # PWA manifest
│   ├── pwa-192x192.png    # PWA icon
│   ├── pwa-512x512.png    # PWA icon large
│   └── sw.js              # Service worker
│
├── src/
│   ├── assets/            # Bundled assets
│   │   └── react.svg
│   │
│   ├── components/        # React components
│   │   ├── AddCustomerForm.jsx
│   │   ├── AddExpenseForm.jsx
│   │   ├── AddTransactionForm.jsx
│   │   ├── BottomNav.jsx
│   │   ├── CropAnalysis.jsx
│   │   ├── CustomerDetail.jsx
│   │   ├── CustomerList.jsx
│   │   ├── CustomerQRModal.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FullHistoryPage.jsx
│   │   ├── ImportBackup.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── PinLock.jsx
│   │   ├── RecentActivityPage.jsx
│   │   ├── RecentlyDeleted.jsx
│   │   ├── Settings.jsx
│   │   └── TransactionItem.jsx
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useCollection.js    # Firestore realtime hook
│   │   ├── useLanguage.jsx     # i18n context
│   │   └── useStorage.js       # Local storage hook
│   │
│   ├── utils/             # Utility functions
│   │   └── dateUtils.js   # Date formatting
│   │
│   ├── App.jsx            # Root component
│   ├── App.css            # Global styles
│   ├── main.jsx           # Entry point
│   ├── index.css          # Tailwind imports
│   ├── lang.js            # Translations
│   ├── firebaseConfig.js  # Firebase setup
│   └── imageResizer.js    # Image utilities
│
├── sagar-portal/          # Customer-facing portal (subproject)
│
├── .firebaserc            # Firebase project config
├── firebase.json          # Firebase hosting config
├── index.html             # HTML template
├── tailwind.config.ts     # Tailwind configuration
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies
├── README.md              # Project overview
├── DEPLOYMENT.md          # Deployment guide
├── PROJECT_DOCUMENTATION.md # Feature documentation
└── TECHNICAL_SETUP_GUIDE.md # This file
```

---

## Configuration Files

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### tailwind.config.ts

Key configurations:
- Custom colors and design tokens
- Dark mode support
- Animation keyframes
- Extended theme

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

---

## Adding Features

### Adding a New Component

1. Create file in `src/components/`:

```jsx
// src/components/NewFeature.jsx
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function NewFeature({ prop1, prop2 }) {
  const { t } = useLanguage();
  
  return (
    <div className="p-4">
      <h1>{t('new_feature_title')}</h1>
      {/* Component content */}
    </div>
  );
}
```

2. Add translations in `src/lang.js`:

```javascript
new_feature_title: { en: 'New Feature', ne: 'नयाँ सुविधा' },
```

3. Import and use in `App.jsx`:

```jsx
import NewFeature from './components/NewFeature.jsx';
```

### Adding a New Firestore Collection

1. Create hook or use existing `useCollection`:

```javascript
const { data: newData } = useCollection('newCollection', user);
```

2. Add CRUD operations in `App.jsx`:

```javascript
const handleSaveNewItem = async (itemData) => {
  try {
    await addDoc(collection(db, 'newCollection'), {
      ...itemData,
      createdAt: new Date()
    });
  } catch (e) {
    console.error("Error saving item: ", e);
  }
};
```

3. Update Firestore security rules.

### Adding New Translations

Edit `src/lang.js`:

```javascript
export const translations = {
  // Existing translations...
  
  // Add new keys
  new_key: { en: 'English text', ne: 'नेपाली पाठ' },
};
```

Use in components:

```jsx
const { t } = useLanguage();
// ...
<p>{t('new_key')}</p>
```

---

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Logout functionality
- [ ] PIN creation
- [ ] PIN verification
- [ ] Session timeout

**Customer Management:**
- [ ] Add new customer
- [ ] Edit customer
- [ ] Delete customer
- [ ] Restore deleted customer
- [ ] Search customers
- [ ] Filter by balance

**Transactions:**
- [ ] Add tractor transaction
- [ ] Add crop buy transaction
- [ ] Add crop sell transaction
- [ ] Add cash transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Verify calculations

**Dashboard:**
- [ ] Summary cards correct
- [ ] Charts render
- [ ] Time filter works
- [ ] Recent activity displays

**Offline Mode:**
- [ ] Disable network
- [ ] Verify data loads from cache
- [ ] Add data offline
- [ ] Re-enable network
- [ ] Verify sync

### Browser DevTools

1. **Console**: Check for errors
2. **Network**: Monitor API calls
3. **Application**: Check localStorage, IndexedDB, Service Worker
4. **Lighthouse**: Run PWA audit

---

## Troubleshooting

### Common Issues

#### Firebase Connection Error

**Symptoms:** Data not loading, authentication failing

**Solutions:**
1. Verify `firebaseConfig.js` credentials
2. Check Firebase Console for project status
3. Verify Firestore rules allow access
4. Check browser console for specific errors

#### Build Failures

**Symptoms:** `npm run build` fails

**Solutions:**
```bash
# Clear node_modules
rm -rf node_modules
npm cache clean --force
npm install

# Check for TypeScript errors
npm run lint
```

#### PWA Not Installing

**Symptoms:** "Add to Home Screen" not appearing

**Solutions:**
1. Must be served over HTTPS (or localhost)
2. Check `manifest.json` is valid
3. Verify service worker registration
4. Check DevTools → Application → Manifest

#### Offline Mode Not Working

**Symptoms:** App fails without internet

**Solutions:**
1. Verify service worker is registered
2. Check IndexedDB persistence is enabled
3. Clear site data and reload
4. Check for errors in console

#### Nepali Date Picker Issues

**Symptoms:** Calendar not showing, wrong dates

**Solutions:**
1. Verify CSS import: `import "@kkeshavv18/nepali-datepicker/dist/index.css"`
2. Check for z-index conflicts
3. Ensure proper props are passed

### Getting Help

1. Check browser console for errors
2. Review Firebase Console logs
3. Search GitHub issues
4. Check Stack Overflow
5. Contact development team

---

## Development Best Practices

### Code Style

- Use functional components with hooks
- Follow naming conventions:
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
- Keep components small and focused
- Extract reusable logic into hooks

### State Management

- Use `useState` for local component state
- Use `useMemo`/`useCallback` for optimization
- Firestore provides real-time sync (no Redux needed)

### Styling

- Use Tailwind CSS utility classes
- Follow design system tokens in `tailwind.config.ts`
- Avoid inline styles
- Mobile-first responsive design

### Performance

- Lazy load heavy components
- Use `useMemo` for expensive calculations
- Optimize re-renders with proper dependencies
- Keep bundle size minimal

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.2 | Current | Latest stable |
| 1.1.0 | - | Added QR codes, crop analysis |
| 1.0.0 | - | Initial release |

---

## Contact

For technical questions or contributions:
- **Developer**: Khagesh
- **Project Lead**: Diwash
