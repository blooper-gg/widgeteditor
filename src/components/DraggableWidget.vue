<template>
  <wired-card
    ref="widgetRef"
    class="draggable-widget"
    :class="{
      selected: isSelected,
      dragging: isDragging,
    }"
    :style="{
      position: 'absolute',
      left: widget.x + 'px',
      top: widget.y + 'px',
      width: widget.width + 'px',
      height: widget.height + 'px',
      cursor: isDragging ? 'grabbing' : 'grab',
    }"
    @mousedown="startDrag"
    @click="selectWidget"
  >
    <div class="widget-header">
      <h4>{{ widget.name }}</h4>
      <wired-button @click="removeWidget" class="remove-btn" elevation="1"> ✕ </wired-button>
    </div>

    <div class="widget-content">
      <div v-if="widget.type === 'button'" class="widget-preview">
        <wired-button>Sample Button</wired-button>
        <p class="widget-type-label">Button Widget</p>
      </div>

      <div v-else-if="widget.type === 'text'" class="widget-preview">
        <p class="sample-text">Lorem ipsum dolor sit amet</p>
        <p class="widget-type-label">Text Widget</p>
      </div>

      <div v-else-if="widget.type === 'input'" class="widget-preview">
        <wired-input placeholder="Sample input"></wired-input>
        <p class="widget-type-label">Input Widget</p>
      </div>

      <div v-else-if="widget.type === 'canvas'" class="widget-preview">
        <canvas ref="canvasRef" width="150" height="80" class="sample-canvas"></canvas>
        <p class="widget-type-label">Canvas Widget</p>
      </div>
    </div>

    <!-- Selection indicator -->
    <div v-if="isSelected" class="selection-indicator">
      <div class="selection-corner top-left"></div>
      <div class="selection-corner top-right"></div>
      <div class="selection-corner bottom-left"></div>
      <div class="selection-corner bottom-right"></div>
    </div>
  </wired-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import 'wired-elements'

// Define the Widget interface
interface Widget {
  id: number
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
}

// Props
const props = defineProps<{
  widget: Widget
  isSelected?: boolean
}>()

// Emits
const emit = defineEmits<{
  remove: [id: number]
  updatePosition: [id: number, x: number, y: number]
  select: [widget: Widget]
}>()

// Reactive data
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const widgetRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()

// Methods
const startDrag = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest('.remove-btn')) {
    return // Don't start drag if clicking remove button
  }

  isDragging.value = true
  dragStart.value = {
    x: event.clientX - props.widget.x,
    y: event.clientY - props.widget.y,
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  event.preventDefault()
  event.stopPropagation()
}

const onDrag = (event: MouseEvent) => {
  if (!isDragging.value) return

  const newX = Math.max(0, event.clientX - dragStart.value.x)
  const newY = Math.max(0, event.clientY - dragStart.value.y)

  emit('updatePosition', props.widget.id, newX, newY)
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const removeWidget = (event: Event) => {
  event.stopPropagation()
  emit('remove', props.widget.id)
}

const selectWidget = (event: Event) => {
  if (!isDragging.value) {
    event.stopPropagation()
    emit('select', props.widget)
  }
}

const drawSampleCanvas = () => {
  if (!canvasRef.value) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Clear canvas
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, 150, 80)

  // Draw some sample graphics
  ctx.fillStyle = '#007bff'
  ctx.fillRect(10, 10, 30, 30)

  ctx.fillStyle = '#28a745'
  ctx.beginPath()
  ctx.arc(70, 25, 15, 0, 2 * Math.PI)
  ctx.fill()

  ctx.fillStyle = '#dc3545'
  ctx.beginPath()
  ctx.moveTo(110, 10)
  ctx.lineTo(130, 10)
  ctx.lineTo(120, 30)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#333'
  ctx.font = '12px Arial'
  ctx.fillText('Sample Canvas', 25, 60)
}

onMounted(() => {
  if (props.widget.type === 'canvas') {
    drawSampleCanvas()
  }
})
</script>

<style scoped>
.draggable-widget {
  user-select: none;
  background: var(--bg-secondary) !important;
  border: 2px solid var(--border-color) !important;
  z-index: 10;
  transition: all 0.2s ease;
  position: relative;
}

.draggable-widget:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 20;
  border-color: #007bff !important;
}

.draggable-widget.selected {
  border-color: #007bff !important;
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.3) !important;
  z-index: 30;
}

.draggable-widget.dragging {
  z-index: 100;
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25) !important;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.widget-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.remove-btn {
  font-size: 12px !important;
  line-height: 1 !important;
  padding: 4px 8px !important;
  min-width: 20px !important;
  height: 20px !important;
  background: #dc3545 !important;
  color: white !important;
}

.remove-btn:hover {
  background: #c82333 !important;
  transform: scale(1.1);
}

.widget-content {
  text-align: center;
  padding: 0.5rem;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.widget-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.widget-type-label {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-style: italic;
}

.sample-text {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
  padding: 0.5rem;
}

.sample-canvas {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: #f8f9fa;
}

.selection-indicator {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  pointer-events: none;
}

.selection-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #007bff;
  border: 1px solid white;
  border-radius: 2px;
}

.selection-corner.top-left {
  top: 0;
  left: 0;
}

.selection-corner.top-right {
  top: 0;
  right: 0;
}

.selection-corner.bottom-left {
  bottom: 0;
  left: 0;
}

.selection-corner.bottom-right {
  bottom: 0;
  right: 0;
}

/* Responsive widget content */
@media (max-width: 768px) {
  .widget-header h4 {
    font-size: 0.8rem;
  }

  .sample-canvas {
    width: 120px;
    height: 60px;
  }
}
</style>
