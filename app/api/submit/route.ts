import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { RulesV1 } from '@/lib/rules/v1';
import { score, type Answers } from '@/lib/scoring';

interface SubmitBody {
  sessionId: string;
  answers: Answers;
  evaluatedAt: string;
}

function isValidBody(body: unknown): body is SubmitBody {
  if (typeof body !== 'object' || body === null) return false;
  const { sessionId, answers, evaluatedAt } = body as Record<string, unknown>;
  return typeof sessionId === 'string' && sessionId !== '' && typeof answers === 'object' && answers !== null &&
    typeof evaluatedAt === 'string' && evaluatedAt !== '';
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isValidBody(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = score(body.answers, RulesV1, new Date(body.evaluatedAt));

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('assessment_results').upsert(
      {
        session_id: body.sessionId,
        rule_version: RulesV1.ruleVersion,
        answers: body.answers,
        result,
        computed_at: body.evaluatedAt,
      },
      { onConflict: 'session_id' },
    );
    if (error) throw error;
  } catch (error) {
    console.error('Failed to store assessment result', error);
    return NextResponse.json({ error: 'Failed to store result' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
