# Deal Exchange Platform MVP

## Stack
- Frontend: Next.js 14 + React + TypeScript
- Backend: Supabase PostgreSQL + Auth + Storage
- Styling: Tailwind CSS
- Hosting target: Vercel
- CDN / edge security target: Cloudflare

## Environment
Copy `.env.example` to `.env` in the repo root or `front/.env.example` to `front/.env.local` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_WHATSAPP_PREFIX` if you need a custom WhatsApp entry point

## Database Setup
1. Create a Supabase project.
2. Run the SQL in [supabase/app-schema.sql](/workspace/supabase/app-schema.sql) inside the Supabase SQL editor.
3. Confirm that the `listing-images` and `listing-documents` buckets exist.
4. Create at least one admin user in `auth.users`, then update `public.users.role='admin'` and `public.users.status='approved'` for that account.
5. Optionally seed broker and listing data after your first approved broker account exists.

## Local Run
1. `cd front`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000`

## Workflow Notes
- Public visitors apply through `/apply`.
- Applications create pending broker accounts plus broker profile rows.
- Approved brokers can access `/dashboard`, `/listings`, `/requirements`, and `/post-listing`.
- Admins control broker approvals, listing approvals, broker suspension/deactivation, activity logs, and CSV export from `/admin`.
- Listing `notes` are intended as restricted broker notes and are not granted to the browser feed query role.

## Deployment
- Deploy the `front` app to Vercel.
- Add the same environment variables in Vercel project settings.
- Put Cloudflare in front of the Vercel deployment for WAF, caching, and bot controls.
- Point production Supabase URL and keys to the hosted project before the first deploy.

## Verified
- `npm run build` in `front` completes successfully.
