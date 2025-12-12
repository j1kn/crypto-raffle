'use server';

export function isAdminWallet(walletAddress: string | null): boolean {
  if (!walletAddress) return false;
  
  const adminWallets = process.env.ADMIN_WALLETS?.split(',').map(w => w.trim().toLowerCase()) || [];
  return adminWallets.includes(walletAddress.toLowerCase());
}

