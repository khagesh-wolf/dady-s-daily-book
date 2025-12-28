# Sagar Anna Bhandar - Customer Portal

A Progressive Web App (PWA) that allows customers of Sagar Anna Bhandar to view their transaction history and outstanding balances by scanning a QR code.

## Overview

This customer portal is a read-only companion app to the main Sagar Anna Bhandar admin application. Customers receive a unique QR code from the business owner, which they can scan to access their personal transaction history and see their current balance.

## Features

- 📱 **Progressive Web App (PWA)** - Can be installed on mobile devices for quick access
- 🔒 **Secure Access** - Each customer has a unique 128-bit cryptographic access key
- 📊 **Transaction History** - View all past transactions with the business
- 💰 **Balance Overview** - See current outstanding balance (owed or to receive)
- 🌐 **Offline Support** - Works offline with cached data via Firebase persistence
- 🇳🇵 **Nepali Date Support** - Displays dates in Nepali calendar format

## How It Works

1. Business owner generates a QR code for each customer in the admin app
2. Customer scans the QR code with their phone camera
3. Customer is taken to their personal transaction page
4. Customer can install the PWA for quick future access

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Hosting**: Firebase Hosting
- **Icons**: Lucide React

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
sagar-anna-bhandar-customer-portal/
├── public/
│   ├── icon.png          # App icon
│   ├── logo.png          # App logo
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service worker
├── src/
│   ├── components/
│   │   └── PublicCustomerPage.jsx  # Main customer view
│   ├── hooks/
│   │   └── useLanguage.jsx         # i18n hook
│   ├── App.jsx           # App routes
│   ├── firebaseConfig.js # Firebase configuration
│   ├── index.css         # Global styles
│   ├── lang.js           # Language translations
│   └── main.jsx          # App entry point
├── firebase.json         # Firebase hosting config
├── package.json          # Dependencies
└── vite.config.js        # Vite configuration
```

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Firebase deployment instructions
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Detailed architecture and data flow
- [TECHNICAL_SETUP_GUIDE.md](./TECHNICAL_SETUP_GUIDE.md) - Development environment setup

## Related Projects

- **Sagar Anna Bhandar Admin App** - The main application for business management (parent directory)

## License

Private - For use by Sagar Anna Bhandar only.
