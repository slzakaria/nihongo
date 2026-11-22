'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
    >
      Print
    </button>
  );
}
