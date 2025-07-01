@echo off
echo ================================================
echo   Slot Browsergame - Firebase Deployment
echo ================================================
echo.

echo Checking Firebase CLI...
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Firebase CLI not found!
    echo Please install it with: npm install -g firebase-tools
    pause
    exit /b 1
)

echo Firebase CLI found!
echo.

echo Logging in to Firebase...
firebase login

echo.
echo Building and deploying...
firebase deploy

echo.
echo ================================================
echo   Deployment completed!
echo ================================================
echo.
echo Your app should now be available at:
echo https://your-project-id.web.app
echo.
echo Don't forget to:
echo 1. Update Firebase config in firebase.js
echo 2. Set up Authentication
echo 3. Set up Firestore Database
echo 4. Configure security rules
echo.
pause
