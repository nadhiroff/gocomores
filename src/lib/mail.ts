import nodemailer from "nodemailer";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Envoi SMTP. Retourne false (sans lever) si SMTP n'est pas configuré ou échoue. */
export async function sendContactMail(m: { name: string; email: string; subject: string; message: string }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !CONTACT_TO) return false;
  try {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: SMTP_SECURE === "true",
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
    await transport.sendMail({
      from: SMTP_FROM ?? CONTACT_TO,
      to: CONTACT_TO,
      replyTo: { name: m.name.replace(/[\r\n]/g, " "), address: m.email },
      subject: `[GoComores] ${m.subject.replace(/[\r\n]/g, " ")}`,
      text: `De : ${m.name} <${m.email}>\n\n${m.message}`,
      html: `<p><strong>De :</strong> ${esc(m.name)} &lt;${esc(m.email)}&gt;</p><p style="white-space:pre-wrap">${esc(m.message)}</p>`,
    });
    return true;
  } catch (e) {
    console.error("Échec d'envoi SMTP", e);
    return false;
  }
}
