export interface RateConfig {
  hourlyRate: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  hoursPerWeek: number;
  overheadModel: 'solo' | 'small-agency' | 'agency';
}

export const DEFAULT_RATE_CONFIG: RateConfig = {
  hourlyRate: 100,
  currency: 'USD',
  hoursPerWeek: 30,
  overheadModel: 'solo',
};
