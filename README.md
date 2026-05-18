# CTFlogs

Next.js App Router application for publishing and managing security writeups.

The app uses Node.js route handlers with SQLite for storage. On first run it creates `data/secwriteups.sqlite` and seeds the bundled example writeups.

## Environment

This project now includes admin authentication using username/password + JWT cookie.

Use `.env` for local development and keep real secrets out of version control.

Required variables:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `ADMIN_JWT_EXPIRES_IN_SECONDS`
- `ADMIN_AUTH_COOKIE_NAME`
- `SQLITE_PATH`

## Development

1. Install dependencies:
   `npm install`
2. Start dev server:
   `npm run dev`
3. Open `http://localhost:3000`

## Build

`npm run build`

## Start production

`npm run start`

## Admin Portal

Open `http://localhost:3000/admin/login` and login with your admin credentials.

After successful login you can access `http://localhost:3000/admin` to create, edit, delete, publish, privatize, and preview writeups.

## Ads Manager

Open `http://localhost:3000/admin/adds` to manage non-intrusive ad placements.

- Image / affiliate ads are uploaded, converted to `.webp`, and compressed below 30 KB.
- Google ad snippets can be added as a separate ad type.
- Supported placements are home sidebar, home feed, writeup sidebar, and writeup bottom.
- Ads can be paused before publishing so they do not appear on reader pages.

## Database

By default the SQLite database is stored at `data/secwriteups.sqlite`.

Set `SQLITE_PATH=/absolute/path/to/database.sqlite` if you want to store it somewhere else.
