export enum UserRole {
  CITIZEN = 'citizen',
  VOLUNTEER = 'volunteer',
  ADMIN = 'admin',
}

export enum ReportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

export enum ReportType {
  MEDICAL = 'medical',
  FIRE = 'fire',
  ACCIDENT = 'accident',
  CRIME = 'crime',
  NATURAL_DISASTER = 'natural_disaster',
  OTHER = 'other',
}

export enum InventoryItem {
  FIRST_AID_KIT = 'first_aid_kit',
  FIRE_EXTINGUISHER = 'fire_extinguisher',
  EMERGENCY_BLANKET = 'emergency_blanket',
  WATER_BOTTLES = 'water_bottles',
  FOOD_RATIONS = 'food_rations',
  FLASHLIGHT = 'flashlight',
  RADIO = 'radio',
  BATTERIES = 'batteries',
  MEDICAL_SUPPLIES = 'medical_supplies',
  RESCUE_EQUIPMENT = 'rescue_equipment',
}
