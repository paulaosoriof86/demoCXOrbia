"""Managed Resend email helper."""
import os
import logging
import httpx

logger = logging.getLogger(__name__)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "TyA Consultores")


async def send_email(
    to_email: str,
    subject: str,
    html: str,
    reply_to: str | None = None,
) -> dict:
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY missing; email skipped")
        return {"status": "skipped"}

    payload = {
        "to": [to_email],
        "subject": subject,
        "html": html,
        "from_name": EMAIL_FROM_NAME,
    }
    if reply_to:
        payload["contact_email"] = reply_to

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return {"status": "sent", "id": resp.json().get("id")}
    except Exception as e:
        logger.error(f"Email failed: {e}")
        return {"status": "failed", "error": str(e)}


def welcome_html(name: str, email: str, password: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#F1F5F9;padding:32px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E2E8F0;">
          <tr><td style="padding:32px;">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#475569;font-weight:600;">TyA Consultores</div>
            <h1 style="font-size:24px;color:#0F172A;margin:16px 0 8px 0;">Bienvenido, {name}</h1>
            <p style="color:#475569;line-height:1.6;">Se creó tu cuenta en la Plataforma TyA. Ingresá con las siguientes credenciales:</p>
            <table cellpadding="8" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;margin:16px 0;width:100%;">
              <tr><td style="color:#475569;">Email</td><td style="color:#0F172A;font-family:monospace;">{email}</td></tr>
              <tr><td style="color:#475569;">Contraseña</td><td style="color:#0F172A;font-family:monospace;">{password}</td></tr>
            </table>
            <p style="color:#475569;font-size:13px;">Por favor cambiá tu contraseña en el primer ingreso.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    """
