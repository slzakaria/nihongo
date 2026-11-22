import { cn } from '@/lib/utils';

export function CherryBlossom({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        'hero-banner-art pointer-events-none absolute right-0 top-0 h-full w-[340px]',
        className,
      )}
      viewBox="0 0 340 320"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse
        cx="260"
        cy="160"
        rx="130"
        ry="130"
        fill="var(--hero-bloom-main)"
        opacity="0.14"
      />
      <ellipse
        cx="310"
        cy="80"
        rx="80"
        ry="80"
        fill="var(--hero-bloom-secondary)"
        opacity="0.12"
      />
      <ellipse
        cx="200"
        cy="260"
        rx="60"
        ry="60"
        fill="var(--hero-bloom-pink)"
        opacity="0.1"
      />

      <line
        x1="200"
        y1="300"
        x2="210"
        y2="80"
        stroke="var(--hero-branch)"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <line
        x1="210"
        y1="80"
        x2="250"
        y2="30"
        stroke="var(--hero-branch)"
        strokeWidth="1"
        opacity="0.35"
      />
      <line
        x1="210"
        y1="130"
        x2="260"
        y2="100"
        stroke="var(--hero-branch)"
        strokeWidth="0.8"
        opacity="0.3"
      />
      <line
        x1="210"
        y1="160"
        x2="175"
        y2="130"
        stroke="var(--hero-branch)"
        strokeWidth="0.8"
        opacity="0.3"
      />
      <line
        x1="210"
        y1="200"
        x2="260"
        y2="170"
        stroke="var(--hero-branch)"
        strokeWidth="0.8"
        opacity="0.3"
      />

      <BlossomCluster cx={250} cy={30} color="var(--hero-bloom-pink)" />
      <BlossomCluster
        cx={265}
        cy={100}
        color="var(--hero-peach)"
        accent="var(--hero-bloom-pink)"
      />
      <BlossomCluster cx={178} cy={130} color="var(--hero-bloom-pink)" size="sm" />
      <BlossomCluster
        cx={265}
        cy={172}
        color="var(--hero-bloom-secondary)"
        accent="var(--hero-blue-soft)"
      />

      <text
        x="295"
        y="195"
        fontFamily="var(--font-noto-serif-jp), serif"
        fontSize="52"
        fontWeight="300"
        fill="var(--hero-watermark)"
        opacity="0.07"
      >
        園
      </text>

      <ellipse
        cx="225"
        cy="270"
        rx="8"
        ry="3"
        fill="var(--hero-bloom-pink)"
        opacity="0.22"
      />
      <ellipse
        cx="260"
        cy="295"
        rx="6"
        ry="2"
        fill="var(--hero-blue-soft)"
        opacity="0.18"
      />
      <ellipse cx="290" cy="250" rx="5" ry="2" fill="var(--hero-peach)" opacity="0.28" />
    </svg>
  );
}

function BlossomCluster({
  cx,
  cy,
  color,
  accent = color,
  size = 'md',
}: {
  cx: number;
  cy: number;
  color: string;
  accent?: string;
  size?: 'sm' | 'md';
}) {
  const radius = size === 'sm' ? 4.5 : 6;

  return (
    <g opacity="0.72">
      <circle cx={cx} cy={cy} r={radius} fill={color} />
      <circle cx={cx + 10} cy={cy - 8} r={radius - 2} fill={accent} />
      <circle cx={cx - 8} cy={cy - 8} r={radius - 2} fill={color} />
      <circle cx={cx + 8} cy={cy + 8} r={radius - 2.5} fill={accent} opacity="0.8" />
      <circle cx={cx - 6} cy={cy + 10} r={radius - 3} fill={color} />
    </g>
  );
}
