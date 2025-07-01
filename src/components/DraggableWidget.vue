<template>
  <vue-draggable-resizable
    :w="widget.width"
    :h="widget.height"
    :x="widget.x"
    :y="widget.y"
    :parent="true"
    :resizable="true"
    :draggable="true"
    @dragging="onDrag"
    @resizing="onResize"
  >
    <wired-card elevation="2" class="widget-card">
      <div class="widget-header">
        <h4>{{ widget.name }}</h4>
        <wired-icon-button @click="removeWidget" class="remove-btn"> ✕ </wired-icon-button>
      </div>

      <div class="widget-body">
        <p>{{ widget.type }} Widget</p>
        <p>Drag me around and resize me!</p>
      </div>
    </wired-card>
  </vue-draggable-resizable>
</template>

<script setup lang="ts">
import VueDraggableResizable from 'vue-draggable-resizable'

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
}>()

// Emits
const emit = defineEmits<{
  remove: [id: number]
  updatePosition: [id: number, x: number, y: number]
  updateSize: [id: number, width: number, height: number]
}>()

const onDrag = (x: number, y: number) => {
  emit('updatePosition', props.widget.id, x, y)
}

const onResize = (x: number, y: number, width: number, height: number) => {
  emit('updatePosition', props.widget.id, x, y)
  emit('updateSize', props.widget.id, width, height)
}

const removeWidget = () => {
  emit('remove', props.widget.id)
}
</script>

<style>
@import 'vue-draggable-resizable/style.css';
</style>

<style scoped>
/* Override vue-draggable-resizable default border */
.vdr {
  border: 2px solid transparent !important;
}

/* Add border only when active */
.vdr.active {
  border: 2px dashed #007bff !important;
}

/* Dark mode support for the active border */
.dark-mode .vdr.active {
  border: 2px dashed #4dabf7 !important;
}

.widget-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  --wired-card-background-fill: white;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 2px solid #666;
  cursor: move;
  background: rgba(248, 248, 248, 0.8);
}

.widget-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  font-family: 'Comic Sans MS', cursive, sans-serif;
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
}

.widget-body p {
  margin: 8px 0;
  color: #555;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  font-size: 14px;
  line-height: 1.4;
}

.widget-body p:first-child {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}
</style>
