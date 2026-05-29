import type { IncentiveResult, IncentiveSlab } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSlabRange(min: number, max: number | null): string {
  if (max === null) return `${min}+ units`;
  if (min === max) return `${min} unit${min === 1 ? '' : 's'}`;
  return `${min}–${max} units`;
}

export function calculateIncentive(
  totalUnits: number,
  slabs: IncentiveSlab[]
): IncentiveResult {
  const sorted = [...slabs].sort((a, b) => a.order - b.order);

  const matchedSlab =
    sorted.find(
      (slab) =>
        totalUnits >= slab.min_units &&
        (slab.max_units === null || totalUnits <= slab.max_units)
    ) ?? null;

  const payoutPerCar = matchedSlab?.payout_per_car ?? 0;
  const totalPayout = payoutPerCar * totalUnits;

  const matchedIndex = matchedSlab
    ? sorted.findIndex((s) => s.id === matchedSlab.id)
    : -1;

  const nextSlab =
    matchedIndex >= 0 && matchedIndex < sorted.length - 1
      ? sorted[matchedIndex + 1]
      : null;

  let unitsToNextSlab: number | null = null;
  let progressPercent = 100;

  if (nextSlab) {
    unitsToNextSlab = nextSlab.min_units - totalUnits;
    const rangeStart = matchedSlab?.min_units ?? 0;
    const rangeEnd = nextSlab.min_units - 1;
    const rangeSize = rangeEnd - rangeStart + 1;
    const progress = totalUnits - rangeStart;
    progressPercent = rangeSize > 0 ? Math.min(100, (progress / rangeSize) * 100) : 0;
  } else if (matchedSlab && matchedSlab.max_units === null) {
    progressPercent = 100;
  } else if (totalUnits === 0 && sorted.length > 0) {
    unitsToNextSlab = sorted[0].min_units;
    progressPercent = 0;
  }

  return {
    totalUnits,
    matchedSlab,
    payoutPerCar,
    totalPayout,
    nextSlab,
    unitsToNextSlab,
    progressPercent,
  };
}
