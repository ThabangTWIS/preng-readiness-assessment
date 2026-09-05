/**
 * Kit (formerly ConvertKit) API v4 client — server-only, see
 * https://developers.kit.com/api-reference. Auth is an `X-Kit-Api-Key`
 * header; both calls below are keyed by email address.
 */

const KIT_API_BASE = 'https://api.kit.com/v4';

function requireKitApiKey(): string {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) throw new Error('KIT_API_KEY is not set');
  return apiKey;
}

async function kitPost(path: string, body: Record<string, unknown>): Promise<void> {
  const response = await fetch(`${KIT_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': requireKitApiKey(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Kit API ${path} failed: ${response.status} ${await response.text()}`);
  }
}

/** Subscribes (creating the subscriber if needed) to a single Kit form. */
export function subscribeToKitForm(email: string, formId: string): Promise<void> {
  return kitPost(`/forms/${formId}/subscribers`, { email_address: email });
}

/** Applies a tag to a subscriber (creating the subscriber if needed). */
export function tagSubscriber(email: string, tagId: string): Promise<void> {
  return kitPost(`/tags/${tagId}/subscribers`, { email_address: email });
}
