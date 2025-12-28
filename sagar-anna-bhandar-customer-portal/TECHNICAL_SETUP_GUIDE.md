# Technical Setup Guide - Sagar Anna Bhandar Customer Portal

This guide provides step-by-step instructions for setting up the development environment and configuring the customer portal.

## Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| npm | 9.x or higher | Included with Node.js |
| Git | 2.x or higher | [git-scm.com](https://git-scm.com/) |
| Firebase CLI | Latest | `npm install -g firebase-tools` |

### Required Accounts

- **Firebase Account** - [console.firebase.google.com](https://console.firebase.google.com/)
- Access to the `sagar-anna-bhandar` Firebase project

---

## Initial Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd sagar-anna-bhandar-customer-portal
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `sagar-anna-bhandar` project
3. Go to Project Settings → General
4. Scroll to "Your apps" and find the web app config
5. Copy the configuration object

Edit `src/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                              // Your API key
  authDomain: "sagar-anna-bhandar.firebaseapp.com",
  projectId: "sagar-anna-bhandar",
  storageBucket: "sagar-anna-bhandar.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4: Enable Anonymous Authentication

1. In Firebase Console, go to Authentication → Sign-in method
2. Enable "Anonymous" provider
3. Click Save

### Step 5: Verify Firestore Rules

Ensure the Firestore security rules (in the parent project) allow anonymous access:

```javascript
match /customers/{customerId} {
  allow read: if isAnonymous() && resource.data.accessKey != null;
}

match /transactions/{transactionId} {
  allow read: if isAnonymous() && resource.data.accessKey != null;
}
```

---

## Development

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Testing with Access Key

1. First, create a customer in the admin app to get an access key
2. Navigate to: `http://localhost:5173/customer/<ACCESS_KEY>`
3. Replace `<ACCESS_KEY>` with the actual 32-character key

### Hot Module Replacement

Vite provides instant updates when you modify:
- React components
- CSS/Tailwind styles
- JavaScript modules

---

## Project Configuration

### Vite Configuration

`vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Tailwind Configuration

`tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### ESLint Configuration

`eslint.config.js` provides linting rules for:
- React hooks
- React refresh (HMR)
- General JavaScript best practices

---

## Building for Production

### Build Command

```bash
npm run build
```

This creates optimized files in the `dist/` folder:
- Minified JavaScript
- Optimized CSS
- Hashed filenames for cache busting

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

---

## Firebase Hosting Setup

### Initialize Firebase (One-time)

```bash
firebase login
firebase init hosting
```

Configuration options:
- Project: `sagar-anna-bhandar`
- Public directory: `dist`
- Single-page app: Yes
- GitHub Actions: No (optional)

### Configure Hosting Target

The `.firebaserc` file should contain:

```json
{
  "projects": {
    "default": "sagar-anna-bhandar"
  },
  "targets": {
    "sagar-anna-bhandar": {
      "hosting": {
        "sagar-portal": ["sagar-portal"]
      }
    }
  }
}
```

### Deploy

```bash
npm run build
firebase deploy --only hosting:sagar-portal
```

---

## PWA Configuration

### Manifest File

`public/manifest.json` defines:
- App name and short name
- Icons for various sizes
- Theme colors
- Display mode (standalone)

### Service Worker

`public/sw.js` provides:
- Static asset caching
- Offline support
- Cache-first network strategy

### Testing PWA Features

1. Build and deploy the app
2. Open in Chrome on mobile
3. Look for "Add to Home Screen" prompt
4. Or use Chrome DevTools → Application → Manifest

---

## Troubleshooting

### Common Issues

#### "Firebase: No Firebase App" Error

**Cause**: Firebase not initialized properly
**Solution**: Check `firebaseConfig.js` has valid credentials

#### "Permission Denied" on Firestore

**Cause**: Security rules blocking access
**Solution**: 
1. Check anonymous auth is enabled
2. Verify security rules allow anonymous reads
3. Ensure documents have `accessKey` field

#### PWA Not Installing

**Cause**: HTTPS required for PWA
**Solution**: Deploy to Firebase Hosting (provides HTTPS)

#### Blank Page on Production

**Cause**: Router configuration or base path issue
**Solution**: 
1. Check `firebase.json` has proper rewrites
2. Ensure all routes redirect to `index.html`

### Debug Mode

Add to browser URL for Firebase debug:
```
?debug=true
```

Check browser console for:
- Firebase initialization logs
- Firestore query logs
- Authentication state

---

## Environment Variables

This project doesn't use environment variables since:
- Firebase config is public (API key is safe to expose)
- No server-side secrets needed

If you need environment variables in the future:

1. Create `.env.local`:
   ```
   VITE_SOME_KEY=value
   ```

2. Access in code:
   ```javascript
   import.meta.env.VITE_SOME_KEY
   ```

---

## Code Quality

### Linting

```bash
npm run lint
```

### Type Checking

The project uses JSDoc comments for type hints. For full TypeScript support, rename files to `.tsx` and add type definitions.

---

## Related Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Detailed architecture
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
