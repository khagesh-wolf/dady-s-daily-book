# Deployment Guide - Sagar Anna Bhandar Customer Portal

This guide covers deploying the customer portal to Firebase Hosting.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```
3. **Firebase Project** - Must be the same project as the admin app
4. **Firebase Configuration** - Must have valid credentials in `src/firebaseConfig.js`

## Firebase Project Setup

### 1. Login to Firebase

```bash
firebase login
```

### 2. Initialize Firebase (if not already done)

```bash
firebase init hosting
```

Select:
- Use existing project: `sagar-anna-bhandar`
- Public directory: `dist`
- Single-page app: Yes
- Overwrite index.html: No

### 3. Configure Firebase Hosting Target

The project uses a hosting target called `sagar-portal`. This is already configured in `.firebaserc`:

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

## Deployment Steps

### Step 1: Configure Firebase Credentials

Edit `src/firebaseConfig.js` and add your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

> ⚠️ **Important**: Use the SAME Firebase project as the admin app to share Firestore data.

### Step 2: Build the Application

```bash
npm run build
```

This creates optimized production files in the `dist/` folder.

### Step 3: Deploy to Firebase

```bash
firebase deploy --only hosting:sagar-portal
```

### Step 4: Verify Deployment

After deployment, Firebase will provide the hosting URL:
```
✔ Deploy complete!

Hosting URL: https://sagar-portal.web.app
```

## Environment-Specific Deployments

### Development/Staging

For testing, you can use Firebase preview channels:

```bash
firebase hosting:channel:deploy preview --only sagar-portal
```

This creates a temporary preview URL valid for 7 days.

### Production

For production deployment:

```bash
firebase deploy --only hosting:sagar-portal
```

## Custom Domain Setup

To use a custom domain:

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS verification steps
4. Firebase will provision SSL automatically

## Deployment Checklist

Before each deployment:

- [ ] Firebase config has correct credentials
- [ ] Run `npm run build` successfully
- [ ] Test locally with `npm run preview`
- [ ] Verify Firestore security rules are deployed
- [ ] Check that anonymous authentication is enabled in Firebase

## Troubleshooting

### "Permission Denied" Errors

1. Ensure you're logged in: `firebase login`
2. Verify project access: `firebase projects:list`
3. Check `.firebaserc` has correct project ID

### Build Failures

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check for TypeScript/ESLint errors: `npm run lint`

### Firestore Access Issues

1. Verify Firestore security rules allow anonymous read
2. Check that anonymous auth is enabled in Firebase Console
3. Ensure customer documents have `accessKey` field

## Rollback

To rollback to a previous version:

1. Go to Firebase Console → Hosting
2. Find the previous deployment in history
3. Click "Rollback to this version"

## Continuous Deployment (Optional)

For automated deployments via GitHub Actions, see the admin app's CI/CD configuration.
