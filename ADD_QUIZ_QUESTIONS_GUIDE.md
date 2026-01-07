# How to Add Quiz Questions - SQL Guide

## Overview
This guide explains how to add new quiz questions to the database using SQL queries. Questions are stored in the `quiz_questions` table in Supabase.

## Database Schema

The `quiz_questions` table has the following structure:

```sql
CREATE TABLE quiz_questions (
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
```

## Required Fields

- **question**: The question text
- **option_a**: First answer option
- **option_b**: Second answer option
- **option_c**: Third answer option
- **option_d**: Fourth answer option
- **correct_answer**: Must be 'A', 'B', 'C', or 'D' (case-insensitive, but stored as uppercase)

## Optional Fields

- **category**: Default is 'crypto' (can be any text like 'blockchain', 'defi', 'nft', etc.)
- **difficulty**: Must be 'basic', 'intermediate', or 'advanced' (default: 'basic')
- **is_active**: Boolean, default is `true` (set to `false` to hide a question)

## Adding Questions via SQL

### Method 1: Single Question

```sql
INSERT INTO quiz_questions (
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_answer,
  category,
  difficulty
) VALUES (
  'What is the total supply of Ethereum?',
  'Unlimited',
  '100 million',
  '120 million',
  '150 million',
  'A',
  'crypto',
  'basic'
);
```

### Method 2: Multiple Questions at Once

```sql
INSERT INTO quiz_questions (
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_answer,
  category,
  difficulty
) VALUES 
(
  'What does "APY" stand for in DeFi?',
  'Annual Percentage Yield',
  'Automated Payment Yield',
  'Advanced Protocol Yield',
  'Asset Performance Yield',
  'A',
  'crypto',
  'intermediate'
),
(
  'Which blockchain uses proof-of-stake consensus?',
  'Ethereum 2.0',
  'Bitcoin',
  'Litecoin',
  'Dogecoin',
  'A',
  'crypto',
  'basic'
),
(
  'What is a liquidity pool?',
  'A collection of tokens locked in a smart contract',
  'A type of wallet',
  'A mining pool',
  'A trading platform',
  'A',
  'crypto',
  'intermediate'
);
```

## Examples by Category

### Basic Crypto Questions

```sql
INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) VALUES
('What is a private key?', 'A secret key that proves ownership of crypto', 'A public address', 'A transaction hash', 'A wallet name', 'A', 'crypto', 'basic'),
('What is a public key?', 'An address others can send crypto to', 'A secret password', 'A transaction ID', 'A wallet balance', 'A', 'crypto', 'basic'),
('What is market cap?', 'Total value of all coins in circulation', 'Price of one coin', 'Number of transactions', 'Total supply', 'A', 'crypto', 'basic');
```

### Intermediate Questions

```sql
INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) VALUES
('What is impermanent loss?', 'Loss from providing liquidity when prices change', 'Loss from hacking', 'Loss from wrong password', 'Loss from network fees', 'A', 'crypto', 'intermediate'),
('What is a flash loan?', 'A loan that must be repaid in the same transaction', 'A long-term loan', 'A secured loan', 'A personal loan', 'A', 'crypto', 'intermediate');
```

### Advanced Questions

```sql
INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) VALUES
('What is MEV?', 'Maximum Extractable Value', 'Minimum Exchange Value', 'Maximum Exchange Volume', 'Minimum Extractable Volume', 'A', 'crypto', 'advanced'),
('What is a zk-SNARK?', 'Zero-knowledge proof system', 'A type of token', 'A blockchain protocol', 'A wallet type', 'A', 'crypto', 'advanced');
```

## Managing Questions

### View All Active Questions

```sql
SELECT 
  id,
  question,
  correct_answer,
  category,
  difficulty,
  is_active,
  created_at
FROM quiz_questions
WHERE is_active = true
ORDER BY created_at DESC;
```

### View All Questions (Including Inactive)

```sql
SELECT * FROM quiz_questions ORDER BY created_at DESC;
```

### Deactivate a Question (Hide from quizzes)

```sql
UPDATE quiz_questions
SET is_active = false
WHERE id = 'your-question-id-here';
```

### Reactivate a Question

```sql
UPDATE quiz_questions
SET is_active = true
WHERE id = 'your-question-id-here';
```

### Update an Existing Question

```sql
UPDATE quiz_questions
SET 
  question = 'Updated question text?',
  option_a = 'Updated option A',
  option_b = 'Updated option B',
  option_c = 'Updated option C',
  option_d = 'Updated option D',
  correct_answer = 'B',
  category = 'crypto',
  difficulty = 'intermediate'
WHERE id = 'your-question-id-here';
```

### Delete a Question (Permanent)

```sql
DELETE FROM quiz_questions
WHERE id = 'your-question-id-here';
```

## Best Practices

### 1. Question Quality
- Keep questions clear and unambiguous
- Ensure only one answer is clearly correct
- Avoid trick questions
- Make all options plausible

### 2. Answer Distribution
- Randomize which option is correct (don't always use 'A')
- Mix up the correct answer positions

### 3. Difficulty Levels
- **Basic**: Fundamental concepts (What is Bitcoin? What is a wallet?)
- **Intermediate**: More specific knowledge (What is DeFi? How does staking work?)
- **Advanced**: Technical details (What is MEV? How do zk-proofs work?)

### 4. Categories
Use consistent category names:
- `crypto` - General cryptocurrency
- `blockchain` - Blockchain technology
- `defi` - Decentralized finance
- `nft` - Non-fungible tokens
- `trading` - Trading concepts
- `security` - Security and wallets

## How to Execute SQL in Supabase

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Log in to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New query"

### Step 3: Run Your SQL
1. Paste your SQL query
2. Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
3. Check the results

### Step 4: Verify Questions Were Added
```sql
-- Check recent questions
SELECT 
  question,
  correct_answer,
  category,
  difficulty,
  is_active
FROM quiz_questions
ORDER BY created_at DESC
LIMIT 10;
```

## Alternative: Using the Admin API

You can also add questions via the API endpoint:

```bash
POST /api/admin/quiz/questions
Content-Type: application/json

{
  "question": "What is a blockchain?",
  "option_a": "A distributed ledger",
  "option_b": "A type of cryptocurrency",
  "option_c": "A wallet application",
  "option_d": "A mining algorithm",
  "correct_answer": "A",
  "category": "crypto",
  "difficulty": "basic"
}
```

## Quick Reference

### Minimum Required SQL
```sql
INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer)
VALUES ('Your question?', 'Option A', 'Option B', 'Option C', 'Option D', 'A');
```

### Full Example with All Fields
```sql
INSERT INTO quiz_questions (
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_answer,
  category,
  difficulty,
  is_active
) VALUES (
  'What is the purpose of a smart contract?',
  'To execute code automatically on blockchain',
  'To store private keys',
  'To mine cryptocurrency',
  'To send transactions',
  'A',
  'crypto',
  'intermediate',
  true
);
```

## Troubleshooting

### Error: "correct_answer must be A, B, C, or D"
- Make sure `correct_answer` is exactly 'A', 'B', 'C', or 'D' (uppercase)
- Example: `correct_answer = 'A'` ✅ (correct)
- Example: `correct_answer = 'a'` ❌ (will be converted, but use uppercase)

### Error: "difficulty must be basic, intermediate, or advanced"
- Use exactly: 'basic', 'intermediate', or 'advanced'
- Case-sensitive, use lowercase

### Questions Not Appearing in Quiz
- Check `is_active = true`
- Verify the question was inserted successfully
- Ensure there are at least 10 active questions in the database

## Statistics Query

Check how many questions you have by category and difficulty:

```sql
SELECT 
  category,
  difficulty,
  COUNT(*) as total_questions,
  COUNT(*) FILTER (WHERE is_active = true) as active_questions
FROM quiz_questions
GROUP BY category, difficulty
ORDER BY category, difficulty;
```

## Example: Bulk Import Template

```sql
-- Template for adding multiple questions
-- Copy and modify as needed

INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty) VALUES
-- Question 1
('Question text here?', 'Option A text', 'Option B text', 'Option C text', 'Option D text', 'A', 'crypto', 'basic'),
-- Question 2
('Another question?', 'Option A', 'Option B', 'Option C', 'Option D', 'B', 'crypto', 'intermediate'),
-- Question 3
('More questions?', 'Option A', 'Option B', 'Option C', 'Option D', 'C', 'crypto', 'advanced');
-- Add more questions as needed
```

## Notes

- Questions are automatically assigned to users randomly
- The system tries to avoid showing the same questions to the same user/IP
- If a user has seen all questions, they may get repeats
- Each quiz session shows 10 random questions
- Users need 7/10 correct to pass

