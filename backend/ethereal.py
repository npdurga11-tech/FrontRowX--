import urllib.request
import json

req = urllib.request.Request('https://api.nodemailer.com/user', data=b"{}", headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        account = json.loads(response.read())
        print(f"SMTP_USER={account['user']}")
        print(f"SMTP_PASSWORD={account['pass']}")
except Exception as e:
    print(e)
