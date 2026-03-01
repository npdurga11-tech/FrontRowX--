import requests
import json
import os

try:
    res = requests.post('https://api.nodemailer.com/user', json={'requestor': 'frontrowx', 'version': '1.0'})
    data = res.json()
    with open('/app/ethereal_creds.txt', 'w') as f:
        f.write(f"SMTP_USER={data['user']}\nSMTP_PASSWORD={data['pass']}")
    print("generated")
except Exception as e:
    print(e)
