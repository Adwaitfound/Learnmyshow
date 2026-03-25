import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "LearnMyShow <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

interface SpeakerInviteParams {
  toEmail: string;
  eventTitle: string;
  sessionTitle: string;
  organizerName: string;
}

export async function sendSpeakerInvite({
  toEmail,
  eventTitle,
  sessionTitle,
  organizerName,
}: SpeakerInviteParams) {
  if (!resend) {
    console.log(
      `[EMAIL STUB] Speaker invite to ${toEmail} for "${sessionTitle}" at "${eventTitle}" — Resend not configured (set RESEND_API_KEY)`
    );
    return { success: true, stub: true };
  }

  const registerUrl = `${APP_URL}/register?redirect=/dashboard/instructor`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `You've been added as a speaker — ${eventTitle}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px;">
        <h2 style="color: #0c4a6e; margin-bottom: 8px;">You're a Speaker! 🎤</h2>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Hi there,<br/><br/>
          <strong>${organizerName}</strong> has added you as a speaker for the session
          <strong>"${sessionTitle}"</strong> at <strong>${eventTitle}</strong>.
        </p>
        <p style="color: #374151; font-size: 15px; line-height: 1.6;">
          Register on LearnMyShow to access your session details, upload resources,
          and manage your Q&A:
        </p>
        <a href="${registerUrl}"
           style="display: inline-block; background: #0284c7; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 16px 0;">
          Register Here →
        </a>
        <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
          If you already have an account, simply
          <a href="${APP_URL}/login" style="color: #0284c7;">log in</a>
          to see your sessions.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>
        <p style="color: #9ca3af; font-size: 12px;">
          LearnMyShow — Experiential Education & Conference Platform
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[EMAIL ERROR]", error);
    return { success: false, error };
  }

  return { success: true, id: data?.id };
}
