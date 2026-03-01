import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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
    
    msg = MIMEMultipart()
    msg['From'] = f"FrontRowX <{user}>"
    msg['To'] = user
    msg['Subject'] = 'Test Email from Celery debugging'
    msg.attach(MIMEText('This is a test to verify sendmail works.', 'plain'))
    
    server.sendmail(user, user, msg.as_string())
    print("Sendmail successful!")
    server.quit()
except Exception as e:
    print(f"Test failed: {e}")
