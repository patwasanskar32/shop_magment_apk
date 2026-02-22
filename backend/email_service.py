"""
Email service for ShopERP
Uses Gmail SMTP to send verification and password reset emails.

Required environment variables:
  SMTP_EMAIL    - your Gmail address e.g. yourshop@gmail.com
  SMTP_PASSWORD - Gmail App Password (not your regular password)
                  Get it from: myaccount.google.com → Security → App passwords
  FRONTEND_URL  - your Vercel URL e.g. https://shop-magment-apk.vercel.app
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL    = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FRONTEND_URL  = os.getenv("FRONTEND_URL", "https://shop-magment-apk.vercel.app")

def _send(to_email: str, subject: str, html_body: str) -> bool:
    """Internal: send a single email. Returns True on success."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("⚠️ Email not configured (SMTP_EMAIL / SMTP_PASSWORD missing). Skipping email.")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"ShopERP <{SMTP_EMAIL}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        print(f"✅ Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"❌ Email send failed to {to_email}: {e}")
        return False

# ─── Email Templates ───────────────────────────────────────────────────────

def send_verification_email(to_email: str, username: str, token: str) -> bool:
    url = f"{FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:2rem;background:#0f0f1a;color:white;border-radius:16px;">
      <h2 style="background:linear-gradient(135deg,#667eea,#f093fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 0.5rem">🏢 ShopERP</h2>
      <h3 style="margin:0 0 1.5rem;color:rgba(255,255,255,0.85)">Verify your email address</h3>
      <p style="color:rgba(255,255,255,0.6);line-height:1.7">Hi <strong style="color:white">{username}</strong>, thanks for registering! Please verify your email address to activate your account.</p>
      <a href="{url}" style="display:inline-block;margin:1.5rem 0;padding:0.85rem 2rem;background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:1rem;">
        ✅ Verify Email Address
      </a>
      <p style="color:rgba(255,255,255,0.35);font-size:0.8rem">This link expires in 24 hours. If you didn't register, ignore this email.</p>
    </div>
    """
    return _send(to_email, "Verify your ShopERP email", html)


def send_password_reset_email(to_email: str, username: str, token: str) -> bool:
    url = f"{FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:2rem;background:#0f0f1a;color:white;border-radius:16px;">
      <h2 style="background:linear-gradient(135deg,#667eea,#f093fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 0.5rem">🏢 ShopERP</h2>
      <h3 style="margin:0 0 1.5rem;color:rgba(255,255,255,0.85)">Reset your password</h3>
      <p style="color:rgba(255,255,255,0.6);line-height:1.7">Hi <strong style="color:white">{username}</strong>, we received a request to reset your password.</p>
      <a href="{url}" style="display:inline-block;margin:1.5rem 0;padding:0.85rem 2rem;background:linear-gradient(135deg,#f5576c,#f093fb);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:1rem;">
        🔑 Reset My Password
      </a>
      <p style="color:rgba(255,255,255,0.35);font-size:0.8rem">This link expires in 1 hour. If you didn't request this, ignore this email — your password won't change.</p>
    </div>
    """
    return _send(to_email, "Reset your ShopERP password", html)
