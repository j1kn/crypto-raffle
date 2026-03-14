# Skill-Based Quiz System Implementation

## Overview
The raffle platform now includes a skill-based quiz system that requires users to answer 10 questions correctly (7/10 minimum) before they can enter any raffle, whether free or paid.

## Features

### ✅ Implemented Features
1. **Database Schema**
   - `quiz_questions` table: Stores all quiz questions
   - `quiz_attempts` table: Tracks user attempts and scores
   - `quiz_sessions` table: Manages quiz sessions with 2-minute timer

2. **Question Management**
   - Admin API endpoints for CRUD operations on questions
   - Questions can be marked as active/inactive
   - Support for categories and difficulty levels

3. **Quiz Flow**
   - Users must complete quiz before entering raffle
   - 10 random questions per attempt
   - Questions are different per user/IP (tries to avoid repeats)
   - 2-minute timer with countdown
   - Minimum 7/10 correct answers required to proceed

4. **Security Features**
   - Screenshot prevention (keyboard shortcuts disabled)
   - Right-click disabled
   - DevTools shortcuts disabled
   - Text selection disabled
   - Session-based validation
   - IP address tracking

5. **User Experience**
   - Progress bar showing question number
   - Timer display with color coding (red when < 30 seconds)
   - Clear pass/fail feedback
   - Ability to navigate between questions
   - Auto-submit when timer expires

## Database Tables

### `quiz_questions`
- Stores all quiz questions
- Fields: question, option_a/b/c/d, correct_answer, category, difficulty, is_active
- 10 basic crypto questions pre-loaded

### `quiz_attempts`
- Tracks all quiz attempts
- Records: questions shown, answers submitted, score, pass/fail status
- Links to raffle and user

### `quiz_sessions`
- Manages active quiz sessions
- 2-minute expiration timer
- Prevents retakes and tracks session state

## API Endpoints

### Public Endpoints

#### `POST /api/quiz/questions`
Fetches random questions for a quiz session.
- **Body**: `{ raffleId, walletAddress, ipAddress?, count: 10 }`
- **Returns**: `{ success, sessionToken, questions[], expiresAt }`

#### `POST /api/quiz/submit`
Submits quiz answers and validates.
- **Body**: `{ sessionToken, answers: { questionId: 'A'|'B'|'C'|'D' }, timeTakenSeconds }`
- **Returns**: `{ success, passed, score, totalQuestions, attemptId }`

### Admin Endpoints

#### `GET /api/admin/quiz/questions`
List all questions (admin only)

#### `POST /api/admin/quiz/questions`
Create new question
- **Body**: `{ question, option_a, option_b, option_c, option_d, correct_answer, category?, difficulty? }`

#### `PUT /api/admin/quiz/questions/[id]`
Update question

#### `DELETE /api/admin/quiz/questions/[id]`
Delete question

## User Flow

1. User clicks "ENTER RAFFLE" button
2. **QuizModal** opens with 10 random questions
3. User answers questions (2-minute timer)
4. User submits answers
5. If score >= 7/10:
   - Quiz passes
   - **EntryConfirmationModal** opens
   - User proceeds to payment
6. If score < 7/10:
   - Error message shown
   - User can retry (new questions will be assigned)

## Adding New Questions

### Via API (Recommended)
```bash
POST /api/admin/quiz/questions
{
  "question": "What is Bitcoin?",
  "option_a": "A cryptocurrency",
  "option_b": "A blockchain",
  "option_c": "A wallet",
  "option_d": "A mining pool",
  "correct_answer": "A",
  "category": "crypto",
  "difficulty": "basic"
}
```

### Via Supabase SQL
```sql
INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty)
VALUES (
  'Your question here?',
  'Option A',
  'Option B',
  'Option C',
  'Option D',
  'A', -- Correct answer (A, B, C, or D)
  'crypto', -- Category
  'basic' -- Difficulty: basic, intermediate, or advanced
);
```

## Configuration

### Environment Variables
No additional environment variables required. Uses existing Supabase configuration.

### Quiz Settings
- **Total Questions**: 10 (configurable in API call)
- **Passing Score**: 7/10 (hardcoded, can be changed in `/api/quiz/submit`)
- **Timer Duration**: 2 minutes (120 seconds)
- **Question Selection**: Random, avoids previously shown questions when possible

## Security Considerations

### Screenshot Prevention
- Disables PrintScreen, Ctrl+S, Ctrl+P shortcuts
- Disables right-click context menu
- Disables DevTools shortcuts (F12, Ctrl+Shift+I/J)
- Disables text selection
- Note: These are client-side protections and can be bypassed by determined users

### Server-Side Validation
- Session tokens prevent replay attacks
- IP address tracking
- Time-based expiration
- Answers validated server-side
- Score calculated server-side

## Future Enhancements

1. **Admin UI**: Create a web interface for managing questions
2. **Question Pools**: Support multiple question sets/categories
3. **Difficulty Levels**: Adjust questions based on raffle type
4. **Analytics**: Track quiz performance and question difficulty
5. **Anti-Cheat**: Additional server-side validation
6. **Question Randomization**: Better algorithm to ensure unique questions per user

## Testing

### Test Quiz Flow
1. Navigate to any raffle detail page
2. Click "ENTER RAFFLE"
3. Quiz modal should open
4. Answer questions (or let timer expire)
5. Submit and verify pass/fail logic

### Test Admin API
```bash
# List questions
curl -X GET http://localhost:3000/api/admin/quiz/questions

# Create question
curl -X POST http://localhost:3000/api/admin/quiz/questions \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Test question?",
    "option_a": "A",
    "option_b": "B",
    "option_c": "C",
    "option_d": "D",
    "correct_answer": "A"
  }'
```

## Notes

- Questions are stored in the database and can be managed via API
- The system tries to show different questions to each user/IP
- If a user has seen all questions, they will get random questions (may repeat)
- Quiz must be completed within 2 minutes
- Users can retry if they fail (new questions will be assigned)

