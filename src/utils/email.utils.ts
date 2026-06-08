import sgMail from "@sendgrid/mail";
import { Client } from "../entities";

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;

if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildClientField(label: string, value: string) {
  return `
    <li style="list-style:none;background:#f8fafc;border:1px solid #e5eaf2;border-radius:14px;padding:14px 16px;box-sizing:border-box;">
      <div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">${label}</div>
      <div style="font-size:15px;line-height:1.45;color:#111827;font-weight:600;word-break:break-word;">${value}</div>
    </li>`;
}

function buildClientList(client: Client) {
  const documentType = escapeHtml(client.documentType);
  const documentNumber = escapeHtml(client.documentNumber);
  const email = escapeHtml(client.email);
  const phone = escapeHtml(client.phone);
  const city = escapeHtml(client.city);
  const address = escapeHtml(client.address);
  const birthDate = escapeHtml(client.birthDate);
  const status = escapeHtml(client.status);

  return `
    <ul style="display:block;margin:0;padding:0;">
      ${buildClientField("Documento", `${documentType} - ${documentNumber}`)}
      ${buildClientField("Email", email)}
      ${buildClientField("Teléfono", phone)}
      ${buildClientField("Ciudad", city)}
      ${buildClientField("Dirección", address)}
      ${buildClientField("Fecha de nacimiento", birthDate)}
      ${buildClientField("Estado", status)}
    </ul>`;
}

function buildClientCardHtml(client: Client, subtitle?: string) {
  const fullName = escapeHtml(client.fullName);
  const status = escapeHtml(client.status);
  const subtitleText = escapeHtml(subtitle || "Información del cliente");

  return `
  <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;box-shadow:0 6px 18px rgba(15,23,42,0.08);">
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#fff;padding:24px 24px 20px;">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin-bottom:8px;">${subtitleText}</div>
      <h2 style="margin:0;font-size:22px;line-height:1.2;">${fullName}</h2>
      <p style="margin:10px 0 0;font-size:14px;line-height:1.5;opacity:.9;">Estado actual: <strong>${status}</strong></p>
    </div>
    <div style="padding:24px;background:#f8fafc;color:#111827;">
      ${buildClientList(client)}
    </div>
  </div>`;
}

function buildStatusChangeHtml(client: Client, previousStatus: string): string {
  const fullName = escapeHtml(client.fullName);
  const id = escapeHtml(client.id);
  const currentStatus = escapeHtml(client.status);
  const previous = escapeHtml(previousStatus);

  return `
  <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.08);">
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);color:#fff;padding:24px;">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin-bottom:8px;">Actualización de estado</div>
      <h2 style="margin:0;font-size:22px;line-height:1.2;">${fullName}</h2>
      <p style="margin:10px 0 0;font-size:14px;line-height:1.5;opacity:.9;">ID ${id}</p>
    </div>
    <div style="padding:24px;background:#f8fafc;color:#111827;">
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:18px 20px;">
        <div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#1d4ed8;font-weight:700;margin-bottom:10px;">Cambio detectado</div>
        <div style="font-size:16px;line-height:1.6;color:#0f172a;">
          <div style="margin-bottom:10px;">Estado anterior: <strong>${previous}</strong></div>
          <div>Estado actual: <strong>${currentStatus}</strong></div>
        </div>
      </div>
    </div>
  </div>`;
}

export class EmailService {
  private ensureConfig() {
    if (!sendgridApiKey || !sendgridFromEmail) {
      throw new Error("Configura SENDGRID_API_KEY y SENDGRID_FROM_EMAIL.");
    }
  }

  async send(message: EmailMessage): Promise<void> {
    this.ensureConfig();
    try {
      await sgMail.send({
        to: message.to,
        from: sendgridFromEmail!,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (err: any) {
      const status =
        err?.code || err?.response?.status || err?.response?.statusCode;
      const body =
        err?.response?.body || err?.response?.data || err?.message || err;
      console.error("SendGrid send error - status:", status);
      console.error("SendGrid send error - body:", JSON.stringify(body));
      throw err;
    }
  }

  async sendClientCreated(client: Client): Promise<void> {
    const subject = `Nuevo cliente creado: ${client.fullName}`;
    const text = `Se ha creado el cliente ${client.fullName} (ID: ${client.id}). Estado: ${client.status}`;
    const html = buildClientCardHtml(client, "Nuevo cliente creado");
    await this.send({ to: client.email, subject, text, html });
  }

  async sendClientDeleted(client: Client): Promise<void> {
    const subject = `Cliente eliminado: ${client.fullName}`;
    const text = `El cliente ${client.fullName} (ID: ${client.id}) ha sido eliminado.`;
    const html = buildClientCardHtml(client, "Cliente eliminado");
    await this.send({ to: client.email, subject, text, html });
  }

  async sendClientStatusChanged(
    client: Client,
    previousStatus: string,
  ): Promise<void> {
    const subject = `Estado del cliente actualizado: ${client.fullName}`;
    const text = `El estado del cliente ${client.fullName} (ID: ${client.id}) cambió de ${previousStatus} a ${client.status}.`;
    const html = buildStatusChangeHtml(client, previousStatus);
    await this.send({ to: client.email, subject, text, html });
  }
}
