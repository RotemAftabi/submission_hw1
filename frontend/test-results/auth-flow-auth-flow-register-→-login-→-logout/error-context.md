# Test info

- Name: auth flow: register → login → logout
- Location: C:\Users\Study\Desktop\semester F\תכנות קצה\submission_hw3\frontend\playwright-tests\auth-flow.spec.ts:6:1

# Error details

```
Error: page.waitForURL: Test timeout of 3000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://localhost:3000/" until "load"
============================================================
    at C:\Users\Study\Desktop\semester F\תכנות קצה\submission_hw3\frontend\playwright-tests\auth-flow.spec.ts:33:14
```

# Page snapshot

```yaml
- textbox "Username": frontend123
- textbox "Password": securepass
- button "Login"
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | const BASE_URL = "http://localhost:3000";
   4 | const API_URL = "http://localhost:3001";
   5 |
   6 | test("auth flow: register → login → logout", async ({ page }) => {
   7 |   const user = {
   8 |     name: "Frontend Tester",
   9 |     email: "tester@example.com",
  10 |     username: "frontend123",
  11 |     password: "securepass",
  12 |   };
  13 |
  14 |   await page.request.delete(`${API_URL}/test/reset`);
  15 |
  16 |   await page.goto(`${BASE_URL}/create-user`);
  17 |
  18 |   await page.getByTestId("create_user_form_name").fill(user.name);
  19 |   await page.getByTestId("create_user_form_email").fill(user.email);
  20 |   await page.getByTestId("create_user_form_username").fill(user.username);
  21 |   await page.getByTestId("create_user_form_password").fill(user.password);
  22 |   await page.getByTestId("create_user_form_create_user").click();
  23 |
  24 |   await expect(page).toHaveURL(`${BASE_URL}/`);
  25 |   await expect(page.getByTestId("go_to_login_button")).toBeVisible();
  26 |
  27 |   await page.getByTestId("go_to_login_button").click();
  28 |   await expect(page).toHaveURL(`${BASE_URL}/login`);
  29 |
  30 |   await page.getByTestId("login_form_username").fill(user.username);
  31 |   await page.getByTestId("login_form_password").fill(user.password);
  32 |   await page.getByTestId("login_form_login").click();
> 33 |   await page.waitForURL(`${BASE_URL}/`);
     |              ^ Error: page.waitForURL: Test timeout of 3000ms exceeded.
  34 |   await expect(page.getByTestId("logout")).toBeVisible();
  35 |
  36 |   await page.getByTestId("logout").click();
  37 |   await expect(page).toHaveURL(`${BASE_URL}/`);
  38 |   await expect(page.getByTestId("go_to_login_button")).toBeVisible();
  39 | });
  40 |
```