-- Add popular blockchain networks for raffles

INSERT INTO chains (name, slug, chain_id, native_symbol) VALUES
('Ethereum', 'ethereum', 1, 'ETH'),
('Polygon', 'polygon', 137, 'MATIC'),
('Binance Smart Chain', 'bsc', 56, 'BNB'),
('Avalanche', 'avalanche', 43114, 'AVAX'),
('Arbitrum', 'arbitrum', 42161, 'ETH'),
('Optimism', 'optimism', 10, 'ETH'),
('Fantom', 'fantom', 250, 'FTM'),
('Base', 'base', 8453, 'ETH'),
('Solana', 'solana', 101, 'SOL')
ON CONFLICT (chain_id) DO NOTHING;

