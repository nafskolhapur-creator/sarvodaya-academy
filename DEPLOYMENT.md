# Production Deployment Guide

## Architecture

- Backend: Node.js + Express (`backend/`)
- Frontend: React + Vite (`frontend/`)
- Database: MongoDB Atlas

## Environment Variables

### Backend (`backend/.env`)

Use [backend/.env.example](/E:/nafsapp/backend/.env.example:1) as the template.

Required for production:

- `NODE_ENV=production`
- `MONGODB_URI` from MongoDB Atlas
- `JWT_SECRET` with a long random secret
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CORS_ORIGINS` with your deployed frontend domain(s)
- `FRONTEND_URL`
- `FORCE_HTTPS=true`
- `TRUST_PROXY=1` on Render/Railway or behind a reverse proxy

Optional:

- `WHATSAPP_API_URL`
- `WHATSAPP_API_KEY`
- `WHATSAPP_PHONE_NUMBER`
- `SERVE_FRONTEND=true` if serving `frontend/dist` from the backend on a VPS

### Frontend (`frontend/.env`)

Use [frontend/.env.example](/E:/nafsapp/frontend/.env.example:1) as the template.

- `VITE_API_BASE_URL=https://your-backend-domain.com`
- `VITE_APP_BASE_PATH=/`

## MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user with a strong password.
3. Add your deployment IPs or allow the hosting platform.
4. Put the Atlas connection string into `MONGODB_URI`.

## Backend Hosting

### Render

- Use [render.yaml](/E:/nafsapp/render.yaml:1) or create services manually.
- Backend root directory: `backend`
- Start command: `npm start`
- Health check: `/api/health`

### Railway

- Backend root directory: `backend`
- Start command: `npm start`
- Use [railway.json](/E:/nafsapp/railway.json:1) as a reference

### VPS

Options:

- Run `backend/` directly with PM2 or systemd
- Or build the container from [backend/Dockerfile](/E:/nafsapp/backend/Dockerfile:1)

Recommended VPS reverse proxy:

- Nginx or Caddy in front of the backend
- Enable TLS/HTTPS
- Forward `X-Forwarded-Proto` and `X-Forwarded-For`

## Frontend Hosting

### Netlify

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Use [netlify.toml](/E:/nafsapp/netlify.toml:1)

Update the API redirect target in `netlify.toml` before deploy.

### Vercel

- Deploy `frontend/` as the project root
- Build command: `npm run build`
- Output directory: `dist`
- Use [vercel.json](/E:/nafsapp/vercel.json:1) for SPA rewrites

## Custom Domain

1. Point your frontend domain to Netlify/Vercel/static host.
2. Point your API domain or subdomain to Render/Railway/VPS backend.
3. Update:
   - `FRONTEND_URL`
   - `CORS_ORIGINS`
   - `VITE_API_BASE_URL`
4. Enable HTTPS certificates on both frontend and backend domains.

Suggested split:

- Frontend: `www.yourdomain.com`
- Backend API: `api.yourdomain.com`

## Security Notes

- Admin and student login routes are rate-limited.
- JWT secret is required in production.
- HTTPS redirect support is ready via `FORCE_HTTPS=true`.
- CORS is locked to configured origins instead of all origins.
- Express security headers are enabled in production.

## Build and Release

### Frontend

```bash
cd frontend
npm install
npm run build
```

### Backend

```bash
cd backend
npm install
npm start
```

## Final Checklist

- Atlas URI added
- JWT secret added
- Admin credentials changed from defaults
- Frontend API URL points to production backend
- Backend CORS includes production frontend domain
- HTTPS enabled
- File upload storage path backed up or moved to cloud object storage if needed
