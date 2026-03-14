-- Quiz System Migration
-- Creates tables for skill-based quiz questions and user attempts

-- Questions table: Stores all quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  category TEXT DEFAULT 'crypto',
  difficulty TEXT DEFAULT 'basic' CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table: Tracks which questions were shown to which user/IP
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  ip_address TEXT,
  questions_used UUID[] NOT NULL, -- Array of question IDs shown to this user
  answers_submitted JSONB NOT NULL, -- {question_id: 'A'|'B'|'C'|'D'}
  score INTEGER NOT NULL, -- Number of correct answers (0-10)
  passed BOOLEAN NOT NULL, -- true if score >= 7
  time_taken_seconds INTEGER, -- Time taken to complete quiz
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz sessions table: Prevents retakes and tracks session state
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  ip_address TEXT,
  session_token TEXT UNIQUE NOT NULL, -- Unique token for this quiz session
  questions_assigned UUID[] NOT NULL, -- Questions assigned to this session
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 2 minutes from start
  completed BOOLEAN DEFAULT false,
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_raffle ON quiz_attempts(raffle_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_wallet ON quiz_attempts(wallet_address);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_raffle ON quiz_sessions(raffle_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_token ON quiz_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_wallet ON quiz_sessions(wallet_address);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_questions_updated_at();

-- Insert 10 basic crypto questions
INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) VALUES
('What does "HODL" stand for in crypto?', 'Hold On for Dear Life', 'High Order Digital Ledger', 'Hash Output Data Link', 'Hold Our Digital Ledger', 'A', 'crypto', 'basic'),
('What is the maximum supply of Bitcoin?', '21 million', '50 million', '100 million', 'Unlimited', 'A', 'crypto', 'basic'),
('What is a blockchain?', 'A distributed ledger technology', 'A type of cryptocurrency', 'A mining algorithm', 'A wallet application', 'A', 'crypto', 'basic'),
('What does "DeFi" stand for?', 'Decentralized Finance', 'Digital Finance', 'Direct Finance', 'Distributed Finance', 'A', 'crypto', 'basic'),
('What is a smart contract?', 'Self-executing code on blockchain', 'A legal document', 'A type of wallet', 'A mining pool', 'A', 'crypto', 'basic'),
('What is the native cryptocurrency of Ethereum?', 'ETH', 'ETC', 'ETN', 'ETP', 'A', 'crypto', 'basic'),
('What is "gas" in Ethereum?', 'Fee paid for transactions', 'A type of token', 'Mining reward', 'Network speed', 'A', 'crypto', 'basic'),
('What is a wallet address?', 'A unique identifier for receiving crypto', 'A password', 'A private key', 'A transaction hash', 'A', 'crypto', 'basic'),
('What does "NFT" stand for?', 'Non-Fungible Token', 'New Financial Technology', 'Network File Transfer', 'Next Future Token', 'A', 'crypto', 'basic'),
('What is the process of validating transactions on blockchain called?', 'Mining/Staking', 'Trading', 'Swapping', 'Holding', 'A', 'crypto', 'basic')
ON CONFLICT DO NOTHING;

-- Enable RLS (but allow public read for active questions)
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public to read active questions
CREATE POLICY "Public can read active questions" ON quiz_questions
  FOR SELECT USING (is_active = true);

-- Allow users to insert their own quiz attempts
CREATE POLICY "Users can insert their own attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own attempts
CREATE POLICY "Users can read their own attempts" ON quiz_attempts
  FOR SELECT USING (true);

-- Allow users to create quiz sessions
CREATE POLICY "Users can create quiz sessions" ON quiz_sessions
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own quiz sessions
CREATE POLICY "Users can read their own quiz sessions" ON quiz_sessions
  FOR SELECT USING (true);

-- Allow users to update their own quiz sessions
CREATE POLICY "Users can update their own quiz sessions" ON quiz_sessions
  FOR UPDATE USING (true);

