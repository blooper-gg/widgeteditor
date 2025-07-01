<template>
  <div class="editor-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <wired-button @click="addWidget" elevation="2">+ Add Widget</wired-button>
      <wired-button @click="resetLayout" elevation="1">Reset Layout</wired-button>
      <wired-button @click="saveLayout" elevation="1">Save Layout</wired-button>
    </div>

    <!-- Main Editor Area -->
    <div class="editor-workspace">
      <div class="welcome-message" v-if="widgets.length === 0">
        <h2>Welcome to Game Engine Editor</h2>
        <p>Click "Add Widget" to start building your interface</p>
        <div class="welcome-icon">🎮</div>
      </div>

      <!-- Widgets -->
      <DraggableWidget
        v-for="widget in widgets"
        :key="widget.id"
        :widget="widget"
        @remove="removeWidget"
        @update-position="updateWidgetPosition"
      />
    </div>

    <!-- Widget Properties Panel -->
    <div class="properties-panel" v-if="selectedWidget">
      <wired-card>
        <h3>Widget Properties</h3>
        <div class="property-group">
          <label>Name:</label>
          <wired-input
            :value="selectedWidget.name"
            @input="updateWidgetName"
            placeholder="Widget name"
          ></wired-input>
        </div>
        <div class="property-group">
          <label>Type:</label>
          <wired-listbox :selected="selectedWidget.type" @selected="updateWidgetType">
            <wired-item value="button">Button</wired-item>
            <wired-item value="text">Text</wired-item>
            <wired-item value="input">Input</wired-item>
            <wired-item value="canvas">Canvas</wired-item>
          </wired-listbox>
        </div>
      </wired-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DraggableWidget from '@/components/DraggableWidget.vue'

// Types
interface Widget {
  id: number
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
}

// Reactive data
const widgets = ref<Widget[]>([])
const selectedWidget = ref<Widget | null>(null)
let nextId = 1

// Methods
const addWidget = () => {
  const newWidget: Widget = {
    id: nextId++,
    name: `Widget ${nextId - 1}`,
    type: 'button',
    x: Math.random() * 400 + 50,
    y: Math.random() * 300 + 50,
    width: 200,
    height: 150,
  }
  widgets.value.push(newWidget)
  selectedWidget.value = newWidget
}

const removeWidget = (id: number) => {
  const index = widgets.value.findIndex((w) => w.id === id)
  if (index !== -1) {
    if (selectedWidget.value?.id === id) {
      selectedWidget.value = null
    }
    widgets.value.splice(index, 1)
  }
}

const resetLayout = () => {
  widgets.value = []
  selectedWidget.value = null
  nextId = 1
}

const saveLayout = () => {
  const layout = JSON.stringify(widgets.value, null, 2)
  console.log('Layout saved:', layout)
  localStorage.setItem('widget-layout', layout)
}

const updateWidgetPosition = (id: number, x: number, y: number) => {
  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.x = x
    widget.y = y
  }
}

const updateWidgetName = (event: Event) => {
  if (selectedWidget.value) {
    selectedWidget.value.name = (event.target as HTMLInputElement).value
  }
}

const updateWidgetType = (event: CustomEvent) => {
  if (selectedWidget.value) {
    selectedWidget.value.type = event.detail.selected
  }
}

// Load saved layout on mount
onMounted(() => {
  const saved = localStorage.getItem('widget-layout')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      widgets.value = parsed
      if (parsed.length > 0) {
        nextId = Math.max(...parsed.map((w: Widget) => w.id)) + 1
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      console.warn('Failed to load saved layout')
    }
  }
})
</script>

<style scoped>
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.toolbar {
  background: var(--bg-secondary);
  padding: 1rem;
  border-bottom: 2px solid var(--border-color);
  display: flex;
  gap: 1rem;
  box-shadow: var(--shadow);
}

.editor-workspace {
  flex: 1;
  position: relative;
  background: var(--bg-primary);
  background-image: radial-gradient(circle, var(--border-color) 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: hidden;
}

.welcome-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-secondary);
}

.welcome-message h2 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.welcome-message p {
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.welcome-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.properties-panel {
  position: fixed;
  top: 100px;
  right: 20px;
  width: 300px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--shadow);
  z-index: 1000;
  border: 1px solid var(--border-color);
}

.properties-panel h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.property-group {
  margin-bottom: 1rem;
}

.property-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
}
</style>
