export interface BiologyAsset {
  id: string
  lab_id: string
  asset_name: string
  storage_path: string
  asset_type: 'model' | 'texture' | 'label'
  interactive_nodes: Record<string, unknown> | null
  visibility_layers: Record<string, unknown> | null
}

export interface AnatomyConfig {
  organ_systems: string[]
  rotation_enabled: boolean
  cross_section_view: boolean
  label_visibility: boolean
}

export interface GeneticsConfig {
  trait_count: number
  Punnett_square_size: number
  generation_limit: number
}

export interface EcologyConfig {
  ecosystem_type: string
  species_count: number
  simulation_speed: number
}

export interface CellConfig {
  organelle_visibility: Record<string, boolean>
  zoom_level: number
  cross_section: boolean
}
