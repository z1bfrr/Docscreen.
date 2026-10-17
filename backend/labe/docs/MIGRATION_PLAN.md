# AuraLab — React Native / Expo Migration Plan

> **Status:** Phase 1 Complete — Analysis Done. Awaiting implementation approval.

---

## 1. Existing Technology Stack

### Android Application (`/auralab/`)

| Layer | Technology |
|---|---|
| Language | Kotlin |
| UI Framework | Jetpack Compose (NOT XML) |
| Architecture | Single-Activity + Composables |
| Navigation | Jetpack Navigation Compose |
| State | `remember` / `mutableStateOf` (local only) |
| Data Layer | Static `MockRepository` (no network) |
| Image Loading | Coil |
| Animations | `rememberInfiniteTransition`, `animateFloat` |
| Authentication | **None implemented** |
| Networking | **None implemented** |
| Local Database | **None** |
| Firebase | **Not used** |
| Supabase | **Not used** |
| Payments | **Not implemented** |
| Notifications | **Not implemented** |
| Location / Maps | **Not implemented** (hardcoded "Madurai") |
| Permissions | INTERNET + ACCESS_NETWORK_STATE only |
| Target SDK | 35 (Android 15) |
| Min SDK | 26 (Android 8.0) |
| App Package | `com.auralab.diagnostics` |

### Backend (`/app/` — Python FastAPI)

**CRITICAL FINDING:** The `/app` backend is a completely separate product — the DocScreen AI document screening system (SIH 2026 hackathon). It handles OCR, ML anomaly detection, and forensic document analysis. It is NOT an AuraLab diagnostic marketplace API.

The AuraLab Android app uses ONLY mock/static data. There is no existing AuraLab backend API. We must build a new API layer or use mock data as the initial data source.

---

## 2. Existing Screens

### Bottom Tab Navigation (4 tabs)

| Tab | Route | Screen |
|---|---|---|
| Home | `home` | HomeScreen.kt |
| Tests | `search?query=&category=` | SearchScreen.kt |
| Orders | `tracking/ORD-2024-001` (hardcoded!) | TrackingScreen.kt |
| Profile | `profile` | ProfileScreen.kt |

### Stack Screens

| Screen | Route | File |
|---|---|---|
| Compare Labs | `compare/{testId}` | CompareLabsScreen.kt |
| Book Test | `booking/{testId}/{labId}` | BookingScreen.kt |
| Track Order | `tracking/{orderId}` | TrackingScreen.kt |

### Missing Screens (must build new)
- Login / Register / Forgot Password
- Payment screen
- Lab detail page
- Report download
- Notification center
- Address management
- Family member management

---

## 3. Navigation Flow

```
App Launch
  └─ HomeScreen (tab)
       ├─ SearchScreen (tab / search bar)
       │     └─ CompareLabsScreen
       │             └─ BookingScreen
       │                     └─ TrackingScreen
       ├─ TrackingScreen (tab - hardcoded ORD-2024-001)
       └─ ProfileScreen (tab)
               └─ TrackingScreen (from order history)
```

---

## 4. Data Models (from Models.kt)

All 10 models + 2 enums:

- `DiagnosticTest` — id, name, shortName, category, description, prep, TAT, sampleType, parameters[], isPopular, isHomeCollectionAvailable
- `LabPartner` — id, name, address, city, distance, rating, reviewCount, isNabl, isCap, operatingHours, homeCollectionCharge, tests[]
- `LabTestPrice` — testId, price, discountPercent
- `TestCategory` — id, name, icon, color
- `HealthPackage` — id, name, description, testsIncluded[], originalPrice, discountedPrice, discountPercent, isBestseller
- `CartItem` — test, lab, price
- `BookingOrder` — id, patientName, patientAge, patientGender, tests[], lab, totalAmount, collectionType, address?, scheduledDate, scheduledTimeSlot, status, trackingSteps[]
- `TrackingStep` — title, subtitle, time?, isCompleted, isCurrent
- `TimeSlot` — id, time, isAvailable
- `PatientProfile` — id, name, age, gender, phone, email, address, bloodGroup
- `enum CollectionType` — HOME_COLLECTION, WALK_IN
- `enum OrderStatus` — BOOKED, SAMPLE_COLLECTED, PROCESSING, REPORT_READY, DELIVERED

### Mock Data Volume
- 12 test categories
- 20 diagnostic tests (t001–t020)
- 8 lab partners (all in Madurai)
- 5 health packages
- 12 time slots
- 2 mock orders
- 1 patient profile (hardcoded "Mukesh Z")

---

## 5. Features Inventory

### Working Features (migrate these)
- Browse 12 test categories (horizontal scroll)
- Browse health packages with discounts
- Popular tests with min price from labs
- Full-text search (name, shortName, category, parameters)
- Category filter chips
- Lab comparison sorted by price
- NABL/CAP badges, ratings, home collection info
- Multi-step booking flow: collection type, date, time slot, patient details, address, price summary, confirm
- Booking confirmation dialog (mock)
- 5-step order tracking timeline with pulse animation
- Order status banner
- Profile: personal info, order history, settings menu
- Active order banner on home
- "Why AuraLab" trust signals

### Stubs / No-ops (build these properly in React Native)
- Report download
- Share order
- Contact support
- Edit profile
- Sign Out
- Notifications settings
- Add Family Member

---

## 6. Android Dependencies → React Native Equivalents

| Android | React Native / Expo |
|---|---|
| Jetpack Compose @Composable | React functional component (.tsx) |
| LazyColumn | FlatList or FlashList |
| LazyRow | FlatList horizontal |
| NavHost + composable() | Expo Router app/ directory |
| BottomNavigation | Expo Router Tabs |
| TopAppBar | Stack.Screen options header |
| remember { mutableStateOf() } | useState |
| rememberInfiniteTransition | react-native-reanimated withRepeat |
| Surface + shape | View with borderRadius |
| AlertDialog | Custom Modal |
| OutlinedTextField | TextInput with styled border |
| Brush.verticalGradient | expo-linear-gradient |
| Color(0xFFRRGGBB) | '#RRGGBB' |
| MockRepository singleton | lib/mockData.ts module |
| Coil | expo-image |
| SharedPreferences | expo-secure-store / AsyncStorage |
| Material Extended Icons | @expo/vector-icons MaterialIcons |
| PlusJakartaSans font | @expo-google-fonts/plus-jakarta-sans |
| Manrope font | @expo-google-fonts/manrope |
| enableEdgeToEdge() | expo-status-bar + safe-area-context |

---

## 7. Design Tokens (Color.kt → colors.ts)

| Kotlin | Hex | TypeScript |
|---|---|---|
| Sapphire | #1D4ED8 | colors.primary |
| SapphireBright | #2563EB | colors.primaryHover |
| SapphireLight | #EFF6FF | colors.primaryLight |
| DeepSlate | #0F172A | colors.textPrimary |
| Slate700 | #334155 | colors.textSecondary |
| Slate500 | #64748B | colors.textMuted |
| Slate300 | #CBD5E1 | colors.border |
| Slate100 | #F1F5F9 | colors.surfaceRecessed |
| CyanTeal | #06B6D4 | colors.info |
| Emerald | #10B981 | colors.success |
| EmeraldDark | #047857 | colors.successDark |
| AlertRed | #EF4444 | colors.error |
| AmberWarning | #F59E0B | colors.warning |
| Canvas | #F8FAFC | colors.background |
| White | #FFFFFF | colors.surface |

---

## 8. Features to Build New

| Feature | Reason | Priority |
|---|---|---|
| Auth (Login/Register/Logout) | Not in Android | High |
| Session persistence | Not in Android | High |
| Protected route guards | Not in Android | High |
| Real API client layer | Android uses mock only | High |
| Loading / Error / Empty states | Mock = instant, no states needed | High |
| Environment variable management | No .env in Android | High |
| Lab detail screen | Android skips to booking directly | Medium |
| Payment flow | Not in Android | Medium |
| Report download | Stub only | Medium |
| Push notifications | Not in Android | Medium |
| Offline state handling | Not in Android | Medium |
| Address book | Not in Android | Low |
| Family member management | Stub only | Low |

---

## 9. Recommended Migration Order (6 Phases)

### Phase A — Foundation
1. Initialize Expo project (TypeScript + Expo Router)
2. Port design tokens (colors, typography, spacing)
3. Build base UI primitives (Button, Card, Badge, Input, Divider)
4. Port MockRepository.kt to lib/mockData.ts
5. Port Models.kt to types/index.ts

### Phase B — Core Screens (all using mock data)
6. Home screen — app/(tabs)/index.tsx
7. Search screen — app/(tabs)/search.tsx
8. Compare Labs — app/labs/[testId]/compare.tsx
9. Booking — app/booking/index.tsx
10. Order Tracking — app/orders/[id].tsx
11. Profile — app/(tabs)/profile.tsx

### Phase C — Navigation Shell
12. Tab navigator _layout.tsx
13. Stack navigation for booking/compare/tracking
14. Root _layout.tsx (fonts, providers, safe area)

### Phase D — Auth Layer
15. Login, Register, Forgot Password screens
16. AuthContext + useAuth hook
17. Protected route redirect logic
18. expo-secure-store token persistence

### Phase E — API Layer
19. services/api/client.ts (Axios + interceptors)
20. labs.ts, tests.ts, bookings.ts, auth.ts services
21. Replace mock data with real API calls
22. Loading / error / retry states on all screens

### Phase F — Production Polish
23. Form validation with Zod
24. eas.json EAS Build configuration
25. .env.example
26. README.md + full docs suite

---

## 10. Potential Blockers

| Blocker | Risk | Mitigation |
|---|---|---|
| No existing AuraLab backend API | High | Phases A-C use mock data; Phase E builds API |
| No auth system | High | Design from scratch in Phase D |
| Extended Material Icons mapping | Medium | Map manually to @expo/vector-icons |
| Windows-only, no Mac/Xcode | Medium | Expo Go for dev + EAS cloud build for iOS |
| Pulse animation (tracking) | Low-Medium | Reanimated withRepeat + withTiming |
| Gradient backgrounds | Low | expo-linear-gradient |
| Google Fonts | Low | @expo-google-fonts packages |
| iOS safe area | Low | react-native-safe-area-context |

---

## 11. Proposed Final Project Structure

```
auralab-mobile/
├── app/
│   ├── _layout.tsx                 Root layout
│   ├── +not-found.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx             Tab bar
│   │   ├── index.tsx               Home
│   │   ├── search.tsx              Search / Tests
│   │   ├── orders.tsx              Order history
│   │   └── profile.tsx             Profile
│   ├── labs/[testId]/
│   │   └── compare.tsx             Compare labs
│   ├── booking/
│   │   ├── index.tsx               Booking form
│   │   └── confirmation.tsx        Booking confirmed
│   └── orders/[id].tsx             Order tracking
│
├── components/
│   ├── ui/                         Button, Card, Badge, Input, Divider,
│   │                               LoadingSpinner, ErrorState, EmptyState
│   ├── cards/                      TestCard, LabCard, PackageCard, OrderCard, CategoryChip
│   ├── booking/                    CollectionTypeSelector, DateSelector, TimeSlotGrid, PatientDetailsForm
│   └── tracking/                   StatusBanner, TrackingTimeline
│
├── features/
│   ├── auth/                       AuthContext, useAuth
│   ├── labs/                       useLabs
│   ├── booking/                    useBooking
│   └── profile/                    useProfile
│
├── services/
│   ├── api/                        client.ts, auth.ts, labs.ts, tests.ts, bookings.ts, payments.ts
│   └── storage/                    secureStorage.ts, asyncStorage.ts
│
├── hooks/                          useDebounce, useColorScheme
├── lib/                            mockData.ts, utils.ts
├── constants/                      colors.ts, typography.ts, spacing.ts, config.ts
├── types/                          index.ts (all TypeScript interfaces + enums)
├── utils/                          formatters.ts, validators.ts (Zod)
├── assets/                         fonts/, images/
├── docs/                           MIGRATION_PLAN, ARCHITECTURE, API, SETUP, BUILD, IOS_BUILD, ANDROID_BUILD
│
├── .env.example
├── .gitignore
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 12. Architecture Decisions

**ADR-001 State Management:** React Context + useState for auth; mock data direct calls for server state in Phases A-C. Migrate to TanStack Query in Phase E.

**ADR-002 Navigation:** Expo Router (file-based). Maps cleanly to existing route structure. Deep linking built-in.

**ADR-003 Data:** Port MockRepository.kt to TypeScript as Phase A-C data source. Real API in Phase E.

**ADR-004 Auth:** Build from scratch with JWT + expo-secure-store. Nothing exists in Android to reuse.

**ADR-005 Icons:** @expo/vector-icons (MaterialIcons + MaterialCommunityIcons). Full coverage of all Kotlin icons.

**ADR-006 Fonts:** @expo-google-fonts/plus-jakarta-sans + @expo-google-fonts/manrope (these are the intended fonts in Type.kt, currently using system fallback).

---

## 13. Future API Contract

```
GET  /api/v1/categories
GET  /api/v1/tests?query=&category=&page=&limit=
GET  /api/v1/tests/:id
GET  /api/v1/labs?testId=
GET  /api/v1/labs/:id
GET  /api/v1/packages
GET  /api/v1/timeslots?labId=&date=

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

GET  /api/v1/profile
PUT  /api/v1/profile

POST /api/v1/bookings
GET  /api/v1/bookings
GET  /api/v1/bookings/:id
GET  /api/v1/bookings/:id/tracking

POST /api/v1/payments/initiate
POST /api/v1/payments/verify   (server-side validation — never trust client)
```

---

## 14. Summary

| Category | Status |
|---|---|
| Android codebase analysis | Complete |
| UI framework | Jetpack Compose (similar mental model to React) |
| AuraLab backend API | Does not exist — app is mock-data-only |
| Authentication | Not implemented |
| Payments | Not implemented |
| Notifications | Not implemented |
| Location / Maps | Not implemented |
| Screens to migrate | 6 existing screens |
| Features to build new | 14 additional features |
| Migration complexity | Low to Medium overall |
| Migration phases | 6 (A through F) |
| Dev environment | Windows + Expo Go + EAS Cloud for iOS |
| Main risk | No backend API exists — must build or use mock data |
