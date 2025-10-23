<<<<<<< HEAD
# Career Reach Hub

Welcome to Career Reach Hub - Your Gateway to Professional Growth

## Overview
Career Reach Hub is a comprehensive platform designed to connect job seekers with potential employers, facilitating career development and professional networking.

## Features
- Job Search and Matching
- Professional Profile Management
# Career Reach Hub (CRH)

A React + Supabase learning platform for publishing courses, lessons and managing enrollments.

This repository contains the frontend application (Vite + React) and the client-side Supabase integration used for authentication, profile management and reading/writing course data.

---

## Quick start (development)

Prerequisites: Node.js (16+), npm, and a Supabase project.

1) Install dependencies

```powershell
npm install
```

2) Create a `.env` file in the project root with your Supabase values (example below).

3) Start the dev server

```powershell
npm run dev
```

Open http://localhost:5173 (Vite default) in your browser.

---

## Environment variables

Create a `.env` file in the project root with these keys (example):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Note: Vite exposes variables that start with `VITE_`. Restart the dev server after changing `.env`.

---

## Project structure (important files)

- `src/` - React source
	- `context/AuthContext.jsx` - central auth logic, session handling and user profile fetching
	- `lib/supabaseClient.js` - Supabase client instance
	- `pages/` - app pages (public, user, admin)
	- `routes/AppRouter.jsx` - top-level routing
	- `routes/ProtectedRoute.jsx` - route guard using `AuthContext`

Other important folders: `components/`, `pages/user/`, `pages/admin/`.

---

## Scripts

- `npm run dev` - start development server (Vite)
- `npm run build` - build production assets
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

---

## Supabase setup (recommended minimal schema & RLS)

This app expects these tables (simplified):

- `users` (id: uuid PK, email text, name text, phone text, interests text, role text)
- `courses` (id, title, description, is_premium boolean, price, status, thumbnail_url, duration, level, created_at)
- `lessons` (id, course_id, title, description, is_preview boolean, duration, order_index)
- `enrollments` (id, user_id, course_id)
- `lesson_progress` (id, user_id, lesson_id, completed boolean)

Example SQL to enable RLS and add safe policies for `users` (run in SQL editor in Supabase):

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
	ON public.users
	FOR SELECT
	USING (auth.uid() = id);

-- Allow users to insert own profile (during signup/profile create)
CREATE POLICY "Users can create own profile"
	ON public.users
	FOR INSERT
	WITH CHECK (auth.uid() = id);

-- (Optional) Allow authenticated service role to manage data from server-side
-- You may also create policies for courses/enrollments depending on app needs
```

Common RLS policies for content tables (courses / lessons): if courses are public read you can allow SELECT to everyone. For premium content you should gate access using join with enrollments or check user role.

Example: allow public read for published courses

```sql
CREATE POLICY "Public can read published courses"
	ON public.courses
	FOR SELECT
	USING (status = 'published');
```

If you see 500 errors when querying Supabase (PostgREST), check the SQL logs in Supabase Dashboard → Logs → Database / API and ensure RLS policies and column names match what the client expects.

---

## Authentication flow (how it's implemented)

- The app uses Supabase Auth. `AuthContext.jsx` initializes the client, reads the session, and subscribes to auth state changes via `supabase.auth.onAuthStateChange`.
- On SIGNED_IN, the context fetches the user's profile from the `users` table and exposes `userProfile`, `user`, `loading`, `signIn`, `signUp`, `signOut` in the context.
- Protected routes use `ProtectedRoute.jsx` which checks `loading`, `user`, and `isAdmin` (based on `userProfile.role`) before rendering children or redirecting to `/login`.

Troubleshooting auth:
- If login hangs at "Signing in...": open browser console and check logs. Common causes:
	- Missing or incorrect `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in `.env`
	- WebSocket / realtime connection issues in the client (check network tab)
	- RLS blocking access to `users` profile (causes 500 on SELECT)

If you see an error like `supabase.realtime.getConnectionStatus is not a function`, that indicates use of an unsupported API on the client — ensure you use Supabase client methods that match your `@supabase/supabase-js` version.

---

## Routing and course access (how to show CourseDetail for free courses)

- `CoursePage.jsx` lists courses and now navigates to `/courses/:courseId` when a card is clicked.
- `CourseDetailPage.jsx` loads course + lessons and determines access rules:
	- If `course.is_premium === false` → the course is free, show full details and lessons
	- If `course.is_premium === true` and the user is not enrolled → show preview and enrollment CTAs
	- If user is enrolled → allow full access

If you want to merge many user pages into a single entry (e.g., a `view` page that redirects to `CourseDetailPage` when a course is free), use a small helper route that fetches course metadata and redirects:

```jsx
// pseudo-code
const ViewCourse = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	useEffect(() => {
		// fetch /courses select is_premium where id = id
		// if !is_premium -> navigate(`/courses/${id}`)
		// else navigate('/courses/${id}') (CourseDetail handles preview/enroll logic)
	}, [id]);
	return null;
}
```

---

## Debugging tips

- Console logs: `AuthContext.jsx` already contains extensive logs — check them for `SIGNED_IN` events and profile fetch responses.
- If a profile SELECT returns HTTP 500:
	- Check RLS policies for the table
	- Confirm column names/types match client expectations
	- Inspect Supabase SQL logs (Database → Logs) for the precise PostgREST error
- If realtime/ws errors appear in browser devtools, try disabling realtime in client creation (or ensure correct usage for the installed `@supabase/supabase-js` version).

---

## Deployment

Build for production and deploy the `dist/` folder to any static host (Netlify, Vercel, Surge, etc.) and ensure environment variables are provided in the host's dashboard.

```powershell
npm run build
# then follow your host's steps to deploy
```

---

## Contributing

Contributions are welcome. Please open issues for bugs or feature requests and create pull requests for fixes. Keep changes small and focused.

---

## License

MIT

---
