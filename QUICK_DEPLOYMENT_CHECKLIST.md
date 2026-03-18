# Quick Deployment Checklist for AURVA

## Status: Changes Pushed to GitHub ✅

**Latest Commit:** `fae8efa` - Configure Supabase PostgreSQL integration for production

## What Was Done:

1. ✅ Configured backend to use Supabase PostgreSQL
2. ✅ Updated admin-panel Dockerfile with build arguments
3. ✅ Modified docker-compose.yml for proper environment variable passing
4. ✅ Committed and pushed to GitHub

## Next Steps - YOU NEED TO DO:

### 1. Check Coolify Deployment Status
Go to: https://coolify.aurva.kg/project/awc4s8scwo8swwgw84wc8s0w/environment/o40ccc04kog0k0wsooocks84/application/jwks4w8sscs4c8ckkccsok04

Check:
- [ ] Has deployment started automatically?
- [ ] Are there any error messages in deployment logs?
- [ ] What is the current status? (Building, Running, Failed?)

### 2. If Deployment Didn't Start Automatically:
1. Click **"Deploy"** or **"Redeploy"** button in Coolify
2. Wait for build to complete (usually 5-10 minutes)
3. Monitor logs for any errors

### 3. Verify Environment Variables in Coolify:
Make sure these are set:

**Critical variables:**
```
BACKEND_URL=http://backend:3000
SUPABASE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoiYW5vbiJ9.c0IVF8EW1Fbu_BpAVhzNIOz2ILVSNH4GwXTob9sUdz8
```

### 4. Check Network Configuration:
Verify that the application is connected to these Docker networks:
- `coolify`
- `a048ksg80wksowg4s0skogcw` (Supabase network)
- `internal`

### 5. Common Issues and Quick Fixes:

**Issue: Build fails**
- Check build logs in Coolify
- Look for missing dependencies or Docker errors

**Issue: Services start but site shows 404**
- Check Traefik routing configuration
- Verify domain is pointing to correct service
- Check if containers are running: `docker ps`

**Issue: Database connection errors**
- Verify Supabase service is running
- Check network connectivity between services

### 6. Testing After Deployment:

Once deployment succeeds, test:
```bash
# Test main site
curl -I https://aurva.kg/

# Test admin panel
curl -I https://aurva.kg/admin/

# If you have SSH access, test backend internally:
curl http://backend:3000/health
```

### 7. Admin Panel Access:
After successful deployment:
- URL: https://aurva.kg/admin/
- Username: admin@aurva.kg
- Password: admin123

## Current Status Check:

As of now (2026-03-06 17:43 UTC), the site returns **404 Not Found**, which means:
- Either deployment hasn't started/completed yet
- Or there's a configuration issue in Coolify

**Action required:** Please check Coolify dashboard and follow steps above.

## Need Help?

If you encounter issues:
1. Share the deployment logs from Coolify
2. Check which step failed
3. Refer to `DEPLOYMENT_VERIFICATION_GUIDE.md` for detailed troubleshooting

## SSH Access Commands (if available):

```bash
# Connect to server
ssh your-user@your-server

# Check running containers
docker ps | grep -E "backend|admin"

# Check logs
docker logs <container-name>

# Check networks
docker network ls | grep a048ksg80wksowg4s0skogcw

# Restart if needed
cd /path/to/coolify/projects
docker-compose restart
```

## Screenshot Request:

Once the site is working at https://aurva.kg/, please take a screenshot showing:
1. The working homepage
2. The admin panel login/dashboard
3. Browser URL bar showing aurva.kg

This will confirm successful deployment!
