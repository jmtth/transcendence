import requests
import subprocess
import tempfile
import os
import urllib3

urllib3.disable_warnings()

BASE = "https://localhost:4430"
REGISTER = f"{BASE}/api/auth/register"
LOGIN = f"{BASE}/api/auth/login"

users = ["user1", "user2", "user3", "user4"]

sessions = []

print("\n=== REGISTER / LOGIN ===\n")

for username in users:

    register_data = {
        "username": username,
        "email": f"{username}@test.local",
        "password": "User123!"
    }

    r = requests.post(REGISTER, json=register_data, verify=False)

    print(f"\nREGISTER {username}")
    print("status:", r.status_code)

    r = requests.post(LOGIN, json={
        "username": username,
        "password": "User123!"
    }, verify=False)

    print(f"\nLOGIN {username}")
    print("status:", r.status_code)

    token = r.cookies.get("token")

    if not token:
        print("TOKEN NOT FOUND")
        continue

    print("JWT:", token[:40], "...")

    sessions.append((username, token))


print("\n=== OPENING BROWSERS ===\n")

chrome = "google-chrome"

for username, token in sessions:

    profile = tempfile.mkdtemp(prefix=f"profile_{username}_")

    inject_js = f"""
    <html>
    <body>
    <script>

    localStorage.setItem("hasSeenAnim", "true");

    document.cookie = "token={token}; path=/; domain=localhost";

    setTimeout(() => {{
        window.location.href = "{BASE}";
    }}, 500);

    </script>
    </body>
    </html>
    """

    page = os.path.join(profile, "inject.html")

    with open(page, "w") as f:
        f.write(inject_js)

    subprocess.Popen([
        chrome,
        f"--user-data-dir={profile}",
        "--no-first-run",
        "--no-default-browser-check",
        "--ignore-certificate-errors",
        "--new-window",
        BASE
    ])

    print(f"{username} browser started")