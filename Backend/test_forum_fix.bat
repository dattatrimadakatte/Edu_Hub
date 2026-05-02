@echo off
echo ========================================
echo    EduHub Forum Fix Verification
echo ========================================
echo.

echo [1/2] Testing forum endpoints...
echo.

echo Testing forum posts endpoint...
curl -X GET "http://localhost:8000/forum/posts" -H "accept: application/json"
echo.
echo.

echo Testing health check...
curl -X GET "http://localhost:8000/health" -H "accept: application/json"
echo.
echo.

echo [2/2] Testing all features...
curl -X GET "http://localhost:8000/test-all-features" -H "accept: application/json"
echo.
echo.

echo ========================================
echo    Forum Fix Test Complete
echo ========================================
echo.
echo If you see JSON responses above without errors, the forum fix is working!
echo.
pause