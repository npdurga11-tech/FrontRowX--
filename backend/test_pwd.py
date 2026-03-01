import os

pwd = os.getenv('SMTP_PASSWORD')
print("Password inside docker is:", repr(pwd))

with open('test_pwd.txt', 'w') as f:
    f.write(repr(pwd))
