// Equipment at a standard Cult-branded gym (cultsport commercial range:
// https://equipment.cultsport.com). Exercises list what they need from here.
// Settings store what is *missing*, so new equipment added here is assumed present.

export const EQUIPMENT_GROUPS = [
  {
    name: 'Cardio',
    items: [
      { id: 'treadmill', name: 'Treadmill' },
      { id: 'elliptical', name: 'Cross trainer' },
      { id: 'upright-bike', name: 'Upright bike' },
      { id: 'recumbent-bike', name: 'Recumbent bike' },
      { id: 'stairmill', name: 'Stairmill' },
    ],
  },
  {
    name: 'Machines',
    items: [
      { id: 'chest-press', name: 'Chest press' },
      { id: 'pec-fly', name: 'Pec fly / rear delt' },
      { id: 'shoulder-press', name: 'Shoulder press' },
      { id: 'lat-pulldown', name: 'Lat pulldown' },
      { id: 'seated-row', name: 'Seated row' },
      { id: 'plate-row', name: 'Plate-loaded row' },
      { id: 'plate-incline-press', name: 'Plate-loaded incline press' },
      { id: 'leg-press', name: 'Leg press' },
      { id: 'hack-squat', name: 'Hack squat' },
      { id: 'leg-extension', name: 'Leg extension' },
      { id: 'leg-curl-seated', name: 'Seated leg curl' },
      { id: 'leg-curl-lying', name: 'Lying leg curl' },
      { id: 'abductor-adductor', name: 'Abductor / adductor' },
      { id: 'calf-seated', name: 'Seated calf raise' },
      { id: 'arm-machine', name: 'Biceps / triceps machine' },
      { id: 'dip-machine', name: 'Triceps press / dip' },
    ],
  },
  {
    name: 'Cables, racks and benches',
    items: [
      { id: 'cable', name: 'Cable station / crossover' },
      { id: 'smith', name: 'Smith machine' },
      { id: 'bench', name: 'Adjustable bench' },
      { id: 'hyperextension', name: 'Back extension bench' },
      { id: 'knee-raise', name: "Knee raise station (captain's chair)" },
    ],
  },
  {
    name: 'Free weights',
    items: [{ id: 'dumbbells', name: 'Dumbbells' }],
  },
] as const

export type EquipmentId = (typeof EQUIPMENT_GROUPS)[number]['items'][number]['id']

export const EQUIPMENT_NAMES: Record<EquipmentId, string> = Object.fromEntries(
  EQUIPMENT_GROUPS.flatMap((g) => g.items.map((i) => [i.id, i.name])),
) as Record<EquipmentId, string>

// What people may have at home. Bands are never assumed at the gym.
export const HOME_KIT = [
  { id: 'dumbbells', name: 'Dumbbells' },
  { id: 'bands', name: 'Bands' },
] as const

export type HomeKitId = (typeof HOME_KIT)[number]['id']

// Anything an exercise can need.
export type Need = EquipmentId | HomeKitId

export const ALL_NEEDS: Need[] = [...(Object.keys(EQUIPMENT_NAMES) as EquipmentId[]), 'bands']
