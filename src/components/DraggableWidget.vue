<template>
  <vue-draggable-resizable
    :w="calculatedPosition.width"
    :h="calculatedPosition.height"
    :x="calculatedPosition.x"
    :y="calculatedPosition.y"
    :min-width="effectiveMinConstraints.minWidth"
    :min-height="effectiveMinConstraints.minHeight"
    :max-width="effectiveMinConstraints.maxWidth"
    :max-height="effectiveMinConstraints.maxHeight"
    :grid="isShiftPressed ? [10, 10] : [1, 1]"
    :parent="true"
    :resizable="!isLocked"
    :draggable="!isLocked"
    :data-responsive="widget.responsive?.enabled ? 'true' : 'false'"
    :style="{ zIndex: widget.zIndex || 0 }"
    @dragging="onDrag"
    @resizing="onResize"
    @drag-start="onDragStart"
    @resize-start="onResizeStart"
    @activated="onActivated"
    ref="draggableRef"
    class="widget-container"
  >
    <!-- Custom edge detection zones - positioned relative to the entire widget -->
    <div
      v-if="!isLocked"
      class="resize-edge resize-edge-top"
      @mousedown="startEdgeResize($event, 'top')"
      @touchstart="startEdgeResize($event, 'top')"
    ></div>
    <div
      v-if="!isLocked"
      class="resize-edge resize-edge-right"
      @mousedown="startEdgeResize($event, 'right')"
      @touchstart="startEdgeResize($event, 'right')"
    ></div>
    <div
      v-if="!isLocked"
      class="resize-edge resize-edge-bottom"
      @mousedown="startEdgeResize($event, 'bottom')"
      @touchstart="startEdgeResize($event, 'bottom')"
    ></div>
    <div
      v-if="!isLocked"
      class="resize-edge resize-edge-left"
      @mousedown="startEdgeResize($event, 'left')"
      @touchstart="startEdgeResize($event, 'left')"
    ></div>

    <!-- Corner detection zones -->
    <div
      v-if="!isLocked"
      class="resize-corner resize-corner-tl"
      @mousedown="startEdgeResize($event, 'tl')"
      @touchstart="startEdgeResize($event, 'tl')"
    ></div>
    <div
      v-if="!isLocked"
      class="resize-corner resize-corner-tr"
      @mousedown="startEdgeResize($event, 'tr')"
      @touchstart="startEdgeResize($event, 'tr')"
    ></div>
    <div
      v-if="!isLocked"
      class="resize-corner resize-corner-bl"
      @mousedown="startEdgeResize($event, 'bl')"
      @touchstart="startEdgeResize($event, 'bl')"
    ></div>
    <div
      v-if="!isLocked"
      class="resize-corner resize-corner-br"
      @mousedown="startEdgeResize($event, 'br')"
      @touchstart="startEdgeResize($event, 'br')"
    ></div>

    <wired-card elevation="2" class="widget-card">
      <div class="widget-header" @click="selectWidget">
        <h4>{{ widget.name }}</h4>
        <div class="widget-controls">
          <span v-if="widget.responsive?.enabled" class="anchor-indicator">
            {{ widget.responsive.anchorEdges.vertical[0].toUpperCase()
            }}{{ widget.responsive.anchorEdges.horizontal[0].toUpperCase() }}
          </span>
          <wired-icon-button @click.stop="removeWidget" class="remove-btn"> ✕ </wired-icon-button>
        </div>
      </div>

      <div class="widget-body">
        <!-- Debug Log Widget -->
        <div v-if="widget.type === 'debug-log'" class="debug-log-widget">
          <div class="log-header">
            <div class="log-controls">
              <wired-button class="log-btn">Clear</wired-button>
              <wired-button class="log-btn">Filter</wired-button>
              <wired-toggle class="log-toggle" />
            </div>
            <div class="log-stats">
              <span class="log-count">247 msgs</span>
            </div>
          </div>
          <div class="log-content">
            <div class="log-entry info">
              <span class="log-time">14:32:01</span>
              <span class="log-level info">INFO</span>
              <span class="log-message">Player spawned at (0, 0, 0)</span>
            </div>
            <div class="log-entry warning">
              <span class="log-time">14:32:15</span>
              <span class="log-level warning">WARN</span>
              <span class="log-message">Low memory warning</span>
            </div>
            <div class="log-entry error">
              <span class="log-time">14:32:22</span>
              <span class="log-level error">ERROR</span>
              <span class="log-message">Failed to load texture: missing.png</span>
            </div>
            <div class="log-entry debug">
              <span class="log-time">14:32:30</span>
              <span class="log-level debug">DEBUG</span>
              <span class="log-message">Physics tick: 60fps</span>
            </div>
          </div>
        </div>

        <!-- Entity Inspector Widget -->
        <div v-else-if="widget.type === 'entity-inspector'" class="entity-inspector-widget">
          <div class="inspector-header">
            <span class="entity-name">Player_001</span>
            <wired-toggle class="entity-active" />
          </div>
          <div class="inspector-content">
            <div class="property-section">
              <h4>Transform</h4>
              <div class="property-row">
                <label>Position</label>
                <div class="vector-input">
                  <input type="number" value="0" class="coord-input" />
                  <input type="number" value="0" class="coord-input" />
                  <input type="number" value="0" class="coord-input" />
                </div>
              </div>
              <div class="property-row">
                <label>Rotation</label>
                <div class="vector-input">
                  <input type="number" value="0" class="coord-input" />
                  <input type="number" value="0" class="coord-input" />
                  <input type="number" value="0" class="coord-input" />
                </div>
              </div>
            </div>
            <div class="property-section">
              <h4>Renderer</h4>
              <div class="property-row">
                <label>Material</label>
                <select class="material-select">
                  <option>Default</option>
                  <option>Metal</option>
                  <option>Glass</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Scene Hierarchy Widget -->
        <div v-else-if="widget.type === 'scene-hierarchy'" class="scene-hierarchy-widget">
          <div class="hierarchy-header">
            <wired-button class="hierarchy-btn">+</wired-button>
            <input type="text" placeholder="Search..." class="search-input" />
          </div>
          <div class="hierarchy-content">
            <div class="hierarchy-tree">
              <div class="tree-node expanded">
                <span class="node-icon">📁</span>
                <span class="node-name">Scene</span>
              </div>
              <div class="tree-node child">
                <span class="node-icon">🎮</span>
                <span class="node-name">Player</span>
              </div>
              <div class="tree-node child">
                <span class="node-icon">🌍</span>
                <span class="node-name">Environment</span>
              </div>
              <div class="tree-node child expanded">
                <span class="node-icon">💡</span>
                <span class="node-name">Lighting</span>
              </div>
              <div class="tree-node child-2">
                <span class="node-icon">☀️</span>
                <span class="node-name">Sun</span>
              </div>
              <div class="tree-node child-2">
                <span class="node-icon">🌙</span>
                <span class="node-name">Moon</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Browser Widget -->
        <div v-else-if="widget.type === 'asset-browser'" class="asset-browser-widget">
          <div class="browser-header">
            <div class="breadcrumb"><span>Assets</span> / <span>Textures</span></div>
            <wired-button class="view-btn">🔍</wired-button>
          </div>
          <div class="browser-content">
            <div class="asset-grid">
              <div class="asset-item">
                <div class="asset-thumbnail">🖼️</div>
                <span class="asset-name">player.png</span>
              </div>
              <div class="asset-item">
                <div class="asset-thumbnail">🎵</div>
                <span class="asset-name">bgm.mp3</span>
              </div>
              <div class="asset-item">
                <div class="asset-thumbnail">🎮</div>
                <span class="asset-name">model.fbx</span>
              </div>
              <div class="asset-item">
                <div class="asset-thumbnail">📄</div>
                <span class="asset-name">config.json</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Properties Panel Widget -->
        <div v-else-if="widget.type === 'properties-panel'" class="properties-panel-widget">
          <div class="panel-header">
            <span class="panel-title">Properties</span>
          </div>
          <div class="panel-content">
            <div class="property-group">
              <h4>Mesh Renderer</h4>
              <div class="property-field">
                <label>Cast Shadows</label>
                <wired-toggle />
              </div>
              <div class="property-field">
                <label>Receive Shadows</label>
                <wired-toggle />
              </div>
            </div>
            <div class="property-group">
              <h4>Physics</h4>
              <div class="property-field">
                <label>Mass</label>
                <input type="number" value="1.0" class="number-input" />
              </div>
              <div class="property-field">
                <label>Friction</label>
                <input type="range" min="0" max="1" step="0.1" value="0.5" class="slider-input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Game Viewport Widget -->
        <div v-else-if="widget.type === 'game-viewport'" class="game-viewport-widget">
          <div class="viewport-header">
            <div class="viewport-controls">
              <wired-button class="viewport-btn">▶️</wired-button>
              <wired-button class="viewport-btn">⏸️</wired-button>
              <wired-button class="viewport-btn">⏹️</wired-button>
            </div>
            <div class="viewport-stats">
              <span class="fps-counter">FPS: 60</span>
            </div>
          </div>
          <div class="viewport-content">
            <div class="game-view">
              <div class="game-screenshot">
                <img src="/caught matcher.png" alt="Game Screenshot" class="game-screenshot-img" />
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Monitor Widget -->
        <div v-else-if="widget.type === 'performance-monitor'" class="performance-monitor-widget">
          <div class="monitor-header">
            <span class="monitor-title">Performance</span>
            <wired-button class="monitor-btn">📊</wired-button>
          </div>
          <div class="monitor-content">
            <div class="metric">
              <span class="metric-label">FPS</span>
              <span class="metric-value">60</span>
            </div>
            <div class="metric">
              <span class="metric-label">Memory</span>
              <span class="metric-value">245MB</span>
            </div>
            <div class="metric">
              <span class="metric-label">Draw Calls</span>
              <span class="metric-value">123</span>
            </div>
            <div class="metric">
              <span class="metric-label">Triangles</span>
              <span class="metric-value">45.2K</span>
            </div>
          </div>
        </div>

        <!-- Console Output Widget -->
        <div v-else-if="widget.type === 'console-output'" class="console-output-widget">
          <div class="console-header">
            <wired-button class="console-btn">Clear</wired-button>
            <input type="text" placeholder="Enter command..." class="console-input" />
          </div>
          <div class="console-content">
            <div class="console-line">
              <span class="prompt">></span>
              <span class="command">load_level("level1")</span>
            </div>
            <div class="console-line output">
              <span class="result">Level loaded successfully</span>
            </div>
            <div class="console-line">
              <span class="prompt">></span>
              <span class="command">get_player_pos()</span>
            </div>
            <div class="console-line output">
              <span class="result">Vector3(0, 0, 0)</span>
            </div>
            <div class="console-line">
              <span class="prompt">></span>
              <span class="cursor">|</span>
            </div>
          </div>
        </div>

        <!-- Default/Legacy Widget -->
        <div v-else class="default-widget">
          <p>{{ widget.type }} Widget</p>
          <input type="text" />
          <wired-button>Click me</wired-button>
          <wired-toggle />
        </div>
      </div>
    </wired-card>
  </vue-draggable-resizable>
</template>

<script setup lang="ts">
import VueDraggableResizable from 'vue-draggable-resizable'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import type { Widget, ContainerDimensions } from '@/types/widget'
import { calculateWidgetPosition } from '@/utils/responsive-positioning'

// Props
const props = defineProps<{
  widget: Widget
  containerDimensions: ContainerDimensions
  isLocked?: boolean
}>()

// Emits
const emit = defineEmits<{
  remove: [id: number]
  updatePositionAndSize: [id: number, x: number, y: number, width: number, height: number]
  select: [widget: Widget]
}>()

// Refs
const draggableRef = ref<HTMLElement | null>(null)

// Grid snapping state
const isShiftPressed = ref(false)

// Custom resize state
const isCustomResizing = ref(false)
const customResizeData = ref<{
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startPosX: number
  startPosY: number
  direction: string
} | null>(null)

// Calculate final position based on responsive settings
const calculatedPosition = computed(() => {
  return calculateWidgetPosition(props.widget, props.containerDimensions)
})

// Calculate effective minimum constraints for the widget
const effectiveMinConstraints = computed(() => {
  const baseMinWidth = Math.max(80, props.widget.width * 0.4)
  const baseMinHeight = Math.max(40, props.widget.height * 0.4)

  return {
    minWidth: props.widget.responsive?.minWidth || baseMinWidth,
    minHeight: props.widget.responsive?.minHeight || baseMinHeight,
    maxWidth: props.widget.responsive?.maxWidth || props.containerDimensions.width,
    maxHeight: props.widget.responsive?.maxHeight || props.containerDimensions.height,
  }
})

// Keyboard event handlers
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Shift') {
    isShiftPressed.value = true
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Shift') {
    isShiftPressed.value = false
  }
}

// Watch for lock state changes and stop any ongoing resize operations
watch(
  () => props.isLocked,
  (newValue) => {
    if (newValue && isCustomResizing.value) {
      stopCustomResize()
    }
  },
)

// Setup event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)

  // Clean up custom resize listeners if they exist
  if (isCustomResizing.value) {
    stopCustomResize()
  }
})

const onDrag = (x: number, y: number) => {
  if (props.isLocked) return
  // Always emit combined update to prevent race conditions
  emit('updatePositionAndSize', props.widget.id, x, y, props.widget.width, props.widget.height)
}

const onResize = (x: number, y: number, width: number, height: number) => {
  if (props.isLocked) return
  // Always emit combined update to prevent race conditions
  emit('updatePositionAndSize', props.widget.id, x, y, width, height)
}

const onDragStart = () => {
  if (props.isLocked) return
  // Auto-select widget when dragging starts
  emit('select', props.widget)
}

const onResizeStart = () => {
  if (props.isLocked) return
  // Auto-select widget when resizing starts
  emit('select', props.widget)
}

const onActivated = () => {
  if (props.isLocked) return
  // Auto-select widget when it becomes active
  emit('select', props.widget)
}

const removeWidget = () => {
  emit('remove', props.widget.id)
}

const selectWidget = (event: Event) => {
  if (props.isLocked) return
  event.stopPropagation()
  emit('select', props.widget)
}

// Custom edge resize functionality
const startEdgeResize = (event: MouseEvent | TouchEvent, direction: string) => {
  if (props.isLocked) return

  event.preventDefault()
  event.stopPropagation()

  // Auto-select widget when custom edge resizing starts
  emit('select', props.widget)

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

  isCustomResizing.value = true
  customResizeData.value = {
    startX: clientX,
    startY: clientY,
    startWidth: calculatedPosition.value.width,
    startHeight: calculatedPosition.value.height,
    startPosX: calculatedPosition.value.x,
    startPosY: calculatedPosition.value.y,
    direction,
  }

  // Add global event listeners
  document.addEventListener('mousemove', handleCustomResize)
  document.addEventListener('mouseup', stopCustomResize)
  document.addEventListener('touchmove', handleCustomResize)
  document.addEventListener('touchend', stopCustomResize)

  // Add cursor styling
  document.body.style.cursor = getCursorForDirection(direction)
  document.body.style.userSelect = 'none'
}

const handleCustomResize = (event: MouseEvent | TouchEvent) => {
  if (!isCustomResizing.value || !customResizeData.value || props.isLocked) return

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

  const deltaX = clientX - customResizeData.value.startX
  const deltaY = clientY - customResizeData.value.startY
  const direction = customResizeData.value.direction

  let newWidth = customResizeData.value.startWidth
  let newHeight = customResizeData.value.startHeight
  let newX = customResizeData.value.startPosX
  let newY = customResizeData.value.startPosY

  // Apply grid snapping if shift is pressed
  const gridX = isShiftPressed.value ? 10 : 1
  const gridY = isShiftPressed.value ? 10 : 1

  // Calculate new dimensions based on direction
  switch (direction) {
    case 'top':
      newHeight = Math.max(
        effectiveMinConstraints.value.minHeight,
        customResizeData.value.startHeight - deltaY,
      )
      newY = customResizeData.value.startPosY + (customResizeData.value.startHeight - newHeight)
      break
    case 'right':
      newWidth = Math.max(
        effectiveMinConstraints.value.minWidth,
        customResizeData.value.startWidth + deltaX,
      )
      break
    case 'bottom':
      newHeight = Math.max(
        effectiveMinConstraints.value.minHeight,
        customResizeData.value.startHeight + deltaY,
      )
      break
    case 'left':
      newWidth = Math.max(
        effectiveMinConstraints.value.minWidth,
        customResizeData.value.startWidth - deltaX,
      )
      newX = customResizeData.value.startPosX + (customResizeData.value.startWidth - newWidth)
      break
    case 'tl':
      newWidth = Math.max(
        effectiveMinConstraints.value.minWidth,
        customResizeData.value.startWidth - deltaX,
      )
      newHeight = Math.max(
        effectiveMinConstraints.value.minHeight,
        customResizeData.value.startHeight - deltaY,
      )
      newX = customResizeData.value.startPosX + (customResizeData.value.startWidth - newWidth)
      newY = customResizeData.value.startPosY + (customResizeData.value.startHeight - newHeight)
      break
    case 'tr':
      newWidth = Math.max(
        effectiveMinConstraints.value.minWidth,
        customResizeData.value.startWidth + deltaX,
      )
      newHeight = Math.max(
        effectiveMinConstraints.value.minHeight,
        customResizeData.value.startHeight - deltaY,
      )
      newY = customResizeData.value.startPosY + (customResizeData.value.startHeight - newHeight)
      break
    case 'bl':
      newWidth = Math.max(
        effectiveMinConstraints.value.minWidth,
        customResizeData.value.startWidth - deltaX,
      )
      newHeight = Math.max(
        effectiveMinConstraints.value.minHeight,
        customResizeData.value.startHeight + deltaY,
      )
      newX = customResizeData.value.startPosX + (customResizeData.value.startWidth - newWidth)
      break
    case 'br':
      newWidth = Math.max(
        effectiveMinConstraints.value.minWidth,
        customResizeData.value.startWidth + deltaX,
      )
      newHeight = Math.max(
        effectiveMinConstraints.value.minHeight,
        customResizeData.value.startHeight + deltaY,
      )
      break
  }

  // Apply grid snapping
  newWidth = Math.round(newWidth / gridX) * gridX
  newHeight = Math.round(newHeight / gridY) * gridY
  newX = Math.round(newX / gridX) * gridX
  newY = Math.round(newY / gridY) * gridY

  // Apply container constraints
  newWidth = Math.min(effectiveMinConstraints.value.maxWidth, newWidth)
  newHeight = Math.min(effectiveMinConstraints.value.maxHeight, newHeight)

  // Ensure position stays within container bounds
  newX = Math.max(0, Math.min(props.containerDimensions.width - newWidth, newX))
  newY = Math.max(0, Math.min(props.containerDimensions.height - newHeight, newY))

  // Always emit combined event for custom edge resizing to prevent race conditions
  emit('updatePositionAndSize', props.widget.id, newX, newY, newWidth, newHeight)
}

const stopCustomResize = () => {
  if (!isCustomResizing.value) return

  isCustomResizing.value = false
  customResizeData.value = null

  // Remove global event listeners
  document.removeEventListener('mousemove', handleCustomResize)
  document.removeEventListener('mouseup', stopCustomResize)
  document.removeEventListener('touchmove', handleCustomResize)
  document.removeEventListener('touchend', stopCustomResize)

  // Reset cursor
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const getCursorForDirection = (direction: string): string => {
  switch (direction) {
    case 'top':
    case 'bottom':
      return 'ns-resize'
    case 'left':
    case 'right':
      return 'ew-resize'
    case 'tl':
    case 'br':
      return 'nw-resize'
    case 'tr':
    case 'bl':
      return 'ne-resize'
    default:
      return 'default'
  }
}
</script>

<style>
@import 'vue-draggable-resizable/style.css';

/* Show resize handles on hover (only when not locked) */
.editor-workspace:not(.locked) .vdr:hover .handle {
  display: block !important;
}

/* Show resize handles when active (only when not locked) */
.editor-workspace:not(.locked) .vdr.active .handle {
  display: block !important;
}

/* Completely disable built-in handles when locked */
.editor-workspace.locked .vdr .handle {
  display: none !important;
  pointer-events: none !important;
}

/* Debug Log Widget Styles */
.debug-log-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.log-controls {
  display: flex;
  gap: 4px;
  align-items: center;
}

.log-btn {
  font-size: 12px !important;
  padding: 4px 8px !important;
  min-width: auto !important;
}

.log-toggle {
  transform: scale(0.8);
}

.log-stats {
  font-size: 12px;
  color: var(--text-secondary);
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
  background: var(--bg-primary);
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 4px 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 12px;
  line-height: 1.3;
}

.log-time {
  color: var(--text-secondary);
  font-weight: bold;
  min-width: 55px;
}

.log-level {
  font-weight: bold;
  min-width: 45px;
}

.log-level.info {
  color: #007bff;
}
.log-level.warning {
  color: #ffc107;
}
.log-level.error {
  color: #dc3545;
}
.log-level.debug {
  color: #6c757d;
}

.log-message {
  flex: 1;
  color: var(--text-primary);
}

/* Entity Inspector Widget Styles */
.entity-inspector-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.inspector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.entity-name {
  font-weight: bold;
  color: var(--text-primary);
}

.entity-active {
  transform: scale(0.7);
}

.inspector-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.property-section {
  margin-bottom: 12px;
}

.property-section h4 {
  margin: 0 0 6px 0;
  font-size: 12px;
  font-weight: bold;
  color: var(--text-primary);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 2px;
}

.property-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.property-row label {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 60px;
}

.vector-input {
  display: flex;
  gap: 2px;
}

.coord-input {
  width: 45px;
  height: 24px;
  font-size: 11px;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  padding: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.material-select {
  width: 100px;
  height: 24px;
  font-size: 11px;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  padding: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Scene Hierarchy Widget Styles */
.scene-hierarchy-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.hierarchy-header {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.hierarchy-btn {
  font-size: 12px !important;
  padding: 4px 8px !important;
  min-width: auto !important;
}

.search-input {
  flex: 1;
  height: 24px;
  font-size: 11px;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  padding: 4px 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.hierarchy-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

.hierarchy-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tree-node:hover {
  background: var(--bg-tertiary);
}

.tree-node.child {
  padding-left: 16px;
}

.tree-node.child-2 {
  padding-left: 28px;
}

.node-icon {
  font-size: 12px;
}

.node-name {
  font-size: 12px;
  color: var(--text-primary);
}

/* Asset Browser Widget Styles */
.asset-browser-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.browser-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.breadcrumb {
  font-size: 12px;
  color: var(--text-secondary);
}

.view-btn {
  font-size: 12px !important;
  padding: 4px 8px !important;
  min-width: auto !important;
}

.browser-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
}

.asset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.asset-item:hover {
  background: var(--bg-tertiary);
}

.asset-thumbnail {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: 16px;
}

.asset-name {
  font-size: 11px;
  color: var(--text-primary);
  text-align: center;
  word-break: break-word;
}

/* Properties Panel Widget Styles */
.properties-panel-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.panel-title {
  font-weight: bold;
  color: var(--text-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.property-group {
  margin-bottom: 12px;
}

.property-group h4 {
  margin: 0 0 6px 0;
  font-size: 12px;
  font-weight: bold;
  color: var(--text-primary);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 2px;
}

.property-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.property-field label {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 80px;
}

.number-input {
  width: 65px;
  height: 24px;
  font-size: 11px;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  padding: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.slider-input {
  width: 80px;
  height: 15px;
}

/* Game Viewport Widget Styles */
.game-viewport-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.viewport-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.viewport-controls {
  display: flex;
  gap: 4px;
}

.viewport-btn {
  font-size: 12px !important;
  padding: 4px 8px !important;
  min-width: auto !important;
}

.viewport-stats {
  font-size: 12px;
  color: var(--text-secondary);
}

.viewport-content {
  flex: 1;
  position: relative;
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-view {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-screenshot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-screenshot-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* Performance Monitor Widget Styles */
.performance-monitor-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.monitor-title {
  font-weight: bold;
  color: var(--text-primary);
}

.monitor-btn {
  font-size: 12px !important;
  padding: 4px 8px !important;
  min-width: auto !important;
}

.monitor-content {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.metric-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: bold;
}

.metric-value {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: bold;
}

/* Console Output Widget Styles */
.console-output-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.console-header {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.console-btn {
  font-size: 12px !important;
  padding: 4px 8px !important;
  min-width: auto !important;
}

.console-input {
  flex: 1;
  height: 24px;
  font-size: 11px;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  padding: 4px 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.console-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
  background: var(--bg-primary);
}

.console-line {
  display: flex;
  gap: 4px;
  padding: 2px 6px;
  font-size: 12px;
  line-height: 1.3;
  margin-bottom: 2px;
}

.console-line.output {
  padding-left: 12px;
}

.prompt {
  color: #4ade80;
  font-weight: bold;
}

.command {
  color: var(--text-primary);
}

.result {
  color: var(--text-secondary);
}

.cursor {
  color: var(--text-primary);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* Default Widget Styles */
.default-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
}
</style>

<style scoped>
/* Override vue-draggable-resizable default border */
.vdr {
  border: 2px solid transparent;
  position: absolute !important;
}

/* Widget container positioning */
.widget-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Make entire widget draggable when unlocked */
.editor-workspace:not(.locked) .vdr {
  cursor: move;
}

/* Reset cursor when locked */
.editor-workspace.locked .vdr {
  cursor: default;
}

/* Add border on hover (only when not locked) */
.editor-workspace:not(.locked) .vdr:hover {
  border: 2px dashed rgba(0, 123, 255, 0.5);
}

/* Add border only when active */
.vdr.active {
  border: 2px dashed #007bff;
}

/* Dark mode support for the hover border */
.dark-mode .editor-workspace:not(.locked) .vdr:hover {
  border: 2px dashed rgba(77, 171, 247, 0.5);
}

/* Dark mode support for the active border */
.dark-mode .vdr.active {
  border: 2px dashed #4dabf7;
}

/* Responsive widget styling */
.vdr[data-responsive='true'] {
  /* Add a subtle glow for responsive widgets */
  transition: box-shadow 0.3s ease;
}

/* Responsive hover effect (only when not locked) */
.editor-workspace:not(.locked) .vdr[data-responsive='true']:hover {
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
}

/* Responsive active state (only when not locked) */
.editor-workspace:not(.locked) .vdr[data-responsive='true'].active {
  border: 2px dashed #22c55e;
}

/* Dark mode responsive active state (only when not locked) */
.dark-mode .editor-workspace:not(.locked) .vdr[data-responsive='true'].active {
  border: 2px dashed #4ade80;
}

.widget-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  --wired-card-background-fill: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.widget-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 8px;
  border-bottom: 1px dashed var(--border-color);
  background: var(--bg-secondary);
  backdrop-filter: blur(4px);
  z-index: 1;
  /* Disable text selection on drag handle */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  /* Default state: hidden above the card */
  transform: translateY(-100%);
  transition:
    transform 0.3s ease,
    background-color 0.3s ease;
}

/* Hover state: slide down (only when not locked) */
.editor-workspace:not(.locked) .widget-card:hover .widget-header {
  transform: translateY(0);
}

/* Active/selected state: stay visible with different styling (only when not locked) */
.editor-workspace:not(.locked) .vdr.active .widget-header {
  transform: translateY(0);
  background: rgba(0, 123, 255, 0.15);
  border-bottom: 1px dashed #007bff;
}

/* Responsive widget active state */
.editor-workspace:not(.locked) .vdr[data-responsive='true'].active .widget-header {
  background: rgba(34, 197, 94, 0.15);
  border-bottom: 1px dashed #22c55e;
}

/* Dark mode active state (only when not locked) */
.dark-mode .editor-workspace:not(.locked) .vdr.active .widget-header {
  background: rgba(77, 171, 247, 0.15);
  border-bottom: 1px dashed #4dabf7;
}

/* Dark mode responsive active state */
.dark-mode .editor-workspace:not(.locked) .vdr[data-responsive='true'].active .widget-header {
  background: rgba(74, 222, 128, 0.15);
  border-bottom: 1px dashed #4ade80;
}

.widget-header h4 {
  margin: 0;
  font-size: 12px;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'Comic Sans MS', cursive, sans-serif;
  flex: 1;
}

.anchor-indicator {
  font-size: 10px;
  padding: 2px 4px;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 2px;
  color: var(--color-success, #16a34a);
  font-weight: bold;
}

/* Dark mode anchor indicator */
.dark-mode .anchor-indicator {
  background: rgba(74, 222, 128, 0.25);
  color: #4ade80;
}

.remove-btn {
  --wired-icon-button-color: var(--color-danger, #dc3545);
  --wired-icon-button-bg-color: transparent;
  font-size: 14px;
  font-weight: bold;
}

/* Dark mode remove button */
.dark-mode .remove-btn {
  --wired-icon-button-color: #f87171;
}

.widget-body {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  /* Ensure content is interactive even when parent has pointer-events disabled */
  pointer-events: auto;
}

.widget-body p {
  margin: 8px 0;
  color: var(--text-secondary);
  font-family: 'Comic Sans MS', cursive, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  /* Disable text selection on static text */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.widget-body p:first-child {
  font-weight: bold;
  color: var(--text-primary);
  font-size: 16px;
  /* Disable text selection on static text */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow text selection on input elements and other interactive content */
.widget-body input,
.widget-body textarea,
.widget-body [contenteditable] {
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
}

/* Custom resize edge detection zones */
.resize-edge {
  position: absolute;
  background: transparent;
  z-index: 2;
  pointer-events: auto;
}

.resize-edge-top {
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  cursor: ns-resize;
}

.resize-edge-right {
  top: 0;
  right: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
}

.resize-edge-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  cursor: ns-resize;
}

.resize-edge-left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
}

/* Custom resize corner detection zones */
.resize-corner {
  position: absolute;
  background: transparent;
  z-index: 3;
  width: 12px;
  height: 12px;
  pointer-events: auto;
}

.resize-corner-tl {
  top: 0;
  left: 0;
  cursor: nw-resize;
}

.resize-corner-tr {
  top: 0;
  right: 0;
  cursor: ne-resize;
}

.resize-corner-bl {
  bottom: 0;
  left: 0;
  cursor: ne-resize;
}

.resize-corner-br {
  bottom: 0;
  right: 0;
  cursor: nw-resize;
}

/* Hide default vue-draggable-resizable handles when custom resize is active */
.editor-workspace:not(.locked) .vdr:hover .resize-edge,
.editor-workspace:not(.locked) .vdr:hover .resize-corner {
  display: block;
}

/* Completely disable custom resize zones when locked */
.editor-workspace.locked .resize-edge,
.editor-workspace.locked .resize-corner {
  display: none !important;
  pointer-events: none !important;
}

/* Debug mode: uncomment to see the resize zones */
/*
.resize-edge {
  background: rgba(255, 0, 0, 0.1) !important;
}

.resize-corner {
  background: rgba(0, 255, 0, 0.3) !important;
}
*/
</style>
