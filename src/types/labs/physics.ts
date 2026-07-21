export interface PhysicsConstants {
  gravitational_acceleration: number
  speed_of_light: number
  planck_constant: number
  boltzmann_constant: number
  electron_mass: number
  avogadro_number: number
}

export interface PhysicsRule {
  id: string
  lab_id: string
  constant_name: string
  constant_value: number
  unit: string
  min_value: number
  max_value: number
  config: Record<string, unknown> | null
}

export interface CircuitConfig {
  voltage_source: number
  resistance_range: [number, number]
  current_measurement: boolean
}

export interface OpticsConfig {
  lens_count: number
  mirror_types: string[]
  wavelength_range: [number, number]
}

export interface MechanicsConfig {
  gravity_enabled: boolean
  friction_coefficient: number
  mass_range: [number, number]
}
