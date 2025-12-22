## Mobile WalletConnect Payment – Debug & Fix Guide

This project sends **simple ETH transfers** (no smart contracts) using **Wagmi + Viem + Web3Modal**.
Desktop browser extensions (MetaMask, etc.) work, but mobile wallets via **WalletConnect** can be stricter and may return generic errors like:

- `TransactionExecutionError: An internal error was received`
- `The data couldn’t be read because it is missing`

This guide explains what the app does in code and what you may need to do **outside the codebase** to make mobile payments work reliably.

---

### 1. What the frontend does (current behavior)

In `app/raffles/[id]/page.tsx`:

- Uses Wagmi hooks:
  - `useAccount()` → `address`, `isConnected`, `chain`
  - `useChainId()` → `connectedChainId`
  - `useSwitchChain()` → `switchChainAsync`
  - `useSendTransaction()` → `sendTransactionAsync`
  - `useWaitForTransactionReceipt()` → confirmation handling
- Validates **before** sending any transaction:
  - Raffle exists and is live (not ended, not full)
  - Wallet is connected: `isConnected === true` and `address` is defined
  - A chain ID is available: `connectedChainId ?? chain?.id` is truthy
  - For ETH raffles:
    - If current chain ≠ mainnet (1), calls `switchChainAsync({ chainId: 1 })`
    - Only proceeds if the switch succeeds
- Builds an **explicit transaction object**:

```ts
const REQUIRED_CHAIN_ID = 1; // Ethereum mainnet
const PAYOUT_ADDRESS =
  '0x842bab27dE95e329eb17733c1f29c082e5dd94c3' as `0x${string}`;

const currentChainId = connectedChainId ?? chain?.id;
let finalChainId = currentChainId;

// (auto-switch to mainnet for ETH raffles; finalChainId updated if needed)

const value = parseEther(raffle.ticket_price.toString());

// Validate required fields
if (!address) throw new Error('Missing sender address. Please reconnect your wallet.');
if (!finalChainId) throw new Error('Missing chainId. Please reconnect your wallet and try again.');

const hash = await sendTransactionAsync({
  account: address as `0x${string}`,
  to: PAYOUT_ADDRESS,
  value,
  chainId: finalChainId,
});
```

- **After** the transaction is confirmed, it calls:

```ts
POST /api/raffles/[id]/enter  // body: { walletAddress, txHash }
```

This Supabase call happens **after** payment and does **not** block or modify the on-chain transfer.

---

### 2. Things that can still break mobile WalletConnect

Even with a correct transaction object, WalletConnect mobile can fail if:

1. **WalletConnect Cloud project is misconfigured**
   - Mainnet (chain ID 1) is not enabled for your project.
   - The dapp domain is not whitelisted.
   - The `projectId` used in `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` doesn’t match the one you configured.

2. **Network mismatch**
   - The wallet is connected to a different chain than the one the app is using.
   - The WalletConnect session is stale and bound to the wrong network.

3. **Provider-side errors are hidden**
   - RPC layer returns a 4xx/5xx and WalletConnect only shows “internal error” in the app.

---

### 3. Required external steps in WalletConnect Cloud

1. **Open your WalletConnect Cloud dashboard**
   - Go to `https://cloud.walletconnect.com` and log in.

2. **Select your project**
   - Make sure you open the project whose **Project ID** equals:
     - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in your Vercel environment.

3. **Enable Ethereum Mainnet**
   - In **Settings → Blockchain** (or similar section):
     - Ensure **Ethereum (chainId 1)** is enabled for this project.

4. **Whitelist all relevant domains**
   - In **Settings → Domains**:
     - Add:
       - `https://crypto-raffle-heys.vercel.app`
       - `https://crypto-raffle-heys-git-main-prime-picks-projects.vercel.app`
       - Any other preview URLs you actually open in mobile (Vercel deployment URLs).
   - Save changes.

5. **Confirm the Project ID in Vercel**
   - In the Vercel dashboard → your `crypto-raffle-heys` project → **Settings → Environment Variables**:
     - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` must exactly match the 32‑character project ID from WalletConnect Cloud.
   - Redeploy after any change to env vars.

---

### 4. Recommended mobile testing steps

1. **Clear old WalletConnect sessions**
   - In your mobile wallet (MetaMask, Trust, etc.):
     - Go to **Connected sites / WalletConnect sessions**.
     - Disconnect any existing sessions for your PrimePick site.

2. **Use the production URL**
   - On your mobile device (or in-app browser inside the wallet), open:
     - `https://crypto-raffle-heys.vercel.app`

3. **Connect via WalletConnect**
   - Tap **Connect Wallet** → choose your wallet.
   - Approve the connection in your mobile wallet.

4. **Verify network**
   - In the mobile wallet, confirm you are on **Ethereum Mainnet**.
   - If the app prompts to switch, accept the switch.

5. **Try a small test transaction**
   - Enter a live raffle with the standard `0.001 ETH` entry.
   - Watch:
     - Button should show: `Confirm in Wallet…` → `Processing Transaction…` → `Success!`
     - In the wallet, you should see a normal `Send` transaction to:
       - `0x842bab27dE95e329eb17733c1f29c082e5dd94c3`

6. **If it fails again**
   - On desktop DevTools (connected to the same page), open **Console**:
     - Capture the full `Error initiating payment:` log, especially the nested `cause` / `data` fields.
   - Compare against WalletConnect Cloud logs (if available) to see if the RPC is returning an auth or network error.

---

### 5. Summary: What you need to do

- **In WalletConnect Cloud**
  - Verify Project ID.
  - Enable Ethereum Mainnet.
  - Whitelist all Vercel domains you use.

- **In Vercel**
  - Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` matches the Cloud project.
  - Redeploy after any env var changes.

- **On your mobile wallet**
  - Clear old sessions.
  - Use the whitelisted production URL.
  - Confirm you’re on Ethereum Mainnet before paying.

With the current frontend code, the ETH transfer object is now **fully explicit and validated**, so once the WalletConnect project and domains are configured correctly, mobile payments should behave the same as desktop browser extensions.


a