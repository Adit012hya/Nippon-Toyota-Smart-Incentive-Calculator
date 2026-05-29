export type UserRole = 'admin' | 'sales_officer';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  employee_id: string;
  role: UserRole;
}

export interface CarModel {
  id: string;
  model_name: string;
  base_suffix: string;
  variant: string;
  created_at?: string;
}

export interface IncentiveSlab {
  id: string;
  min_units: number;
  max_units: number | null;
  payout_per_car: number;
  order: number;
}

export interface SalesEntry {
  id: string;
  officer_id: string;
  car_model_id: string;
  month: number;
  year: number;
  units_sold: number;
}

export interface IncentiveResult {
  totalUnits: number;
  matchedSlab: IncentiveSlab | null;
  payoutPerCar: number;
  totalPayout: number;
  nextSlab: IncentiveSlab | null;
  unitsToNextSlab: number | null;
  progressPercent: number;
}

export interface SlabDraft {
  id?: string;
  min_units: number;
  max_units: number | null;
  payout_per_car: number;
  order: number;
}
