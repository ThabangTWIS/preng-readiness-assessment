import Link from 'next/link';
import { Disclaimer } from '@/components/Disclaimer';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Are you ready to apply for Pr Eng registration?
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Answer a few questions about your qualification, experience and paperwork.
          We&apos;ll tell you whether you meet ECSA&apos;s requirements today, and if not,
          what&apos;s missing and roughly when you will be ready.
        </p>
      </div>

      <Link
        href="/assessment"
        className="rounded-lg bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-white"
      >
        Start the free assessment
      </Link>

      <p className="text-xs text-zinc-500">Takes about 5 minutes. No account needed.</p>

      <Disclaimer />
    </main>
  );
}
