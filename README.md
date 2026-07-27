# Referral System

A full-stack referral system built with Next.js, Express, PostgreSQL, and Prisma.

## Tech Stack

- Frontend: Next.js 14 (App Router, TypeScript)
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL
- ORM: Prisma

## Features

- User registration and login with JWT auth (httpOnly cookies)
- Unique referral code per user
- Referral rewards (10 points) with DB-level duplicate prevention
- Dashboard showing referral code, points, and referred users

## Setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL) or a local Postgres instance

### Backend

```
cd backend
npm install
cp .env.example .env
docker-compose up -d
npx prisma migrate dev --name init
npm run dev
```

Server runs on http://localhost:4000

### Frontend

```
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App runs on http://localhost:3000

## API Reference

### POST /api/register
Body: `{ name, email, password, referralCode? }`
Returns: `{ id, name, email, referralCode }`

### POST /api/login
Body: `{ email, password }`
Returns: `{ id, name, email }` + sets httpOnly JWT cookie

### POST /api/logout
Clears the auth cookie.

### GET /api/dashboard (protected)
Returns: `{ referralCode, points, referredUsers: [{ name, email, createdAt }] }`

## Duplicate Reward Prevention

The `Referral` table enforces a unique constraint on `referredUserId`. This means a
user can only ever be rewarded-for once at the database level, regardless of retries
or concurrent requests. Reward creation, the referrer's point increment, and the
referred user's link update all happen inside a single Prisma transaction.

## Manual Test Plan (duplicate-prevention requirement)

1. Register User A → note their `referralCode`.
2. Register User B with `referralCode: <A's code>` → confirm A's points go from 0 → 10.
3. Attempt to re-trigger the referral for User B again (re-run the same
   `prisma.referral.create` call with the same `referredUserId`, or fire two
   concurrent registration requests that would resolve to the same new user id)
   → confirm it fails with a 409 / P2002 error and A's points remain at 10, not 20.
4. Try registering with a nonexistent referral code → expect 400, not silent failure.
5. Try referring yourself (edge case) → expect 400.

**Result:** [fill in after you run the test locally — see TESTING.md]

## Known Limitations / Future Work

- No email verification on signup
- Access token has no refresh flow (short expiry only)
- No admin view / leaderboard
- No pagination on referredUsers list (fine at this scale)
