export const nigerianStates = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT (Abuja)',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const

export type NigerianState = (typeof nigerianStates)[number]

const stateAliases: Record<string, NigerianState> = {
  Abuja: 'FCT (Abuja)',
  FCT: 'FCT (Abuja)',
  'FCT - Abuja': 'FCT (Abuja)',
  'Federal Capital Territory': 'FCT (Abuja)',
  Ibadan: 'Oyo',
  'Port Harcourt': 'Rivers',
  Jos: 'Plateau',
  Maiduguri: 'Borno',
  Calabar: 'Cross River',
  Warri: 'Delta',
  'Benin City': 'Edo',
}

export function resolveNigerianState(value?: string | null) {
  if (!value || value === 'Not specified' || value === 'Not provided') return ''
  const trimmed = value.trim()
  if ((nigerianStates as readonly string[]).includes(trimmed)) return trimmed
  return stateAliases[trimmed] ?? trimmed
}
