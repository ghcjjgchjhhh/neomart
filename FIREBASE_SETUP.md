# Firebase Setup Guide for NeoMart

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create a project**
3. Name it "neomart" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click **Create project**

## Step 2: Register Web App

1. In Firebase Console, click the **Web icon** (</>)
2. App name: "neomart"
3. Check **Also set up Firebase Hosting** (optional)
4. Click **Register app**
5. Copy your Firebase configuration

## Step 3: Update Environment Variables

1. Open `.env` file in your project
2. Replace with your Firebase config values:

```env
VITE_FIREBASE_API_KEY=your_copied_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 4: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose location: **nam5** (closest to your users)
5. Click **Create**

## Step 5: Deploy Security Rules

1. The security rules have been updated in `firestore.rules`
2. In Firebase Console, go to **Firestore Database > Rules**
3. Paste the contents of `firestore.rules`
4. Click **Publish**

## Step 6: Install Dependencies and Run

```bash
cd neomart_project
npm install
npm run dev
```

The app will automatically:
- Initialize Firebase connection
- Import all products to Firestore on first load
- Set up authentication, orders, and cart collections

## Step 7: Verify Setup

Check browser console for:
- ✅ Firebase initialized with products
- No errors about missing config

## Features Now Available

- ✅ Products stored in Firestore
- 🔐 User authentication ready
- 🛒 Cart persistence
- 📦 Order management
- ⭐ Product reviews

## Troubleshooting

**"Firebase not configured" warning:**
- Check `.env` file has correct values
- Restart dev server after updating `.env`

**"Permission denied" errors:**
- Verify security rules are published
- Check user is authenticated for restricted collections

**Products not importing:**
- Check browser console for errors
- Verify Firestore database is created
- Ensure all env variables are set
