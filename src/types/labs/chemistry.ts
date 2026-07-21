export interface ChemistryPreset {
  id: string
  lab_id: string
  indicator_name: string
  ph_range_start: number
  ph_range_end: number
  color_hex: string
  molarity_balance: number
  precipitate_color: string | null
  config: Record<string, unknown> | null
}

export interface TitrationConfig {
  acid_concentration: number
  base_concentration: number
  indicator: string
  endpoint_ph: number
}

export interface ReactionConfig {
  reactants: Array<{ formula: string; concentration: number }>
  temperature: number
  pressure: number
}

export interface BondConfig {
  bond_types: string[]
  molecular_models: boolean
  electron_visualization: boolean
}
