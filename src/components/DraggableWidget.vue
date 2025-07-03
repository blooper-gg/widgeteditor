<template>
  <vue-draggable-resizable
    :w="calculatedPosition.width"
    :h="calculatedPosition.height"
    :x="calculatedPosition.x"
    :y="calculatedPosition.y"
    :min-width="widget.responsive?.minWidth || 80"
    :min-height="widget.responsive?.minHeight || 40"
    :max-width="widget.responsive?.maxWidth || containerDimensions.width"
    :max-height="widget.responsive?.maxHeight || containerDimensions.height"
    :grid="isShiftPressed ? [20, 20] : [1, 1]"
    :parent="true"
    :resizable="true"
    :draggable="true"
    :data-responsive="widget.responsive?.enabled ? 'true' : 'false'"
    @dragging="onDrag"
    @resizing="onResize"
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
      <div class="widget-header">
        <h4>{{ widget.name }}</h4>
        <div class="widget-controls">
          <span v-if="widget.responsive?.enabled" class="anchor-indicator">
            {{ widget.responsive.anchorEdges.vertical[0].toUpperCase()
            }}{{ widget.responsive.anchorEdges.horizontal[0].toUpperCase() }}
          </span>
          <wired-icon-button @click="removeWidget" class="remove-btn"> ✕ </wired-icon-button>
        </div>
      </div>

      <div class="widget-body">
        <p>{{ widget.type }} Widget</p>
        <p v-if="widget.responsive?.enabled" class="responsive-info">
          📍 Responsive: {{ Math.round(widget.responsive.widthPercent || 0) }}% ×
          {{ Math.round(widget.responsive.heightPercent || 0) }}%
        </p>
        <p v-else class="responsive-info">📐 Fixed: {{ widget.width }}px × {{ widget.height }}px</p>
        <input type="text" />
        <wired-button>Click me</wired-button>
        <wired-toggle />
      </div>
    </wired-card>
  </vue-draggable-resizable>
</template>

<script setup lang="ts">
import VueDraggableResizable from 'vue-draggable-resizable'
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
  updatePosition: [id: number, x: number, y: number]
  updateSize: [id: number, width: number, height: number]
  updatePositionAndSize: [id: number, x: number, y: number, width: number, height: number]
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
  // For responsive widgets, emit combined update to prevent race conditions
  if (props.widget.responsive?.enabled) {
    emit('updatePositionAndSize', props.widget.id, x, y, props.widget.width, props.widget.height)
  } else {
    emit('updatePosition', props.widget.id, x, y)
  }
}

const onResize = (x: number, y: number, width: number, height: number) => {
  // For responsive widgets, emit combined update to prevent race conditions
  if (props.widget.responsive?.enabled) {
    emit('updatePositionAndSize', props.widget.id, x, y, width, height)
  } else {
    emit('updatePosition', props.widget.id, x, y)
    emit('updateSize', props.widget.id, width, height)
  }
}

const removeWidget = () => {
  emit('remove', props.widget.id)
}

// Custom edge resize functionality
const startEdgeResize = (event: MouseEvent | TouchEvent, direction: string) => {
  if (props.isLocked) return

  event.preventDefault()
  event.stopPropagation()

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
  if (!isCustomResizing.value || !customResizeData.value) return

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
  const gridX = isShiftPressed.value ? 20 : 1
  const gridY = isShiftPressed.value ? 20 : 1

  // Calculate new dimensions based on direction
  switch (direction) {
    case 'top':
      newHeight = Math.max(
        props.widget.responsive?.minHeight || 40,
        customResizeData.value.startHeight - deltaY,
      )
      newY = customResizeData.value.startPosY + (customResizeData.value.startHeight - newHeight)
      break
    case 'right':
      newWidth = Math.max(
        props.widget.responsive?.minWidth || 80,
        customResizeData.value.startWidth + deltaX,
      )
      break
    case 'bottom':
      newHeight = Math.max(
        props.widget.responsive?.minHeight || 40,
        customResizeData.value.startHeight + deltaY,
      )
      break
    case 'left':
      newWidth = Math.max(
        props.widget.responsive?.minWidth || 80,
        customResizeData.value.startWidth - deltaX,
      )
      newX = customResizeData.value.startPosX + (customResizeData.value.startWidth - newWidth)
      break
    case 'tl':
      newWidth = Math.max(
        props.widget.responsive?.minWidth || 80,
        customResizeData.value.startWidth - deltaX,
      )
      newHeight = Math.max(
        props.widget.responsive?.minHeight || 40,
        customResizeData.value.startHeight - deltaY,
      )
      newX = customResizeData.value.startPosX + (customResizeData.value.startWidth - newWidth)
      newY = customResizeData.value.startPosY + (customResizeData.value.startHeight - newHeight)
      break
    case 'tr':
      newWidth = Math.max(
        props.widget.responsive?.minWidth || 80,
        customResizeData.value.startWidth + deltaX,
      )
      newHeight = Math.max(
        props.widget.responsive?.minHeight || 40,
        customResizeData.value.startHeight - deltaY,
      )
      newY = customResizeData.value.startPosY + (customResizeData.value.startHeight - newHeight)
      break
    case 'bl':
      newWidth = Math.max(
        props.widget.responsive?.minWidth || 80,
        customResizeData.value.startWidth - deltaX,
      )
      newHeight = Math.max(
        props.widget.responsive?.minHeight || 40,
        customResizeData.value.startHeight + deltaY,
      )
      newX = customResizeData.value.startPosX + (customResizeData.value.startWidth - newWidth)
      break
    case 'br':
      newWidth = Math.max(
        props.widget.responsive?.minWidth || 80,
        customResizeData.value.startWidth + deltaX,
      )
      newHeight = Math.max(
        props.widget.responsive?.minHeight || 40,
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
  const maxWidth = props.widget.responsive?.maxWidth || props.containerDimensions.width
  const maxHeight = props.widget.responsive?.maxHeight || props.containerDimensions.height

  newWidth = Math.min(maxWidth, newWidth)
  newHeight = Math.min(maxHeight, newHeight)

  // Ensure position stays within container bounds
  newX = Math.max(0, Math.min(props.containerDimensions.width - newWidth, newX))
  newY = Math.max(0, Math.min(props.containerDimensions.height - newHeight, newY))

  // Emit the resize event
  if (props.widget.responsive?.enabled) {
    emit('updatePositionAndSize', props.widget.id, newX, newY, newWidth, newHeight)
  } else {
    emit('updatePosition', props.widget.id, newX, newY)
    emit('updateSize', props.widget.id, newWidth, newHeight)
  }
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

/* Show resize handles when active */
.vdr.active .handle {
  display: block !important;
}
</style>

<style scoped>
/* Override vue-draggable-resizable default border */
.vdr {
  border: 2px solid transparent;
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

.vdr[data-responsive='true']:hover {
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
}

.vdr[data-responsive='true'].active {
  border: 2px dashed #22c55e;
}

.dark-mode .vdr[data-responsive='true'].active {
  border: 2px dashed #4ade80;
}

.widget-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  --wired-card-background-fill: white;
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
  border-bottom: 1px dashed #666;
  background: rgba(248, 248, 248, 0.95);
  backdrop-filter: blur(4px);
  z-index: 10;
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
  color: #333;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  flex: 1;
}

.widget-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.anchor-indicator {
  font-size: 10px;
  padding: 2px 4px;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 2px;
  color: #16a34a;
  font-weight: bold;
}

.remove-btn {
  --wired-icon-button-color: #ff4444;
  --wired-icon-button-bg-color: transparent;
  font-size: 14px;
  font-weight: bold;
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
  color: #555;
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
  color: #333;
  font-size: 16px;
  /* Disable text selection on static text */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.responsive-info {
  font-size: 12px !important;
  color: #666 !important;
  margin: 4px 0 !important;
  font-family: 'Courier New', monospace !important;
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
  z-index: 100;
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
  z-index: 101;
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
