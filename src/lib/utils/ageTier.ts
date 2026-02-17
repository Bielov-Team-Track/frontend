export type AgeTier = 'Under13' | 'Teen13ToConsent' | 'TeenConsentTo17' | 'Adult';

const CONSENT_AGE_MAP: Record<string, number> = {
  BE: 13, DK: 13, EE: 13, FI: 13, LV: 13, MT: 13, PT: 13, SE: 13, GB: 13, US: 13,
  AT: 14, BG: 14, CY: 14, IT: 14, LT: 14, ES: 14,
  CZ: 15, FR: 15, GR: 15, SI: 15,
  HR: 16, DE: 16, HU: 16, IE: 16, LU: 16, NL: 16, PL: 16, RO: 16, SK: 16,
};

const DEFAULT_CONSENT_AGE = 16;

export function getConsentAge(countryCode: string): number {
  return CONSENT_AGE_MAP[countryCode.toUpperCase()] ?? DEFAULT_CONSENT_AGE;
}

// NOTE: Uses local time via new Date() for instant client-side feedback. The server always does the
// authoritative age check using UTC. Minor timezone discrepancies near midnight are resolved server-side.
function calculateAge(dateOfBirth: Date, referenceDate = new Date()): number {
  let age = referenceDate.getFullYear() - dateOfBirth.getFullYear();
  const birthday = new Date(
    referenceDate.getFullYear(),
    dateOfBirth.getMonth(),
    dateOfBirth.getDate()
  );
  if (referenceDate < birthday) age--;
  return age;
}

export function getAgeTier(dateOfBirth: Date, countryCode: string): AgeTier {
  const age = calculateAge(dateOfBirth);
  const consentAge = getConsentAge(countryCode);

  if (age < 13) return 'Under13';
  if (age >= 18) return 'Adult';
  if (age < consentAge) return 'Teen13ToConsent';
  return 'TeenConsentTo17';
}

export function isGuardianRequired(tier: AgeTier): boolean {
  return tier === 'Teen13ToConsent';
}

export function isGuardianOptional(tier: AgeTier): boolean {
  return tier === 'TeenConsentTo17';
}

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
] as const;
