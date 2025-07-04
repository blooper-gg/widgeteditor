// Widget type definitions for game editor tools
export type WidgetType =
  | 'debug-log'
  | 'entity-inspector'
  | 'scene-hierarchy'
  | 'asset-browser'
  | 'properties-panel'
  | 'game-viewport'
  | 'audio-mixer'
  | 'animation-timeline'
  | 'physics-debugger'
  | 'performance-monitor'
  | 'console-output'
  | 'variable-watcher'
  | 'button' // legacy type

export interface WidgetTypeInfo {
  id: WidgetType
  name: string
  description: string
  icon: string
  defaultSize: {
    width: number
    height: number
  }
}

export const WIDGET_TYPES: WidgetTypeInfo[] = [
  {
    id: 'debug-log',
    name: 'Debug Log',
    description: 'Real-time debug messages and system logs',
    icon: '📝',
    defaultSize: { width: 320, height: 240 },
  },
  {
    id: 'entity-inspector',
    name: 'Entity Inspector',
    description: 'View and edit entity properties',
    icon: '🔍',
    defaultSize: { width: 280, height: 300 },
  },
  {
    id: 'scene-hierarchy',
    name: 'Scene Hierarchy',
    description: 'Tree view of scene objects',
    icon: '🌳',
    defaultSize: { width: 250, height: 350 },
  },
  {
    id: 'asset-browser',
    name: 'Asset Browser',
    description: 'Browse and manage project assets',
    icon: '📁',
    defaultSize: { width: 300, height: 250 },
  },
  {
    id: 'properties-panel',
    name: 'Properties Panel',
    description: 'Edit selected object properties',
    icon: '⚙️',
    defaultSize: { width: 280, height: 320 },
  },
  {
    id: 'game-viewport',
    name: 'Game Viewport',
    description: 'Live game view and interaction',
    icon: '🎮',
    defaultSize: { width: 400, height: 300 },
  },
  {
    id: 'audio-mixer',
    name: 'Audio Mixer',
    description: 'Control audio levels and effects',
    icon: '🎵',
    defaultSize: { width: 320, height: 180 },
  },
  {
    id: 'animation-timeline',
    name: 'Animation Timeline',
    description: 'Edit animation keyframes',
    icon: '⏱️',
    defaultSize: { width: 400, height: 150 },
  },
  {
    id: 'physics-debugger',
    name: 'Physics Debugger',
    description: 'Visualize physics bodies and forces',
    icon: '⚡',
    defaultSize: { width: 300, height: 200 },
  },
  {
    id: 'performance-monitor',
    name: 'Performance Monitor',
    description: 'Real-time performance metrics',
    icon: '📊',
    defaultSize: { width: 280, height: 160 },
  },
  {
    id: 'console-output',
    name: 'Console Output',
    description: 'Script execution and error output',
    icon: '💻',
    defaultSize: { width: 350, height: 200 },
  },
  {
    id: 'variable-watcher',
    name: 'Variable Watcher',
    description: 'Monitor variable values in real-time',
    icon: '👀',
    defaultSize: { width: 260, height: 180 },
  },
]

// Enhanced Widget interface with responsive positioning
export interface Widget {
  id: number
  name: string
  type: WidgetType
  // Legacy pixel-based position (for backward compatibility)
  x: number
  y: number
  width: number
  height: number
  // Z-index for layering control
  zIndex?: number
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
