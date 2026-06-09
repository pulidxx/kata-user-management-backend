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
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildClientField(label: string, value: string) {
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
        <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:4px;font-weight:600;">${label}</div>
        <div style="font-size:15px;line-height:1.5;color:#111827;font-weight:500;word-break:break-word;">${value}</div>
      </td>
    </tr>`;
}

function buildClientList(client: Client) {
  const documentType = escapeHtml(client.documentType);
  const documentNumber = escapeHtml(client.documentNumber);
  const email = escapeHtml(client.email);
  const phone = escapeHtml(client.phone);
  const city = escapeHtml(client.city);
  const address = escapeHtml(client.address);

  return `
    <table style="width:100%;border-collapse:collapse;margin:0;padding:0;" cellpadding="0" cellspacing="0">
      ${buildClientField("Tipo y Número de Documento", `${documentType} - ${documentNumber}`)}
      ${buildClientField("Correo Electrónico", email)}
      ${buildClientField("Teléfono", phone)}
      ${buildClientField("Ciudad", city)}
      ${buildClientField("Dirección", address)}
    </table>`;
}

function buildEmailHeader() {
  return `
    <div style="background:#ffffff;padding:20px 28px;">
      <h2 style="margin:0;font-size:20px;color:#1e40af;font-weight:700;letter-spacing:-0.02em;">Sistema de Gestión de Clientes</h2>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b;font-weight:500;">Plataforma de Administración Empresarial</p>
    </div>`;
}

function buildEmailFooter() {
  return `
    <div style="margin-top:32px;padding-top:24px;border-top:2px solid #e5e7eb;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.6;">
        Este es un correo automático generado por el Sistema de Gestión de Clientes.
      </p>
      <p style="margin:0 0 4px;font-size:13px;color:#64748b;">
        Para soporte técnico, contacte al administrador del sistema.
      </p>
    </div>`;
}

function buildClientCardHtml(client: Client, subtitle?: string) {
  const fullName = escapeHtml(client.fullName);
  const status = escapeHtml(client.status);
  const subtitleText = escapeHtml(subtitle || "Información del cliente");

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;">
    <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f1f5f9;padding:40px 20px;" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;">
            
            ${buildEmailHeader()}
            
            <div style="background:#f8fafc;padding:24px 28px;border-bottom:1px solid #e2e8f0;">
              <div style="font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#64748b;margin-bottom:10px;font-weight:600;">${subtitleText}</div>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;color:#0f172a;">${fullName}</h1>
              <div style="margin-top:12px;background:#ffffff;border:2px solid #2563eb;padding:8px 14px;display:inline-block;border-radius:4px;">
                <span style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Estado:</span>
                <span style="font-size:13px;color:#1e40af;font-weight:700;margin-left:6px;">${status}</span>
              </div>
            </div>
            
            <div style="padding:28px;background:#ffffff;color:#0f172a;">
              <h2 style="margin:0 0 20px;font-size:15px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.05em;">Información del Cliente</h2>
              ${buildClientList(client)}
              ${buildEmailFooter()}
            </div>
            
          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

function buildStatusChangeHtml(client: Client, previousStatus: string): string {
  const fullName = escapeHtml(client.fullName);
  const currentStatus = escapeHtml(client.status);
  const previous = escapeHtml(previousStatus);

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#f1f5f9;">
    <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f1f5f9;padding:40px 20px;" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;">
            
            ${buildEmailHeader()}
            
            <div style="background:#fef3c7;padding:20px 28px;border-bottom:3px solid #f59e0b;border-top:3px solid #f59e0b;">
              <div style="font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#92400e;margin-bottom:8px;font-weight:700;">Notificación Importante</div>
              <h1 style="margin:0;font-size:18px;line-height:1.4;font-weight:700;color:#78350f;">Se ha actualizado el estado del cliente</h1>
            </div>
            
            <div style="background:#f8fafc;padding:24px 28px;border-bottom:1px solid #e2e8f0;">
              <h2 style="margin:0;font-size:20px;line-height:1.3;font-weight:700;color:#0f172a;">${fullName}</h2>
            </div>
            
            <div style="padding:28px;background:#ffffff;color:#0f172a;">
              <div style="background:#f8fafc;border:2px solid #cbd5e1;border-radius:6px;padding:24px;margin-bottom:24px;">
                <h3 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.05em;">Cambio de Estado</h3>
                <table style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:14px 18px;background:#ffffff;border:2px solid #e2e8f0;border-radius:4px;">
                      <div style="font-size:11px;color:#64748b;margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Estado Anterior</div>
                      <div style="font-size:16px;color:#475569;font-weight:700;">${previous}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 0;text-align:center;">
                      <div style="font-size:18px;color:#94a3b8;">↓</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 18px;background:#dbeafe;border:2px solid #2563eb;border-radius:4px;">
                      <div style="font-size:11px;color:#1e40af;margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;">Estado Actual</div>
                      <div style="font-size:16px;color:#1e40af;font-weight:700;">${currentStatus}</div>
                    </td>
                  </tr>
                </table>
              </div>
              ${buildEmailFooter()}
            </div>
            
          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
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
    } catch (err: unknown) {
      const error = err as Record<string, unknown>;
      const status =
        error?.code ||
        (error?.response as Record<string, unknown>)?.status ||
        (error?.response as Record<string, unknown>)?.statusCode;
      const body =
        (error?.response as Record<string, unknown>)?.body ||
        (error?.response as Record<string, unknown>)?.data ||
        error?.message ||
        error;
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("SendGrid send error - status:", status);
        // eslint-disable-next-line no-console
        console.error("SendGrid send error - body:", JSON.stringify(body));
      }
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
    previousStatus: string
  ): Promise<void> {
    const subject = `Estado del cliente actualizado: ${client.fullName}`;
    const text = `El estado del cliente ${client.fullName} (ID: ${client.id}) cambió de ${previousStatus} a ${client.status}.`;
    const html = buildStatusChangeHtml(client, previousStatus);
    await this.send({ to: client.email, subject, text, html });
  }
}
