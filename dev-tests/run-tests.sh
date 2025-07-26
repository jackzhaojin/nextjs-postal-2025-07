#!/bin/bash

# Development Test Runner
# Quick commands for running dev tests

echo "🧪 Development Test Runner"
echo "=========================="
echo ""

# Function to run a specific test
run_test() {
    echo "Running: $1"
    npx playwright test "$1" --project="chromium" --reporter=line
    echo ""
}

# Function to run test with heading
run_test_headed() {
    echo "Running (headed): $1"
    npx playwright test "$1" --project="chromium" --headed
    echo ""
}

case "$1" in
    "pickup-debug")
        run_test "dev-tests/pickup-debugging/pickup-scheduling-debug.spec.ts"
        ;;
    "pickup-simple")
        run_test "dev-tests/pickup-debugging/pickup-simplified-test.spec.ts"
        ;;
    "pickup-e2e")
        run_test "dev-tests/pickup-debugging/e2e-pickup-review.spec.ts"
        ;;
    "pickup-final")
        run_test "dev-tests/pickup-debugging/final-pickup-validation.spec.ts"
        ;;
    "pickup-all")
        echo "Running all pickup debugging tests..."
        run_test "dev-tests/pickup-debugging/"
        ;;
    "review")
        run_test "dev-tests/pickup-debugging/review-page-test.spec.ts"
        ;;
    "headed")
        if [ -z "$2" ]; then
            echo "Usage: $0 headed <test-name>"
            echo "Example: $0 headed pickup-final"
            exit 1
        fi
        case "$2" in
            "pickup-final")
                run_test_headed "dev-tests/pickup-debugging/final-pickup-validation.spec.ts"
                ;;
            "pickup-simple")
                run_test_headed "dev-tests/pickup-debugging/pickup-simplified-test.spec.ts"
                ;;
            *)
                echo "Unknown headed test: $2"
                ;;
        esac
        ;;
    *)
        echo "Available commands:"
        echo "  pickup-debug   - Run main pickup debugging test"
        echo "  pickup-simple  - Run simplified pickup test"
        echo "  pickup-e2e     - Run end-to-end pickup to review test"
        echo "  pickup-final   - Run comprehensive pickup validation"
        echo "  pickup-all     - Run all pickup debugging tests"
        echo "  review         - Run review page test"
        echo "  headed <test>  - Run test in headed mode"
        echo ""
        echo "Examples:"
        echo "  $0 pickup-final"
        echo "  $0 pickup-all"
        echo "  $0 headed pickup-simple"
        ;;
esac
