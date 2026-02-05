# Scripts Folder Deployment Fix

## Problem
The `scripts/` folder was not being found in the Docker container during deployment, causing errors when trying to run utility scripts like:
- `verifyEmail.js`
- `changeRole.js`
- `reset-admin-password.js`
- `reset-and-setup.js`
- `seedAdmin.js`

## Root Cause
While the Dockerfile had `COPY . .` which should copy all files, it's best practice to explicitly include critical folders to ensure they're not accidentally excluded by `.dockerignore` or overlooked during builds.

## Solution
Added explicit copy instruction in the Dockerfile (Stage 2/Production image):

```dockerfile
# Explicitly copy scripts folder (important for utility scripts)
COPY scripts/ ./scripts/
```

This is placed after the main `COPY . .` statement to ensure the scripts folder is definitely present in the final image.

## Changes Made
1. Updated `Dockerfile` at line 46 to add explicit `COPY scripts/ ./scripts/`

## Verification
Run this command to verify scripts are present in the running container:
```bash
docker-compose exec app ls -la scripts/
```

You should see all 5 script files listed.

## Using Scripts in Docker
Now you can run scripts in the Docker container using:
```bash
docker-compose exec app node scripts/verifyEmail.js admin@example.com
docker-compose exec app node scripts/changeRole.js admin@example.com admin
docker-compose exec app node scripts/seedAdmin.js
docker-compose exec app node scripts/reset-admin-password.js
docker-compose exec app node scripts/reset-and-setup.js
```

## Additional Notes
- The `.dockerignore` file does NOT exclude the `scripts/` folder, so this issue was just a missing explicit instruction
- All script files have proper dependencies and connection to MongoDB
- Scripts require proper environment variables to be set in `docker-compose.yml`
