import smtplib
from email.message import EmailMessage
from app.core.config import settings


def send_login_otp(email: str, code: str) -> None:
    subject = "Mã đăng nhập QuizBattle"
    text_body = (
        "Xin chào,\n\n"
        f"Mã đăng nhập QuizBattle của bạn là: {code}\n"
        f"Mã này hết hạn sau {settings.EMAIL_OTP_EXPIRE_MINUTES} phút.\n\n"
        "Nếu bạn không yêu cầu mã này, hãy bỏ qua email này."
    )
    html_body = f"""
    <!doctype html>
    <html>
      <body style="margin:0;background:#f6f3ff;font-family:Arial,sans-serif;color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e9ddff;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px 12px;">
                    <h1 style="margin:0;font-size:22px;color:#6d28d9;">QuizBattle</h1>
                    <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#4b5563;">Nhập mã bên dưới để đăng nhập tài khoản của bạn.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:18px 28px;">
                    <div style="display:inline-block;padding:14px 22px;border-radius:12px;background:#f3e8ff;color:#581c87;font-size:32px;font-weight:800;letter-spacing:6px;font-family:Consolas,monospace;">{code}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 26px;">
                    <p style="margin:0;font-size:14px;line-height:1.55;color:#6b7280;">Mã này hết hạn sau {settings.EMAIL_OTP_EXPIRE_MINUTES} phút. Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        print(f"[DEV EMAIL OTP] Send to {email}: {code}")
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = email
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
        if settings.SMTP_USE_TLS:
            server.starttls()
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(message)

    if settings.DEBUG:
        print(f"[EMAIL OTP] Sent login code to {email} via {settings.SMTP_HOST}:{settings.SMTP_PORT}")
