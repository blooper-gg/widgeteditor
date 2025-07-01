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
    <div class="widget-content">
      <div class="widget-header">
        <h4>{{ widget.name }}</h4>
        <button @click="removeWidget" class="remove-btn">✕</button>
      </div>

      <div class="widget-body">
        <p>{{ widget.type }} Widget</p>
        <p>Drag me around and resize me!</p>
      </div>
    </div>
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
@import "vue-draggable-resizable/style.css";
</style>

<style scoped>
.widget-content {
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  cursor: move;
}

.widget-header h4 {
  margin: 0;
  font-size: 14px;
}

.remove-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 2px 6px;
  cursor: pointer;
  font-size: 12px;
}

.widget-body {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.widget-body p {
  margin: 4px 0;
  color: #666;
}
</style>