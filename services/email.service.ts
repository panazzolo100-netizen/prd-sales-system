type EmailMessage = {
  to: string;
  subject: string;
  html: string;
};

export type EmailSendResult =
  | { sent: true }
  | { sent: false; reason: "not-configured" };

export async function sendEmail(
  message: EmailMessage
): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return { sent: false, reason: "not-configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `O provedor de e-mail respondeu com HTTP ${response.status}: ${details}`
    );
  }

  return { sent: true };
}
