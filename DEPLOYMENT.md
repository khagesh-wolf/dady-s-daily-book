# Deployment Guide

This guide covers deploying Sagar Anna Bhandar to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Firebase Hosting (Recommended)](#firebase-hosting-recommended)
- [Lovable Publishing](#lovable-publishing)
- [Alternative Hosting Options](#alternative-hosting-options)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before deploying, ensure you have:

1. **Node.js 18+** installed
2. **Firebase project** configured (see [TECHNICAL_SETUP_GUIDE.md](./TECHNICAL_SETUP_GUIDE.md))
3. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```
4. Completed a successful local build:
   ```bash
   npm run build
   ```

---

## Firebase Hosting (Recommended)

### Step 1: Initialize Firebase Hosting

```bash
# Login to Firebase
firebase login

# Initialize hosting (if not already done)
firebase init hosting
```

When prompted:
- **Public directory**: `dist`
- **Single-page app**: `Yes`
- **Overwrite index.html**: `No`

### Step 2: Configure `firebase.json`

Ensure your `firebase.json` contains:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "**/*.@(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### Step 3: Build and Deploy

```bash
# Build the production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Step 4: Verify Deployment

After deployment, Firebase will provide a URL like:
```
https://your-project-id.web.app
```

Visit this URL to verify the deployment.

---

## Lovable Publishing

If using Lovable's built-in publishing:

1. Click the **Publish** button in the top-right corner of the editor
2. Click **Update** to deploy frontend changes
3. Your app will be available at `https://your-project.lovable.app`

### Custom Domain (Requires Paid Plan)

1. Navigate to **Project > Settings > Domains**
2. Add your custom domain
3. Configure DNS records as instructed

---

## Alternative Hosting Options

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

Create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Docker

Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:
```bash
docker build -t sagar-anna-bhandar .
docker run -p 80:80 sagar-anna-bhandar
```

---

## Environment Configuration

### Production Firebase Config

For production, ensure `src/firebaseConfig.js` contains your production Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-production-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Firestore Security Rules

Deploy proper security rules to Firebase:

```bash
firebase deploy --only firestore:rules
```

Example `firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /customers/{document} {
      allow read, write: if request.auth != null;
    }
    match /transactions/{document} {
      allow read, write: if request.auth != null;
    }
    match /expenses/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Post-Deployment Checklist

### Functional Testing
- [ ] User can login with email/password
- [ ] Customer list loads correctly
- [ ] Adding new customers works
- [ ] Adding transactions works
- [ ] Dashboard charts display correctly
- [ ] Language switching works (EN/NE)
- [ ] PIN lock functions properly
- [ ] Backup download works

### PWA Testing
- [ ] App installs on mobile devices
- [ ] Offline mode works
- [ ] Service worker is registered
- [ ] Icons display correctly

### Performance
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 80
- [ ] No console errors in production

### Security
- [ ] Firebase rules are deployed
- [ ] Authentication is required for data access
- [ ] HTTPS is enforced

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
npm run build
```

### Deployment Errors

```bash
# Check Firebase login status
firebase login:list

# Re-authenticate
firebase login --reauth
```

### App Not Loading

1. Check browser console for errors
2. Verify Firebase config is correct
3. Ensure Firestore indexes are created
4. Check network requests in DevTools

---

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-firebase-project-id
```

---

## Support

For deployment issues:
1. Check the [Firebase Hosting documentation](https://firebase.google.com/docs/hosting)
2. Review error logs in Firebase Console
3. Consult the [Lovable documentation](https://docs.lovable.dev/)
