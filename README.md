# 📝 Notez

**Notez** is a polished, production-ready **full-stack note-taking application** built with the **MERN stack** (MongoDB, Express, React, Node.js). Create, edit, organize, search, export, and delete rich-text notes and to-do lists. Every user sees *only* their own data — ownership is enforced on the server, never just in the UI.

![Notez logo](client/public/assets/logo-mark.svg)

---

## ✨ Features

- **Authentication** — secure email/password signup & login with `bcrypt` password hashing and JWT-based sessions (httpOnly cookies). Session persists across refreshes.
- **Rich-text editor** — TipTap-based editor with bold, italic, underline, strikethrough, headings, bullet/numbered lists, alignment, text color, font size, font family, links, undo/redo, and autosave.
- **Image insertion & editing** — add images inside notes by URL or by uploading a file (stored in **Cloudinary**), then resize them with a drag handle and **crop** them in the editor.
- **To-do lists** — add, check, edit, delete, and reorder tasks with a live progress bar; completion state persists.
- **Search & filters** — instant search across title / content / tags, plus tabs for All / Pinned / To-dos / Archived and sorting.
- **Organization** — pin, archive, color accents, and tags on every note.
- **PDF export** — every note and to-do list exports to a downloadable PDF (jsPDF).
- **Modern UI** — responsive, accessible, light/dark mode, smooth animations, loading skeletons, empty states, toasts, and a floating **+** action.
- **Security** — server-side ownership checks, input validation (Zod), Helmet, CORS, rate limiting, and sanitized content storage (structured editor JSON, never raw user HTML).

---

## 🧱 Tech stack

| Layer | Technology |
|------|-----------|
| Frontend | React 18 + Vite, React Router, Tailwind CSS, TipTap, jsPDF, Lucide icons |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB (Atlas recommended) |
| Auth | bcryptjs + jsonwebtoken (httpOnly cookies) |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |

---

## 📁 Project structure

```
notez/
├── client/                  # React + Vite frontend
│   ├── public/assets/       # logo-mark.svg, logo-text.svg, etc.
│   └── src/
│       ├── components/      # Navbar, NoteCard, RichTextEditor, TodoEditor, FAB, …
│       ├── pages/           # Login, Register, Home, NoteEditor, TodoEditor
│       ├── layouts/         # AuthLayout, AppLayout
│       ├── context/         # Auth, Theme, Toast providers
│       ├── hooks/           # useNotes
│       ├── services/        # centralized API client
│       └── utils/           # editor helpers, PDF export
├── server/                  # Express + Mongoose backend
│   ├── config/              # env, db
│   ├── controllers/         # auth, notes
│   ├── middleware/          # auth, rate-limit, errors
│   ├── models/              # User, Note
│   ├── routes/              # auth, notes
│   ├── validators/          # Zod schemas
│   ├── api/index.js         # Vercel serverless entry
│   └── server.js            # local dev server
├── .env.example
├── README.md
└── vercel.json
```

---

## 🚀 Getting started (local development)

### Prerequisites

- **Node.js** 18.17 or newer
- **MongoDB** — local install **or** a free **MongoDB Atlas** cluster

### 1. Clone & install dependencies

```bash
git clone <your-repo-url> notez
cd notez
npm install                # root helpers (concurrently)
npm --prefix server install
npm --prefix client install
```

> Or run `npm run install:all` from the root.

### 2. Configure environment variables

```bash
cp .env.example server/.env
```

Then edit `server/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/notez?retryWrites=true&w=majority
JWT_SECRET=use-a-long-random-string
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
COOKIE_SECURE=false
```

> **Local MongoDB** alternative:
> `MONGODB_URI=mongodb://127.0.0.1:27017/notez`

### 3. Run the app

```bash
npm run dev          # starts both server (:5000) and client (:5173)
```

- Frontend → http://localhost:5173
- API health → http://localhost:5000/api/health

In development the Vite dev server proxies `/api` to the Express server, so the browser stays **same-origin** and the httpOnly auth cookie just works — same as production.

### 4. Run tests

```bash
npm test              # backend validation tests (node:test)
```

---

## ☁️ Deploying to Vercel

Notez ships with a `vercel.json` that deploys the **React frontend as static assets** and the **Express API as a serverless function** on a single Vercel project (the `/api/*` routes are rewritten to the Node function, and everything else is served by the client).

### Option A — Deploy with the Vercel CLI

```bash
# 1. Install the CLI and log in
npm i -g vercel
vercel login

# 2. From the project root, run and follow the prompts
cd notez
vercel

# 3. Add the environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add COOKIE_SECURE true
vercel env add CLIENT_URL https://<your-deployment>.vercel.app
# NODE_ENV is set to production automatically by Vercel
```

### Option B — Deploy via the dashboard

1. Push this repository to GitHub.
2. In [vercel.com](https://vercel.com) click **New Project** → import the repo.
3. The root should auto-detect; ensure the **Root Directory** stays at the repository root (the `vercel.json` handles the monorepo build).
4. Add the **Environment Variables** above (Settings → Environment Variables).
5. Deploy.

### Production environment variables

| Variable | Example | Notes |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/notez?retryWrites=true&w=majority` | Use a MongoDB Atlas cluster; allow access from Vercel IPs or use Atlas network access "Allow access from anywhere" for simplicity. |
| `JWT_SECRET` | a long random string | Generate with `openssl rand -hex 32`. |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime. |
| `CLIENT_URL` | `https://your-app.vercel.app` | For CORS (same-origin requests still work). |
| `COOKIE_SECURE` | `true` | Mark the session cookie Secure in production. |
| `NODE_ENV` | *(auto)* | Set to `production` by Vercel. |
| `CLOUDINARY_CLOUD_NAME` | your cloud name | *(Optional)* Required for image uploads. From your Cloudinary Dashboard → Account Details. |
| `CLOUDINARY_API_KEY` | your api key | *(Optional)* Required for image uploads. |
| `CLOUDINARY_API_SECRET` | your api secret | *(Optional)* Required for image uploads. |

After deployment, visit `https://<your-app>.vercel.app/api/health` — you should see `{ "status": "ok" }`.

> **Free-tier note:** serverless cold starts mean the first request after idle can take a few seconds to wake the MongoDB connection. The connection is cached for warm instances.

### Optional: enable Cloudinary image uploads

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. In the **Dashboard → Account Details**, copy `Cloud name`, `API Key`, and `API Secret`.
3. Add them as environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) — locally in `server/.env`, and on Vercel under Settings → Environment Variables.
4. Restart the server. Now when you upload an image in the note editor it is stored in Cloudinary and referenced by URL. **Resize** any image by dragging the handle in its bottom-right corner, and select an image then press the **Crop** toolbar button to trim it (the cropped result is re-uploaded to Cloudinary). Without these vars the upload endpoint returns a clear “not configured” message — add the three values to enable image uploads.

---

## 🔐 Security notes

- **Ownership is enforced server-side.** Every note query is filtered by the authenticated user id derived from the verified JWT — never from a client-supplied `userId`. A user cannot access, edit, delete, or search another user's notes by changing an ID.
- **Passwords are hashed** with bcrypt (cost 12) and never returned by the API.
- **Login/registration responses never reveal whether an email exists.**
- **Auth tokens** are stored in **httpOnly cookies** (Secure in production, SameSite=Lax) for protection against XSS.
- **Content is stored as structured TipTap JSON**, not raw HTML, and rendered safely to prevent stored XSS.
- **Rate limiting** is applied to auth endpoints and the API; **Helmet** sets secure headers; **Zod** validates every body.

---

## 🧭 Decision notes

- **Cookie auth vs. localStorage:** we chose httpOnly cookies. In dev the Vite proxy keeps the browser same-origin; on Vercel the SPA and `/api` share one origin — so cookies are both secure and seamless.
- **Rich-text editor:** TipTap (ProseMirror) was chosen over Quill/Lexical for its structured JSON output and robust formatting toolbar.
- **PDF export:** jsPDF generates the PDF client-side (title, dates, owner, tags, content, and checkbox tasks), so no extra server dependency is needed and it works on mobile.
- **Search:** scoped, ownership-filtered regex search over title/content/tags for predictable per-user results.

---

## 📜 License

MIT © Notez