import Link from "next/link";

interface EmptyStateProps {
  icon: "explore" | "vault" | "search" | "error";
  title: string;
  description: string;
  action?: { label: string; href: string };
}

const icons = {
  explore: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <circle cx="40" cy="40" r="38" stroke="rgba(99,102,241,0.15)" strokeWidth="2" strokeDasharray="6 6" />
      <circle cx="40" cy="40" r="24" fill="rgba(99,102,241,0.08)" />
      <circle cx="40" cy="40" r="12" fill="rgba(99,102,241,0.15)" />
      <circle cx="40" cy="40" r="4" fill="rgba(99,102,241,0.3)" />
      <path d="M40 16v8M40 56v8M16 40h8M56 40h8" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  vault: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <rect x="12" y="20" width="56" height="48" rx="8" stroke="rgba(99,102,241,0.15)" strokeWidth="2" />
      <rect x="20" y="28" width="40" height="32" rx="4" fill="rgba(99,102,241,0.06)" />
      <rect x="28" y="36" width="24" height="16" rx="3" fill="rgba(99,102,241,0.12)" />
      <circle cx="40" cy="44" r="4" fill="rgba(99,102,241,0.25)" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <circle cx="34" cy="34" r="18" stroke="rgba(99,102,241,0.15)" strokeWidth="2" />
      <circle cx="34" cy="34" r="10" fill="rgba(99,102,241,0.08)" />
      <path d="M48 48l12 12" stroke="rgba(99,102,241,0.2)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <circle cx="40" cy="40" r="38" stroke="rgba(239,68,68,0.15)" strokeWidth="2" />
      <path d="M30 30l20 20M50 30l-20 20" stroke="rgba(239,68,68,0.25)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card !p-16 flex flex-col items-center text-center">
      <div className="mb-5 opacity-70">{icons[icon]}</div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-tertiary mt-1.5 max-w-xs">{description}</p>
      {action && <Link href={action.href} className="btn btn-primary btn-sm mt-5">{action.label}</Link>}
    </div>
  );
}
