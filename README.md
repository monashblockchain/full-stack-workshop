# One Tap Tip

![One Tap Tip Banner](/public/one-tap-tip-banner.png)

A full-stack web3 application that allows users to send SOL tips with just one tap. Built with Next.js 15, TailwindCSS, ShadCN UI, Firebase Firestore, and Phantom Wallet integration.

## ✨ Features

- 💰 Send SOL tips to any Solana wallet address
- 👛 Phantom Wallet integration
- 📊 View transaction history
- 💾 Store tip data in Firebase Firestore
- 🎨 Modern Web3 UI with glassmorphism and animations
- 🌙 Dark mode optimized
- 📱 Fully responsive design

## 🛠️ Technologies

- **Frontend**: Next.js 15, React, TailwindCSS, ShadCN UI
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Database**: Firebase Firestore
- **Styling**: TailwindCSS, CSS animations
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)
- [Phantom Wallet](https://phantom.app/) browser extension

## 🚀 Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/one-tap-tip.git
   cd one-tap-tip
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install

   # or

   yarn install

   # or

   pnpm install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev

   # or

   yarn dev

   # or

   pnpm dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔥 Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the Firebase configuration values to your `.env.local` file
5. Go to Firestore Database and create a new database
6. Start in test mode or set up security rules as needed

## 🌐 Solana Setup

This project uses the Solana Devnet by default. No additional setup is required for development purposes.

If you need test SOL for the Devnet:

1. Install the Phantom Wallet browser extension
2. Switch to Devnet in the settings
3. Use the [Solana Faucet](https://faucet.solana.com/) to get some test SOL

## 🔑 Key Features Explained

### Solana Wallet Integration

The application uses `@solana/wallet-adapter-react` to integrate with Solana wallets. The main integration is in `AppWalletProvider.tsx`, which sets up the connection to the Solana network and provides wallet functionality to the entire application.

### Sending Tips

The tip sending process:

1. User connects their Phantom wallet
2. Enters recipient address, amount, and optional message
3. Clicks "Send Tip"
4. Confirms the transaction in their wallet
5. Transaction is processed on the Solana blockchain
6. Tip details are stored in Firebase Firestore
7. Transaction confirmation is displayed

### Firebase Integration

The application uses Firebase Firestore to store tip history. Each tip includes:

- Sender wallet address
- Recipient wallet address
- Amount
- Message (optional)
- Timestamp
- Transaction hash

## ⚠️ Disclaimer

This application is for educational purposes only and uses the Solana Devnet. Do not use real funds with this application unless you modify it for production use with proper security measures.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Firebase](https://firebase.google.com/)
- [Phantom Wallet](https://phantom.app/)
