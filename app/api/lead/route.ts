import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { subscribeToKitForm, tagSubscriber } from '@/lib/kit';
import type { State } from '@/lib/scoring';

interface LeadBody {
  sessionId: string;
  email: string;
  consent: boolean;
  state: State;
}

const STATES: State[] = ['S0', 'S1', 'S2', 'S3', 'S4'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidBody(body: unknown): body is LeadBody {
  if (typeof body !== 'object' || body === null) return false;
  const { sessionId, email, consent, state } = body as Record<string, unknown>;
  return (
    typeof sessionId === 'string' &&
    sessionId !== '' &&
    typeof email === 'string' &&
    EMAIL_PATTERN.test(email) &&
    consent === true &&
    typeof state === 'string' &&
    STATES.includes(state as State)
  );
}

/** Runs a Kit call and swallows failure — Kit being down/unconfigured must
 * never block a lead from being recorded or a report from being unlocked. */
async function tryKitCall(label: string, run: () => Promise<void>): Promise<boolean> {
  try {
    await run();
    return true;
  } catch (error) {
    console.error(`Kit call failed (${label})`, error);
    return false;
  }
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isValidBody(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const kitApiKey = process.env.KIT_API_KEY;
  const kitFormId = process.env.KIT_FORM_ID;
  const kitTagId = process.env[`KIT_TAG_ID_${body.state}`];

  let subscribed = false;
  if (kitApiKey && kitFormId) {
    subscribed = await tryKitCall('subscribe', () => subscribeToKitForm(body.email, kitFormId));
  }
  if (kitApiKey && kitTagId) {
    await tryKitCall('tag', () => tagSubscriber(body.email, kitTagId));
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('leads').insert({
      session_id: body.sessionId,
      email: body.email,
      consent_given_at: new Date().toISOString(),
      kit_synced_at: subscribed ? new Date().toISOString() : null,
    });
    if (error) throw error;
  } catch (error) {
    console.error('Failed to store lead', error);
    return NextResponse.json({ error: 'Failed to store lead' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
