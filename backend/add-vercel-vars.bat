@echo off
echo Adding environment variables to Vercel...
echo.

REM Basic variables
echo [1/14] Adding JWT_EXPIRES_IN...
echo 7d | npx vercel env add JWT_EXPIRES_IN production

echo [2/14] Adding CORS_ORIGIN...
echo * | npx vercel env add CORS_ORIGIN production

echo [3/14] Adding EMAIL_HOST...
echo smtp.gmail.com | npx vercel env add EMAIL_HOST production

echo [4/14] Adding EMAIL_PORT...
echo 587 | npx vercel env add EMAIL_PORT production

echo [5/14] Adding EMAIL_SECURE...
echo false | npx vercel env add EMAIL_SECURE production

echo [6/14] Adding EMAIL_USER...
echo aurva.kg@gmail.com | npx vercel env add EMAIL_USER production

echo [7/14] Adding EMAIL_FROM...
echo aurva.kg@gmail.com | npx vercel env add EMAIL_FROM production

echo [8/14] Adding ADMIN_EMAIL...
echo admin@aurva.kg | npx vercel env add ADMIN_EMAIL production

echo [9/14] Adding ADMIN_PASSWORD...
echo admin123 | npx vercel env add ADMIN_PASSWORD production

echo [10/14] Adding EMAIL_PASSWORD...
echo YOUR_GMAIL_APP_PASSWORD_HERE | npx vercel env add EMAIL_PASSWORD production

echo [11/14] Adding MAX_FILE_SIZE...
echo 5242880 | npx vercel env add MAX_FILE_SIZE production

echo [12/14] Adding UPLOAD_PATH...
echo /tmp/uploads | npx vercel env add UPLOAD_PATH production

echo.
echo Done! All variables added.
echo Now redeploying...
npx vercel --prod --yes

echo.
echo Deployment complete!
pause
