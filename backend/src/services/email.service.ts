import { config } from "../config";

const AGENTMAIL_API = "https://api.agentmail.to/v0";

interface AgentMailDraft {
  inbox_id: string;
  draft_id: string;
  send_status: string;
  send_at: string;
}

export async function scheduleReminderEmail({
  to,
  title,
  url,
  notes,
  remindAt,
}: {
  to: string;
  title: string;
  url: string;
  notes?: string | null;
  remindAt: string;
}): Promise<AgentMailDraft> {
  if (!config.agentMailApiKey) {
    throw new Error("AGENTMAIL_API_KEY is not configured");
  }

  if (!config.agentMailInbox) {
    throw new Error("AGENTMAIL_INBOX is not configured");
  }

  const response = await fetch(
    `${AGENTMAIL_API}/inboxes/${encodeURIComponent(config.agentMailInbox)}/drafts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.agentMailApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: [to],
        subject: `Time to revisit: ${title}`,
        text: [
          "Your SourceSea reminder is due.",
          "",
          title,
          url,
          notes ? `\nNotes:\n${notes}` : "",
        ].join("\n"),
        send_at: remindAt,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to schedule reminder email: ${body}`);
  }

  return response.json() as Promise<AgentMailDraft>;
}
