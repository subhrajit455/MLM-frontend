const inrFormatter2 = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const inrFormatter4 = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4
});

const numFormatter2 = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const numFormatter4 = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4
});

/**
 * Formats a Decimal128 string into Indian Rupees (₹) with Indian lakh/crore grouping.
 * Defaults to 2 decimals for clean UI display, or 4 decimals when exact=true.
 */
export function formatINR(value, exact = false) {
  const num = parseFloat(value || '0');
  if (Number.isNaN(num)) return exact ? '₹0.0000' : '₹0.00';
  return exact ? inrFormatter4.format(num) : inrFormatter2.format(num);
}

/**
 * Formats Business Volume (BV) or Personal Volume (PV) with Indian grouping.
 */
export function formatBV(value, exact = false) {
  const num = parseFloat(value || '0');
  if (Number.isNaN(num)) return exact ? '0.0000' : '0';
  if (exact) return numFormatter4.format(num);
  return num % 1 === 0 ? num.toLocaleString('en-IN') : numFormatter2.format(num);
}

/**
 * Returns clean initials from a full name
 */
export function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'D';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const RANK_META = {
  CROWN_DIAMOND: {
    label: 'Crown Diamond',
    badgeLight: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeDark: 'dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
    dot: 'bg-amber-500'
  },
  DIAMOND: {
    label: 'Diamond',
    badgeLight: 'bg-sky-50 text-sky-800 border-sky-200',
    badgeDark: 'dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
    dot: 'bg-sky-500'
  },
  PLATINUM: {
    label: 'Platinum',
    badgeLight: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    badgeDark: 'dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
    dot: 'bg-indigo-500'
  },
  GOLD: {
    label: 'Gold',
    badgeLight: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    badgeDark: 'dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800/60',
    dot: 'bg-yellow-500'
  },
  SILVER: {
    label: 'Silver',
    badgeLight: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeDark: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400'
  },
  BRONZE: {
    label: 'Bronze',
    badgeLight: 'bg-orange-50 text-orange-800 border-orange-200',
    badgeDark: 'dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/60',
    dot: 'bg-orange-500'
  },
  STARTER: {
    label: 'Distributor',
    badgeLight: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    badgeDark: 'dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
    dot: 'bg-zinc-400'
  }
};

