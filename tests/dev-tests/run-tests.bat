@echo off
REM Development Test Runner for Windows
REM Quick commands for running dev tests

echo 🧪 Development Test Runner
echo ==========================
echo.

if "%1"=="" goto usage

if "%1"=="pickup-debug" (
    echo Running: pickup-scheduling-debug.spec.ts
    npx playwright test "tests/dev-tests/pickup-debugging/pickup-scheduling-debug.spec.ts" --reporter=line
    goto end
)

if "%1"=="pickup-simple" (
    echo Running: pickup-simplified-test.spec.ts
    npx playwright test "tests/dev-tests/pickup-debugging/pickup-simplified-test.spec.ts" --reporter=line
    goto end
)

if "%1"=="pickup-e2e" (
    echo Running: e2e-pickup-review.spec.ts
    npx playwright test "tests/dev-tests/pickup-debugging/e2e-pickup-review.spec.ts" --reporter=line
    goto end
)

if "%1"=="pickup-final" (
    echo Running: final-pickup-validation.spec.ts
    npx playwright test "tests/dev-tests/pickup-debugging/final-pickup-validation.spec.ts" --reporter=line
    goto end
)

if "%1"=="pickup-all" (
    echo Running all pickup debugging tests...
    npx playwright test "tests/dev-tests/pickup-debugging/" --reporter=line
    goto end
)

if "%1"=="review" (
    echo Running: review-page-test.spec.ts
    npx playwright test "tests/dev-tests/pickup-debugging/review-page-test.spec.ts" --reporter=line
    goto end
)

if "%1"=="headed" (
    if "%2"=="" (
        echo Usage: %0 headed ^<test-name^>
        echo Example: %0 headed pickup-final
        goto end
    )
    if "%2"=="pickup-final" (
        echo Running ^(headed^): final-pickup-validation.spec.ts
        npx playwright test "tests/dev-tests/pickup-debugging/final-pickup-validation.spec.ts" --headed
        goto end
    )
    if "%2"=="pickup-simple" (
        echo Running ^(headed^): pickup-simplified-test.spec.ts
        npx playwright test "tests/dev-tests/pickup-debugging/pickup-simplified-test.spec.ts" --headed
        goto end
    )
    echo Unknown headed test: %2
    goto end
)

:usage
echo Available commands:
echo   pickup-debug   - Run main pickup debugging test
echo   pickup-simple  - Run simplified pickup test
echo   pickup-e2e     - Run end-to-end pickup to review test
echo   pickup-final   - Run comprehensive pickup validation
echo   pickup-all     - Run all pickup debugging tests
echo   review         - Run review page test
echo   headed ^<test^>  - Run test in headed mode
echo.
echo Examples:
echo   %0 pickup-final
echo   %0 pickup-all
echo   %0 headed pickup-simple

:end
