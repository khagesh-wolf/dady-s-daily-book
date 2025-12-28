# Sagar Anna Bhandar - Business Management System

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.5-orange.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF.svg)](https://vitejs.dev/)

A comprehensive Progressive Web App (PWA) for managing customer accounts, transactions, crop trading, and tractor services for agricultural businesses in Nepal.

## 🌾 Overview

Sagar Anna Bhandar is a mobile-first business management application designed specifically for agricultural traders and tractor service providers. It provides a complete solution for tracking customer dues, managing crop inventory, and monitoring business expenses with full offline support.

## ✨ Key Features

### Customer Management
- **Customer Directory**: Alphabetically organized customer list with search functionality
- **Contact Integration**: Direct calling and WhatsApp messaging from customer profiles
- **QR Code Generation**: Unique QR codes for each customer to share transaction history
- **Soft Delete**: 60-day recovery period for accidentally deleted customers

### Transaction Tracking
- **Multiple Transaction Types**:
  - 🚜 Tractor Services (hourly and trolley-based billing)
  - 🌾 Crop Buy/Sell (wheat, rice, maize, gas)
  - 💰 Cash Transactions (given/received)
- **Nepali Date Support**: Native Bikram Sambat calendar integration
- **Due Amount Tracking**: Real-time balance calculation per customer

### Dashboard & Analytics
- **Financial Overview**: Total receivables and payables at a glance
- **Tractor Profit/Loss Report**: Income vs expenses analysis
- **Crop Profit Analysis**: Visual charts for crop trading performance
- **Inventory Tracking**: Real-time crop stock levels
- **Time-Based Filtering**: 3 months, 6 months, 1 year, or lifetime views

### Security & Data
- **PIN Protection**: 4-digit PIN lock with 30-day session timeout
- **Firebase Authentication**: Secure email/password login
- **Offline Support**: Full functionality without internet connection
- **Backup & Restore**: JSON export/import for data backup

### Localization
- **Bilingual Support**: English and Nepali (नेपाली) languages
- **Currency Formatting**: Nepali Rupees (Rs.) with Indian number formatting

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Configure Firebase (see TECHNICAL_SETUP_GUIDE.md)
# Edit src/firebaseConfig.js with your Firebase credentials

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 Progressive Web App

This application is designed as a PWA and can be installed on mobile devices:
1. Open the app in a mobile browser
2. Tap "Add to Home Screen" from the browser menu
3. The app will work offline and feel like a native app

## 📚 Documentation

- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Production deployment guide
- [**PROJECT_DOCUMENTATION.md**](./PROJECT_DOCUMENTATION.md) - Detailed feature documentation
- [**TECHNICAL_SETUP_GUIDE.md**](./TECHNICAL_SETUP_GUIDE.md) - Development environment setup

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, Vite |
| Styling | Tailwind CSS |
| Backend | Firebase (Firestore, Auth) |
| Charts | Chart.js, react-chartjs-2 |
| Date Picker | @kkeshavv18/nepali-datepicker |
| QR Codes | qrcode.react |
| Icons | Lucide React |

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Analytics and reporting
│   ├── CustomerList.jsx # Customer directory
│   ├── CustomerDetail.jsx # Individual customer view
│   ├── AddTransactionForm.jsx # Transaction entry
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useCollection.js # Firestore realtime sync
│   └── useLanguage.jsx  # i18n provider
├── utils/               # Utility functions
├── App.jsx              # Main application
├── lang.js              # Translation strings
└── firebaseConfig.js    # Firebase configuration
```

## 👥 Credits

- **Idea By**: Diwash
- **Developed By**: Khagesh
- **Version**: 1.1.2

## 📄 License

© 2024 Sagar Anna Bhandar. All Rights Reserved.
