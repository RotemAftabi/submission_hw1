# Test info

- Name: should add a new note
- Location: C:\Users\Study\Desktop\semester F\תכנות קצה\submission_hw3\frontend\playwright-tests\test.spec.ts:50:1

# Error details

```
Error: page.click: Test timeout of 10000ms exceeded.
Call log:
  - waiting for locator('button[name="add_new_note"]')

    at C:\Users\Study\Desktop\semester F\תכנות קצה\submission_hw3\frontend\playwright-tests\test.spec.ts:51:14
```

# Page snapshot

```yaml
- heading "Notes" [level=1]
- button "Go to Login"
- button "Create New User"
- heading "Test Note" [level=2]
- text: By Test User
- paragraph: Initial content
- button "Edit"
- button "Delete"
- text: "page: 1 / NaN"
- button "first" [disabled]
- button "previous" [disabled]
- button "1" [disabled]
- button "2"
- button "3"
- button "4"
- button "5"
- button "next"
- button "last"
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | const BASE_URL = "http://localhost:3000";
   4 | const API_URL = "http://localhost:3001";
   5 |
   6 | test.setTimeout(10000);
   7 |
   8 | test.beforeEach(async ({ page }) => {
   9 |   await page.request.delete(`${API_URL}/test/reset`);
   10 |
   11 |   await page.request.post(`${API_URL}/users`, {
   12 |     data: {
   13 |       name: "Test User",
   14 |       email: "test@example.com",
   15 |       username: "testuser",
   16 |       password: "testpass",
   17 |     },
   18 |   });
   19 |
   20 |   const loginResponse = await page.request.post(`${API_URL}/login`, {
   21 |     data: {
   22 |       username: "testuser",
   23 |       password: "testpass",
   24 |     },
   25 |   });
   26 |   const loginData = await loginResponse.json();
   27 |   const token = loginData.token;
   28 |
   29 |   await page.addInitScript((value) => {
   30 |     window.localStorage.setItem("user-token", value);
   31 |   }, token);
   32 |
   33 |   await page.request.post(`${API_URL}/notes`, {
   34 |     data: {
   35 |       title: "Test Note",
   36 |       content: "Initial content",
   37 |       author: { name: "Test User", email: "test@example.com" },
   38 |     },
   39 |     headers: { Authorization: `Bearer ${token}` },
   40 |   });
   41 |
   42 |   await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 10000 });
   43 | });
   44 |
   45 | test("should display a list of notes", async ({ page }) => {
   46 |   const notes = page.locator(".note");
   47 |   await expect(notes).toHaveCount(1);
   48 | });
   49 |
   50 | test("should add a new note", async ({ page }) => {
>  51 |   await page.click('button[name="add_new_note"]');
      |              ^ Error: page.click: Test timeout of 10000ms exceeded.
   52 |   await page.fill('input[name="text_input_new_note"]', "Playwright test note");
   53 |   await page.click('button[name="text_input_save_new_note"]');
   54 |   await expect(page.locator(".notification")).toHaveText("Added a new note");
   55 |   await expect(page.locator(".note").first()).toContainText(
   56 |     "Playwright test note"
   57 |   );
   58 | });
   59 |
   60 | test("should edit a note", async ({ page }) => {
   61 |   const firstNote = page.locator(".note").first();
   62 |   const noteId = await firstNote.getAttribute("data-testid");
   63 |   await page.click(`button[data-testid="edit-${noteId}"]`);
   64 |   await page.fill(
   65 |     `textarea[data-testid="text_input-${noteId}"]`,
   66 |     "Updated content"
   67 |   );
   68 |   await page.click(`button[data-testid="text_input_save-${noteId}"]`);
   69 |   await expect(page.locator(".notification")).toHaveText("Note updated");
   70 |   await expect(page.locator(`.note[data-testid="${noteId}"]`)).toContainText(
   71 |     "Updated content"
   72 |   );
   73 | });
   74 |
   75 | test("should delete a note", async ({ page }) => {
   76 |   const notes = page.locator(".note");
   77 |   await expect(notes).toHaveCount(1);
   78 |   const noteId = await notes.first().getAttribute("data-testid");
   79 |   await page.click(`button[name="delete-${noteId}"]`);
   80 |   await expect(page.locator(".notification")).toHaveText("Note deleted");
   81 |   await expect(page.locator(".note")).toHaveCount(0);
   82 | });
   83 |
   84 | test("should navigate between pages with pagination", async ({ page }) => {
   85 |   // נתחבר מחדש לקבלת טוקן עבור יצירת פתקים
   86 |   const loginResponse = await page.request.post(`${API_URL}/login`, {
   87 |     data: {
   88 |       username: "testuser",
   89 |       password: "testpass",
   90 |     },
   91 |   });
   92 |   const loginData = await loginResponse.json();
   93 |   const token = loginData.token;
   94 |
   95 |   for (let i = 0; i < 11; i++) {
   96 |     await page.request.post(`${API_URL}/notes`, {
   97 |       data: {
   98 |         title: `Note ${i + 1}`,
   99 |         content: "Some content",
  100 |         author: { name: "Test User", email: "test@example.com" },
  101 |       },
  102 |       headers: { Authorization: `Bearer ${token}` },
  103 |     });
  104 |   }
  105 |
  106 |   await page.goto(BASE_URL);
  107 |
  108 |   await expect(page.locator(".note")).toHaveCount(5);
  109 |   await page.click('button[name="next"]');
  110 |   await expect(page.locator(".note")).toHaveCount(5);
  111 |   await page.click('button[name="next"]');
  112 |   await expect(page.locator(".note")).toHaveCount(2);
  113 | });
  114 |
```