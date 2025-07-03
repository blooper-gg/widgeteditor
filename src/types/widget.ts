// Enhanced Widget interface with responsive positioning
export interface Widget {
  id: number
  name: string
  type: string
  // Legacy pixel-based position (for backward compatibility)
  x: number
  y: number
  width: number
  height: number
  // New responsive positioning system
  responsive?: {
    // Percentage-based position relative to container
    left?: number // 0-100 percentage from left edge
    right?: number // 0-100 percentage from right edge
    top?: number // 0-100 percentage from top edge
    bottom?: number // 0-100 percentage from bottom edge
    // Percentage-based sizing
    widthPercent?: number // 0-100 percentage of container width
    heightPercent?: number // 0-100 percentage of container height
    // Minimum pixel constraints
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    // Anchoring configuration
    anchorEdges: {
      horizontal: 'left' | 'right' | 'center'
      vertical: 'top' | 'bottom' | 'center'
    }
    // Whether this widget should use responsive positioning
    enabled: boolean
  }
}

// Container dimensions for calculations
export interface ContainerDimensions {
  width: number
  height: number
}

// Calculated position for rendering
export interface CalculatedPosition {
  x: number
  y: number
  width: number
  height: number
}

// Edge distance information for anchoring decisions
export interface EdgeDistances {
  left: number
  right: number
  top: number
  bottom: number
}

// Anchor configuration
export interface AnchorConfig {
  horizontal: 'left' | 'right' | 'center'
  vertical: 'top' | 'bottom' | 'center'
}
