import smtplib

host = 'smtp.gmail.com'
port = 587
user = 'npdurga11@gmail.com'
pwd = 'dzrdlcplafbiahhw'

try:
    print(f"Connecting to {host}:{port} with user {user}")
    server = smtplib.SMTP(host, port)
    server.starttls()
    server.login(user, pwd)
    print("Login successful!")
    server.quit()
except Exception as e:
    print(f"Login failed: {e}")
