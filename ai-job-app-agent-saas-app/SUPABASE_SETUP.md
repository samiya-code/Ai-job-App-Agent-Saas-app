# Supabase setup

The application uses email/password and Google OAuth through Supabase Auth. Its browser-safe project URL and publishable key are read from `.env.local`.

Copy `.env.local.example` to `.env.local` and fill in your project's `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Apply the database migration

Run `supabase/migrations/20260812000000_auth_profiles.sql` in the Supabase SQL Editor, or apply it with the Supabase CLI. It creates a `profiles` table, row-level security policies, and an `auth.users` trigger that provisions a profile for every new user.

## Configure authentication

In **Authentication > Providers**, enable **Email** and **Google**. For Google, add the OAuth client ID and secret from Google Cloud Console.

In **Authentication > URL Configuration**, set the site URL to the deployed application URL and add these redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

Use the actual local port if the development server runs on a port other than 3000. Google Cloud Console must also allow Supabase's OAuth callback URL, which Supabase displays in the Google provider settings.
