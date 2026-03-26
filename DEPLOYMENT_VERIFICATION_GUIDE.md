# AURVA Deployment Verification Guide

## Changes Made

### 1. Backend Configuration
- Updated `backend/.env.production` with Supabase PostgreSQL credentials
- Configured to use Supabase database: `supabase-db-a048ksg80wksowg4s0skogcw`
- Port: 3000 (production)

### 2. Admin Panel Configuration
- Updated `admin-panel/Dockerfile` to accept build arguments for environment variables
- Created `admin-panel/.env.production` (ignored by git)
- Added proper `.gitignore` entries

### 3. Docker Compose Configuration
- Updated `docker-compose.yml` to pass build args to admin-panel:
  - `VITE_API_URL`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 4. Git Repository
- Committed all changes to master branch
- Pushed to GitHub: https://github.com/emirkhayam/aurva.git
- Latest commit: `fae8efa` - "Configure Supabase PostgreSQL integration for production"

## Verification Steps on Coolify

### Step 1: Check Deployment Status
1. Go to Coolify dashboard: https://coolify.aurva.kg/
2. Navigate to: Project → Environment → Application (jwks4w8sscs4c8ckkccsok04)
3. Check deployment logs for any errors
4. Verify that auto-deploy from GitHub is triggered

### Step 2: Verify Environment Variables
Check that these variables are set in Coolify:

**Required for both services:**
- `BACKEND_URL=http://backend:3000`
- `SUPABASE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg`
- `SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`
- `SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

**Backend specific:**
- `NODE_ENV=production`
- `PORT=3000`
- `POSTGRES_HOST=supabase-db-a048ksg80wksowg4s0skogcw`
- `POSTGRES_PORT=5432`
- `POSTGRES_DB=postgres`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=q5rat5j7VaOE0qE8Qx9ZXklFzSeXYVY6`
- `POSTGRES_SSL=false`
- `JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y`
- `JWT_EXPIRES_IN=7d`
- `AUTH_JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y`
- `GOTRUE_SITE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg`
- `MINIO_ROOT_USER=mQtzVOY7iA1RpPmA`
- `MINIO_ROOT_PASSWORD=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL`
- `AWS_ACCESS_KEY_ID=mQtzVOY7iA1RpPmA`
- `AWS_SECRET_ACCESS_KEY=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_SECURE=false`
- `EMAIL_USER=aurva.kg@gmail.com`
- `EMAIL_PASSWORD=your_email_password_here`
- `EMAIL_FROM=aurva.kg@gmail.com`
- `ADMIN_EMAIL=admin@aurva.kg`
- `ADMIN_PASSWORD=admin123`
- `CORS_ORIGIN=*`

### Step 3: Check Docker Networks
Verify that services are connected to required networks:
- `coolify` (external)
- `supabase` (external, network: a048ksg80wksowg4s0skogcw)
- `internal` (bridge)

### Step 4: Manual Deployment Trigger (if needed)
If auto-deploy didn't trigger:
1. In Coolify, go to the application settings
2. Click "Deploy" or "Redeploy" button
3. Monitor the deployment logs

### Step 5: Check Service Health

**Backend health check:**
```bash
curl http://backend:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Check logs:**
```bash
docker logs <backend-container-id>
docker logs <admin-panel-container-id>
```

### Step 6: Verify Database Connection
Backend logs should show:
```
✅ Database connection established successfully.
✅ Database models synchronized.
```

If you see errors related to database connection, check:
1. Supabase service is running
2. Network `a048ksg80wksowg4s0skogcw` exists and is properly configured
3. Backend is connected to the `supabase` network

## Common Issues and Solutions

### Issue 1: Site returns 404
**Possible causes:**
- Deployment hasn't completed
- Traefik routing issue
- Services not started

**Solution:**
1. Check if containers are running: `docker ps | grep aurva`
2. Check Traefik labels in docker-compose.yml
3. Verify domain routing in Coolify

### Issue 2: Database connection fails
**Error:** `ENOTFOUND supabase-db-a048ksg80wksowg4s0skogcw`

**Solution:**
1. Verify backend is connected to network `a048ksg80wksowg4s0skogcw`
2. Check if Supabase service is running: `docker ps | grep supabase`
3. Ensure network exists: `docker network ls | grep a048ksg80wksowg4s0skogcw`

### Issue 3: Admin panel shows blank page
**Possible causes:**
- Environment variables not passed during build
- API URL misconfigured

**Solution:**
1. Check build logs for admin-panel
2. Verify build args are passed correctly
3. Rebuild with: `docker-compose build --no-cache admin-panel`

## SSH Commands for Debugging

If you have SSH access to the server:

```bash
# Connect to server
ssh user@aurva-server

# Check running containers
docker ps

# Check container logs
docker logs <container-name>

# Check networks
docker network ls
docker network inspect a048ksg80wksowg4s0skogcw

# Restart services
cd /path/to/project
docker-compose down
docker-compose up -d

# Force rebuild
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

## Testing Production Site

Once deployment is successful, test:

1. **Main site:** https://aurva.kg/
2. **Admin panel:** https://aurva.kg/admin/
3. **Backend API:**
   - Health: Should be accessible internally
   - Auth: https://aurva.kg/api/auth
   - News: https://aurva.kg/api/news

## Expected Result

- Main site loads correctly
- Admin panel is accessible at `/admin/`
- Backend API responds to requests
- Database operations work correctly
- All assets load properly

## Next Steps After Verification

1. Test admin login with credentials:
   - Email: admin@aurva.kg
   - Password: admin123

2. Verify all functionality:
   - News management
   - Member management
   - Contact form
   - File uploads

3. Take screenshot of working site as proof

## Support

If issues persist after following this guide:
1. Check Coolify deployment logs
2. Check Docker container logs
3. Verify all environment variables are set correctly
4. Ensure network connectivity between services
