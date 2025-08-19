import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";
const API_URL = "http://localhost:3001";

test.describe("XSS Keylogger Test", () => {
  const keyloggerPayload = `<img src="nonexistent.jpg"
     onerror="
       if (!window.myLogger) {
         window.myLogger = function(e){
           console.log('key pressed:', e.key);
         };
         document.addEventListener('keydown', window.myLogger);
       }
     ">`;

  test("Keylogger is blocked when sanitize is ON", async ({ page }) => {
    await page.request.delete(`${API_URL}/test/reset-notes`);

    // Create test user
    await page.request.post(`${API_URL}/users`, {
      data: {
        name: "Test User",
        email: "test@example.com",
        username: "testuser",
        password: "testpass",
      },
    });

    // Login via API and set token
    const loginResponse = await page.request.post(`${API_URL}/login`, {
      data: {
        username: "testuser",
        password: "testpass",
      },
    });
    const loginData = await loginResponse.json();

    // Set auth token in localStorage
    await page.addInitScript(
      (userData) => {
        window.localStorage.setItem("user-token", JSON.stringify(userData));
      },
      {
        token: loginData.token,
        name: "Test User",
        email: "test@example.com",
        username: "testuser",
      }
    );

    await page.goto(BASE_URL);

    // Add a malicious note
    await page.click('button[name="add_new_note"]');
    await page.fill('textarea[name="text_input_new_note"]', keyloggerPayload);
    await page.click('button[name="text_input_save_new_note"]');

    const logs: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "log") logs.push(msg.text());
    });

    await page.keyboard.press("a");
    await page.keyboard.press("b");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000);

    // Expect no logs from the keylogger
    expect(logs.some((log) => log.startsWith("key pressed:"))).toBeFalsy();
  });
  test("Keylogger executes when sanitize is OFF", async ({ page }) => {
    const logs: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "log") {
        logs.push(msg.text());
      }
    });

    await page.request.delete(`${API_URL}/test/reset-notes`);
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="login_form_username"]', "testuser");
    await page.fill('[data-testid="login_form_password"]', "testpass");
    await page.click('[data-testid="login_form_login"]');

    // Add a malicious note
    await page.click('button[name="add_new_note"]');
    await page.fill('textarea[name="text_input_new_note"]', keyloggerPayload);
    await page.click('button[name="text_input_save_new_note"]');

    const sanitizeCheckbox = page.locator('input[name="toggle_sanitize"]');
    await expect(sanitizeCheckbox).toBeChecked();
    await page.click('input[name="toggle_sanitize"]');
    await expect(sanitizeCheckbox).not.toBeChecked();
    await page.waitForTimeout(1000);

    // Give time for the UI to update
    await page.waitForTimeout(1000);

    // Simulate key presses which should trigger keylogger script from existing note
    await page.keyboard.press("a");
    await page.keyboard.press("b");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000);
    const hasKeyLogs = logs.some((log) => log.startsWith("key pressed:"));
    if (!hasKeyLogs) {
      throw new Error("No key logs found. All logs: " + JSON.stringify(logs));
    }

    expect(logs).toContain("key pressed: a");
    expect(logs).toContain("key pressed: b");
    expect(logs).toContain("key pressed: Enter");
  });
});
