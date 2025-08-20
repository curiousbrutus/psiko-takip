import Link from 'next/link';

export function Logo({ inSidebar = false }: { inSidebar?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-primary"
        >
          <path d="M12 2a5.5 5.5 0 0 1 5.5 5.5c0 1.96-.99 3.73-2.5 4.75" />
          <path d="M12 2a5.5 5.5 0 0 0-5.5 5.5c0 1.96.99 3.73 2.5 4.75" />
          <path d="M14.5 12.25c-1.5 1.02-3.5 1.02-5 0" />
          <path d="M20 17.5c0-1.25-2-2.5-4-2.5-1.5 0-3.5 1-3.5 1" />
          <path d="M4 17.5c0-1.25 2-2.5 4-2.5 1.5 0 3.5 1 3.5 1" />
          <path d="M12 19h.01" />
        </svg>
      </div>
      <span
        className={`text-xl font-bold ${inSidebar ? 'text-foreground' : 'text-foreground'}`}
      >
        PsikoTakip
      </span>
    </Link>
  );
}
