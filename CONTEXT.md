# Gamundi — Agent Context

## What This App Is
A travel gamification mobile app built with Expo (React Native). Users unlock achievements by physically visiting locations (countries, world wonders, magic towns, hidden gems), share posts on a social wall, and compete on a global leaderboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK **54** (Managed Workflow) |
| Navigation | Expo Router v6 (file-based) |
| Styling | NativeWind v4 + Tailwind CSS v3 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| ORM | Prisma v7 |
| Payments | RevenueCat (placeholder stub only) |
| Language | TypeScript strict mode |

---

## Critical Version Pins — DO NOT CHANGE WITHOUT TESTING

These versions are pinned to resolve known Expo Go / React Native renderer conflicts:

```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-worklets": "0.5.1",
  "react-native-reanimated": "~4.1.1",
  "expo-router": "~6.0.23",
  "nativewind": "^4.2.3",
  "tailwindcss": "^3.x"
}
```

**Why:** `react-native@0.81.5` ships `react-native-renderer@19.1.0`. React must be exactly `19.1.0`. Installing newer versions of `react-native-worklets` (>0.5.1) silently upgrades React to 19.2.x which crashes the renderer.

When adding new packages, always use `npx expo install <package>` (not `npm install`) to get SDK-compatible versions.

---

## Supabase Configuration

- **Project URL:** `https://jtqiexceipvkrmvijmdy.supabase.co`
- **Anon key:** in `.env` as `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Pooler URL (app):** port `6543` with `?pgbouncer=true` → `DATABASE_URL`
- **Direct URL (migrations):** port `5432` → `DIRECT_URL`

The Supabase client (`src/services/supabase.ts`) uses `AsyncStorage` for session persistence in React Native.

**Important:** `prisma.config.ts` uses `DIRECT_URL` (not `DATABASE_URL`) for schema operations. PgBouncer blocks DDL statements.

---

## Database Schema (Prisma)

Located at `prisma/schema.prisma`. Tables live in the `public` schema.

| Table | Key Fields |
|---|---|
| `users` | `auth_id` (links to Supabase auth), `total_points`, `rank` (enum), `current_streak` |
| `trips` | `location_data` (JSON), `user_id` |
| `challenges` | `category` (COUNTRY/WONDER/HIDDEN_GEM/MAGIC_TOWN), `points_value`, `lat/lon/radius` |
| `user_achievements` | join table `(user_id, challenge_id)` unique, `points_at_unlock` |
| `social_posts` | `content`, `image_url`, `location_tag`, `likes_count` |
| `friendships` | `follower_id`, `following_id`, `status` (PENDING/ACCEPTED/BLOCKED) |

**To apply schema changes:**
```bash
npx prisma db push        # dev — uses DIRECT_URL
npx prisma migrate dev    # production-ready migrations
npx prisma generate       # regenerate client after schema changes
```

---

## Folder Structure

```
app/                        # Expo Router screens
├── _layout.tsx             # Root layout — session guard, redirects auth↔tabs
├── (auth)/
│   ├── login.tsx           # Sign in screen
│   └── register.tsx        # Sign up screen with password strength meter
└── (tabs)/
    ├── _layout.tsx         # Custom tab bar
    ├── index.tsx           # 🌍 Explore / Globe
    ├── challenges.tsx      # 🏆 Challenge list with category filter
    ├── social.tsx          # 🐰 Rabbit Network (social wall)
    └── profile.tsx         # 👤 Stats + Achievements + Leaderboard

src/
├── components/
│   ├── auth/
│   │   └── AuthInput.tsx   # Labeled input with focus state, password toggle, inline error
│   ├── challenges/ChallengeCard.tsx
│   ├── map/GlobeView.tsx   # Globe placeholder (swap with react-native-maps)
│   ├── profile/
│   │   ├── StatsCard.tsx
│   │   └── LeaderboardRow.tsx
│   ├── social/PostCard.tsx
│   └── ui/
│       ├── Badge.tsx       # RankBadge, CategoryBadge
│       ├── Button.tsx
│       └── Card.tsx
├── constants/
│   ├── challenges.ts       # Seed data for challenges (6 entries)
│   └── theme.ts            # COLORS, RANK_COLORS, CATEGORY_ICONS
├── hooks/
│   ├── useAuth.ts          # Session listener, profile fetch
│   ├── useChallenges.ts    # Challenges + user achievements
│   ├── useProfile.ts       # Profile + leaderboard
│   └── useSocial.ts        # Posts feed + createPost
├── services/
│   ├── auth.ts             # signUp, signIn, signOut, getSessionUser
│   ├── revenuecat.ts       # Placeholder stubs
│   ├── supabase.ts         # Supabase client singleton
│   └── unlock.ts           # Haversine distance unlock engine
└── types/
    ├── database.ts         # All DB entity types
    └── index.ts            # Re-exports + UnlockResult, AuthState, ApiResponse
```

---

## Auth Flow

1. `app/_layout.tsx` runs `useAuth()` on mount
2. `useAuth` calls `supabase.auth.getSession()` and subscribes to `onAuthStateChange`
3. If no session → redirect to `/(auth)/login`
4. If session exists → redirect to `/(tabs)`
5. On sign-up, a row is inserted in `public.users` linked via `auth_id` to `auth.users`

---

## Unlock Logic (`src/services/unlock.ts`)

The core gamification engine:
1. Fetches all active challenges with coordinates from Supabase
2. Fetches already-unlocked challenge IDs for the user
3. Calculates Haversine distance between user coordinates and each challenge
4. For challenges within `radius_meters`, inserts a `user_achievement` row
5. Updates `users.total_points` and recalculates `users.rank` tier

`evaluateMockUnlock(userId)` uses Mexico City coordinates for testing without GPS.

**Rank thresholds:** BRONZE=0, SILVER=500, GOLD=1500, PLATINUM=4000, DIAMOND=10000

---

## Config Files

| File | Purpose |
|---|---|
| `babel.config.js` | NativeWind babel preset + `react-native-reanimated/plugin` |
| `metro.config.js` | `withNativeWind` wrapping, points to `global.css` |
| `tailwind.config.js` | Custom tokens under `brand.*` and `rank.*` |
| `global.css` | Tailwind directives entry point |
| `nativewind-env.d.ts` | Type shim for `className` prop |
| `prisma.config.ts` | Prisma config — uses `DIRECT_URL` for migrations |
| `.env` | Local env vars (gitignored) |

---

## NativeWind Setup Notes

- NativeWind v4 requires `react-native-css-interop` which requires `react-native-worklets` and `react-native-reanimated` at runtime.
- `SafeAreaView` must come from `react-native-safe-area-context`, NOT from `react-native` (deprecated).
- All className strings must be static (no dynamic template literals with variables — use conditional objects or array joins).

---

## Running the App

```bash
# Start dev server (kill any existing expo process first)
npx expo start --clear

# Type check
npx tsc --noEmit

# Push schema to Supabase (dev)
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

Compatible with **Expo Go 54.x** on iOS and Android.
