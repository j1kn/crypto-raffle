# 🏆 PrimePick - Transparent Crypto Raffle Platform

PrimePick is a decentralized raffle platform built for high-stakes, transparent crypto tournaments. Our platform allows users to enter world-class raffles with verifiable results, all powered by Web3 technology.

![PrimePick Logo](/public/favicon.ico)

## 🚀 Features

-   **Web3 Integration:** Secure wallet connection via WalletConnect and Web3Modal.
-   **Multi-Chain Support:** Support for Ethereum, Solana, and other popular chains.
-   **Skill-Based Quiz:** Extra layer of interaction where users must pass a quiz to enter.
-   **Admin Dashboard:** Comprehensive tools for creating, editing, and managing raffles.
-   **Real-time Updates:** Powered by Supabase for instant raffle status and entry tracking.
-   **High Security:** Row Level Security (RLS) on database for maximum data integrity.

---

## 🛠️ Tech Stack

-   **Framework:** [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Database & Auth:** [Supabase](https://supabase.com/)
-   **Web3 Library:** [Wagmi](https://wagmi.sh/) & [Viem](https://viem.sh/)
-   **Wallet Connection:** [Web3Modal v5](https://web3modal.com/) (WalletConnect)
-   **Icons:** [Lucide-React](https://lucide.dev/)

---

## ⚙️ Setup Instructions

### 1. Prerequisites

Before you begin, ensure you have the following accounts and tools set up:

-   **Node.js 18+** installed on your machine.
-   A **[Supabase](https://supabase.com/)** account.
-   A **[WalletConnect Cloud](https://cloud.walletconnect.com/)** project ID.
-   A **[Vercel](https://vercel.com/)** account for deployment (optional but recommended).

### 2. Clone the Repository

```bash
git clone https://github.com/j1kn/crypto-raffle.git
cd crypto-raffle
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory by copying the example:

```bash
cp .env.local.example .env.local
```

Fill in the following variables:

| Variable | Description | Where to find |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anonymous Key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | Supabase Dashboard > Settings > API (**SECRET**) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Your WalletConnect Project ID | [WalletConnect Cloud Dashboard](https://cloud.walletconnect.com/) |
| `ADMIN_WALLETS` | Comma-separated admin wallets | Your wallet address (e.g., `0x123...,0xabc...`) |
| `ADMIN_PIN` | Secure PIN for /superman setup | Any secure string (e.g., `MySecretPin123`) |

### 5. Initialize Supabase Database

To set up the database schema and public views:

1.  Go to your **Supabase Dashboard**.
2.  Navigate to the **SQL Editor**.
3.  Run the contents of these files in order:
    -   `supabase/migrations/000_complete_fresh_setup.sql` (Initial core schema)
    -   `supabase/migrations/018_create_quiz_system.sql` (Quiz system)
    -   `supabase/migrations/016_create_comments_table.sql` (Raffle comments)
4.  Alternatively, you can run all migrations in numerical order for the latest updates.

**Important Storage Bucket:**
Create a storage bucket named `raffle-images` and set its privacy to **Public**. This is required for raffle image uploads.

### 6. Run the Application

Start the development server:

```bash
npm run dev
```

Your app should now be running at [http://localhost:3000](http://localhost:3000).

---

## 🔐 Admin Panel Access

There are two ways to manage the platform:

1.  **Manual Admin Access:**
    -   Connect your wallet.
    -   Add your wallet address to the `ADMIN_WALLETS` environment variable.
    -   You will see an **ADMIN** link in the navigation header.

2.  **Emergency Setup Page:**
    -   Navigate to `/superman` in your browser.
    -   Enter your `ADMIN_PIN` (defined in environment variables).
    -   Follow the on-screen instructions to verify your admin status.

---

## 🚢 Deployment

### Vercel (Recommended)

Click the button below to deploy your own instance of PrimePick:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fj1kn%2Fcrypto-raffle)

**Important Deployment Note:**
When deploying to Vercel, make sure to add all environment variables listed in `.env.local.example` in the Vercel Dashboard Settings.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
