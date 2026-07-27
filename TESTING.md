# Manual Test Plan — copy/paste commands

Run backend first (`npm run dev` in /backend). Then run these curl commands
in order, in a fresh terminal. Save the output — paste it into the README's
"Result" section before you submit.

## 1. Register User A
```bash
curl -s -c a.txt -X POST http://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"password123"}'
```
Copy the `referralCode` from the response — you'll need it below (replace `ALICECODE`).

## 2. Register User B using A's referral code
```bash
curl -s -c b.txt -X POST http://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@test.com","password":"password123","referralCode":"ALICECODE"}'
```

## 3. Confirm A's points are now 10
```bash
curl -s -b a.txt http://localhost:4000/api/dashboard
```
Expect `"points": 10` and Bob listed under `referredUsers`.

## 4. Try to double-credit Bob's referral (should fail with 409)
Open Prisma Studio (`npx prisma studio`) or psql, and try inserting a second
`Referral` row with the same `referredUserId` as Bob's. It should be rejected
by the unique constraint (P2002). Confirm Alice's points are still 10, not 20.

## 5. Nonexistent referral code (expect 400)
```bash
curl -s -X POST http://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Carl","email":"carl@test.com","password":"password123","referralCode":"NOTREAL1"}'
```

## 6. Self-referral guard (expect 400)
Not reachable through normal registration (a user can't refer themselves before
they exist), but the guard in `referral.service.ts` covers it defensively if
`applyReferral` is ever called with the same id for both parties.

---

Record what actually happened (status codes + point values) in the README's
"Result" line before submitting — evaluators specifically look for this.
