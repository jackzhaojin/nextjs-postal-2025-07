Implement the following task: 6.1

📄 First, read `ai-docs/tasks/task-6-1.md` relative to the project root for specific functional and technical requirements tied to this task.

❗ You are running outside of WSL.

* Do **not** start the Next.js dev server.
* It is already running and accessible locally at: [http://localhost:4000](http://localhost:4000)

Your job is to **write code** for this task — not to plan, explain, or describe it.  
Output code only. No thoughts or commentary.

Refer to:

* `prd.md` → for product requirements and feature goals  
* `techspec.md` → for architectural structure, APIs, and edge cases  
* `release.mdc` → for task-level scope and sequencing (phase 6, task 1)  
* `ai-docs/architect/api-design-specifications.md` → for backend request/response schemas  
* `ai-docs/architect/component-specifications.md` → for frontend UI/component patterns

All code must relate specifically to task 6.1 only.  
Do not cross into other task areas unless the specs explicitly require it.

✅ Output only the required code

🩵 Use as much logging as possible to aid debugging and observability

🚀 Highly encourage ad hoc testing with the Playwright MCP Server tool (available on all agents).  
All tests for this task should be run in **headless mode** for CI alignment. Your goal is to write and pass **5–10 tests per feature** (maximum 10) to ensure solid coverage while keeping execution time and maintenance manageable. Use:

```bash
npx playwright test tests/6.1.spec.ts --reporter=list --max-failures=5
```

After completion, check off the release.mdc task.
