"""
Email notification service.
Uses SMTP when configured, otherwise prints to the console (for development/demo).
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


def _build_booking_email(to_email: str, user_name: str, show_title: str,
                          seat_number: str, booking_id: int) -> MIMEMultipart:
    """Build a professional HTML booking confirmation email."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🎟️ Your Ticket to {show_title} is Confirmed!"
    msg["From"] = f"FrontRowX <{settings.SMTP_USER}>"
    msg["To"] = to_email

    text_body = f"Hello {user_name},\n\nYour booking is CONFIRMED!\n\nShow: {show_title}\nSeat: {seat_number}\nBooking ID: #{booking_id}\n\nThank you for choosing FrontRowX!"
    
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="max-w-xl; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎟️ FrontRowX</h1>
            <p style="color: #e0e7ff; margin-top: 10px; font-size: 16px;">Your premium pass is confirmed!</p>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151;">Hello <strong>{user_name}</strong>,</p>
            <p style="font-size: 16px; color: #374151;">You are all set for an amazing experience. Below are your official booking details.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 5px 0; color: #64748b; font-size: 14px;">EVENT</p>
                <p style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px; font-weight: bold;">{show_title}</p>
                
                <p style="margin: 5px 0; color: #64748b; font-size: 14px;">PASS ALLOCATION</p>
                <p style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px; font-weight: bold;">{seat_number}</p>
                
                <p style="margin: 5px 0; color: #64748b; font-size: 14px;">BOOKING ID</p>
                <p style="margin: 0; color: #4f46e5; font-size: 18px; font-weight: bold;">#{booking_id}</p>
            </div>
            
            <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 30px;">
              Please present this email at the venue entrance. Thank you for booking with FrontRowX!
            </p>
          </div>
        </div>
      </body>
    </html>
    """
    
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))
    return msg


def send_booking_confirmation(
    user_email: str,
    user_name: str,
    show_title: str,
    seat_number: str,
    booking_id: int
) -> None:
    """
    Send booking confirmation email to the user and admin.
    Falls back to console output if SMTP is not configured.
    """
    recipients = [user_email, settings.ADMIN_EMAIL]

    for recipient in recipients:
        msg = _build_booking_email(
            to_email=recipient,
            user_name=user_name,
            show_title=show_title,
            seat_number=seat_number,
            booking_id=booking_id
        )
        _send_email(msg, recipient)


def _send_email(msg: MIMEMultipart, recipient: str) -> None:
    """
    Attempt to send via SMTP. If not configured, print to console instead.
    Console printing simulates the email for environments without a mail server.
    """
    if not settings.SMTP_PASSWORD:
        # Console simulation — acceptable for demo/assessment
        print("\n" + "=" * 50)
        print(f"[EMAIL SIMULATION] To: {recipient}")
        print(f"Subject: {msg['Subject']}")
        print(msg.get_payload(0).get_payload())
        print("=" * 50 + "\n")
        return

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, recipient, msg.as_string())
            print(f"[Email] Sent to {recipient}")
    except Exception as e:
        # Log error but don't crash the booking flow
        print(f"[Email Error] Failed to send to {recipient}: {e}")
