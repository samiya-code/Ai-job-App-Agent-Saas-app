# Supabase setup

The application uses email/password and Google OAuth through Supabase Auth. Its browser-safe project URL and publishable key are read from `.env.local`.

Copy `.env.local.example` to `.env.local` and fill in your project's `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Apply the database migration

Run `supabase/migrations/20260812000000_auth_profiles.sql` in the Supabase SQL Editor, or apply it with the Supabase CLI. It creates a `profiles` table, row-level security policies, and an `auth.users` trigger that provisions a profile for every new user.

Then run `supabase/migrations/20260813000000_resume_onboarding.sql`. It extends `profiles`, adds resume/profile child tables, creates the private `resumes` storage bucket, and configures storage RLS policies.

Then run `supabase/migrations/20260814000000_jobs.sql`. It creates the `jobs` table used by the Jobs page to cache job matches fetched from external platforms, with row-level security policies.

## Brave Search (job matching)

The Jobs page fetches job listings from Greenhouse, Lever, Workable, and Wellfound through the Brave Search API. Add this server-only variable to `.env.local`:

```env
BRAVE_SEARCH_API_KEY=your-brave-search-api-key
```

Get an API key from the [Brave Search API dashboard](https://api-dashboard.search.brave.com/). Results are cached in the `jobs` table for 6 hours per user before the API is called again.

## Gemini AI (resume parsing)

Add these server-only variables to `.env.local`:

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Configure authentication

In **Authentication > Providers**, enable **Email** and **Google**. For Google, add the OAuth client ID and secret from Google Cloud Console.

In **Authentication > URL Configuration**, set the site URL to the deployed application URL and add these redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

Use the actual local port if the development server runs on a port other than 3000. Google Cloud Console must also allow Supabase's OAuth callback URL, which Supabase displays in the Google provider settings.
