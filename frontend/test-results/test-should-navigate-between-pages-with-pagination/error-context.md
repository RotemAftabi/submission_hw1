# Test info

- Name: should navigate between pages with pagination
- Location: C:\Users\Study\Desktop\semester F\תכנות קצה\submission_hw3\frontend\playwright-tests\test.spec.ts:92:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveCount(expected)

Locator: locator('.note')
Expected: 5
Received: 10
Call log:
  - expect.toHaveCount with timeout 5000ms
  - waiting for locator('.note')
    5 × locator resolved to 0 elements
      - unexpected value "0"
    4 × locator resolved to 10 elements
      - unexpected value "10"

    at C:\Users\Study\Desktop\semester F\תכנות קצה\submission_hw3\frontend\playwright-tests\test.spec.ts:116:39
```

# Page snapshot

```yaml
- heading "Notes" [level=1]
- button "Logout"
- button "Add New Note"
- heading "Note 11" [level=2]
- text: By Test User
- paragraph: Some content
- button "Edit"
- button "Delete"
- heading "Note 10" [level=2]
- text: By Test User
- paragraph: Some content
- button "Edit"
- button "Delete"
- heading "Note 9" [level=2]
- text: By Test User
- paragraph: Some content
- button "Edit"
- button "Delete"
- heading "Note 8" [level=2]
- text: By Test User
- paragraph: Some content
- button "Edit"
- button "Delete"
- heading "Note 7" [level=2]
- text: By Test User
- paragraph: Some content
- button "Edit"
- button "Delete"
- heading "Note 6" [level=2]
- text: By Test User
- paragraph: Some content
- button "Edit"
- button "Delete"
- heading "Note 5" [level=2]
- text: By Test User
- paragraph: Some content
- button "Edit"
- button "Delete"
- heading "Note 4" [level=2]
- text: By Test User
- paragraph: Some content
- button "Edit"
- button "Delete"
- heading "Note 3" [level=2]
- text: By Test User
- paragraph: Some content
- button "Edit"
- button "Delete"
- heading "Note 2" [level=2]
- text: By Test User
- paragraph: Some content
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
   29 |   await page.addInitScript(
   30 |     (userData) => {
   31 |       window.localStorage.setItem("user-token", JSON.stringify(userData));
   32 |     },
   33 |     {
   34 |       token,
   35 |       name: "Test User",
   36 |       email: "test@example.com",
   37 |       username: "testuser",
   38 |     }
   39 |   );
   40 |
   41 |   await page.request.post(`${API_URL}/notes`, {
   42 |     data: {
   43 |       title: "Test Note",
   44 |       content: "Initial content",
   45 |       author: { name: "Test User", email: "test@example.com" },
   46 |     },
   47 |     headers: { Authorization: `Bearer ${token}` },
   48 |   });
   49 |
   50 |   await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 10000 });
   51 | });
   52 |
   53 | test("should display a list of notes", async ({ page }) => {
   54 |   const notes = page.locator(".note");
   55 |   await expect(notes).toHaveCount(1);
   56 | });
   57 |
   58 | test("should add a new note", async ({ page }) => {
   59 |   await page.click('button[name="add_new_note"]');
   60 |   await page.fill('input[name="text_input_new_note"]', "Playwright test note");
   61 |   await page.click('button[name="text_input_save_new_note"]');
   62 |   await expect(page.locator(".notification")).toHaveText("Added a new note");
   63 |   await expect(page.locator(".note").first()).toContainText(
   64 |     "Playwright test note"
   65 |   );
   66 | });
   67 |
   68 | test("should edit a note", async ({ page }) => {
   69 |   const firstNote = page.locator(".note").first();
   70 |   const noteId = await firstNote.getAttribute("data-testid");
   71 |   await page.click(`button[data-testid="edit-${noteId}"]`);
   72 |   await page.fill(
   73 |     `textarea[data-testid="text_input-${noteId}"]`,
   74 |     "Updated content"
   75 |   );
   76 |   await page.click(`button[data-testid="text_input_save-${noteId}"]`);
   77 |   await expect(page.locator(".notification")).toHaveText("Note updated");
   78 |   await expect(page.locator(`.note[data-testid="${noteId}"]`)).toContainText(
   79 |     "Updated content"
   80 |   );
   81 | });
   82 |
   83 | test("should delete a note", async ({ page }) => {
   84 |   const notes = page.locator(".note");
   85 |   await expect(notes).toHaveCount(1);
   86 |   const noteId = await notes.first().getAttribute("data-testid");
   87 |   await page.click(`button[name="delete-${noteId}"]`);
   88 |   await expect(page.locator(".notification")).toHaveText("Note deleted");
   89 |   await expect(page.locator(".note")).toHaveCount(0);
   90 | });
   91 |
   92 | test("should navigate between pages with pagination", async ({ page }) => {
   93 |   // נתחבר מחדש לקבלת טוקן עבור יצירת פתקים
   94 |   const loginResponse = await page.request.post(`${API_URL}/login`, {
   95 |     data: {
   96 |       username: "testuser",
   97 |       password: "testpass",
   98 |     },
   99 |   });
  100 |   const loginData = await loginResponse.json();
  101 |   const token = loginData.token;
  102 |
  103 |   for (let i = 0; i < 11; i++) {
  104 |     await page.request.post(`${API_URL}/notes`, {
  105 |       data: {
  106 |         title: `Note ${i + 1}`,
  107 |         content: "Some content",
  108 |         author: { name: "Test User", email: "test@example.com" },
  109 |       },
  110 |       headers: { Authorization: `Bearer ${token}` },
  111 |     });
  112 |   }
  113 |
  114 |   await page.goto(BASE_URL);
  115 |
> 116 |   await expect(page.locator(".note")).toHaveCount(5);
      |                                       ^ Error: Timed out 5000ms waiting for expect(locator).toHaveCount(expected)
  117 |   await page.click('button[name="next"]');
  118 |   await expect(page.locator(".note")).toHaveCount(5);
  119 |   await page.click('button[name="next"]');
  120 |   await expect(page.locator(".note")).toHaveCount(2);
  121 | });
  122 |
```