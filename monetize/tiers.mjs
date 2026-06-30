/**
 * Axon — Definicion de tiers (fuente unica de verdad)
 *
 * Define que desbloquea cada nivel. Tanto el dashboard como el launcher
 * leen de aqui, asi que cambiar el modelo de negocio es cambiar un archivo.
 */

export const TIERS = {
  free: {
    label: 'Free',
    price: '$0',
    skills: ['research', 'trading', 'daily'],
    connectors: false,
    autoBrief: false,
    skillCreator: false,
    trainer: false,
    multiUser: false,
    maxSkills: 3,
  },
  pro: {
    label: 'Pro',
    price: '$29/mes',
    skills: 'all',
    connectors: true,
    autoBrief: true,
    skillCreator: true,
    trainer: true,
    multiUser: false,
    maxSkills: Infinity,
  },
  team: {
    label: 'Team',
    price: '$19/usuario/mes',
    skills: 'all',
    connectors: true,
    autoBrief: true,
    skillCreator: true,
    trainer: true,
    multiUser: true,
    maxSkills: Infinity,
  },
  enterprise: {
    label: 'Enterprise',
    price: 'Custom',
    skills: 'all',
    connectors: true,
    autoBrief: true,
    skillCreator: true,
    trainer: true,
    multiUser: true,
    maxSkills: Infinity,
  },
};

/** Devuelve true si el tier tiene acceso a una feature dada. */
export function can(tier, feature) {
  const t = TIERS[tier] || TIERS.free;
  return Boolean(t[feature]);
}

/** Devuelve true si el tier puede usar un skill dado por nombre. */
export function canUseSkill(tier, skillName) {
  const t = TIERS[tier] || TIERS.free;
  if (t.skills === 'all') return true;
  return Array.isArray(t.skills) && t.skills.includes(skillName);
}
