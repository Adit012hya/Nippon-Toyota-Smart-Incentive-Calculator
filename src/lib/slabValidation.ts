import type { SlabDraft } from '../types';

export interface SlabValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSlabs(slabs: SlabDraft[]): SlabValidationResult {
  const errors: string[] = [];

  if (slabs.length === 0) {
    return { valid: false, errors: ['At least one incentive slab is required.'] };
  }

  const sorted = [...slabs].sort((a, b) => a.order - b.order);

  for (let i = 0; i < sorted.length; i++) {
    const slab = sorted[i];

    if (slab.min_units < 1) {
      errors.push(`Slab ${i + 1}: minimum units must be at least 1.`);
    }

    if (slab.payout_per_car < 0) {
      errors.push(`Slab ${i + 1}: payout per car cannot be negative.`);
    }

    if (slab.max_units !== null && slab.max_units < slab.min_units) {
      errors.push(`Slab ${i + 1}: max units cannot be less than min units.`);
    }

    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.max_units === null) {
        errors.push(
          `Slab ${i}: previous slab is unlimited — no further slabs can follow.`
        );
      } else if (slab.min_units !== prev.max_units + 1) {
        errors.push(
          `Slab ${i + 1}: must start at ${prev.max_units + 1} (previous slab ends at ${prev.max_units}). Found ${slab.min_units}.`
        );
      }
    }

    if (i < sorted.length - 1 && slab.max_units === null) {
      errors.push(`Slab ${i + 1}: only the last slab can be unlimited.`);
    }
  }

  if (sorted[0].min_units !== 1) {
    errors.push('The first slab must start at 1 unit.');
  }

  return { valid: errors.length === 0, errors };
}
