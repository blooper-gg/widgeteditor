<template>
  <vue-draggable-resizable
    :w="widget.width"
    :h="widget.height"
    :x="widget.x"
    :y="widget.y"
    :parent="true"
    :resizable="true"
    :draggable="true"
    drag-handle=".widget-header"
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
        <input type="text" />
        <wired-button>Click me</wired-button>
        <wired-toggle />
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
  border: 2px solid transparent;
}

/* Add border only when active */
.vdr.active {
  border: 2px dashed #007bff;
}

/* Dark mode support for the active border */
.dark-mode .vdr.active {
  border: 2px dashed #4dabf7;
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
  cursor: move;
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

/* Dark mode active state (only when not locked) */
.dark-mode .editor-workspace:not(.locked) .vdr.active .widget-header {
  background: rgba(77, 171, 247, 0.15);
  border-bottom: 1px dashed #4dabf7;
}

.widget-header h4 {
  margin: 0;
  font-size: 12px;
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

/* Allow text selection on input elements and other interactive content */
.widget-body input,
.widget-body textarea,
.widget-body [contenteditable] {
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
}
</style>
