<template>
  <div class="editor-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <!-- Lock/Unlock Toggle -->
      <div class="lock-section">
        <wired-toggle :checked="isLocked" @change="toggleLock"></wired-toggle>
        <span class="lock-label">{{ isLocked ? '🔒 Locked' : '🔓 Unlocked' }}</span>
      </div>

      <!-- Add Widget Button (only when unlocked) -->
      <wired-button v-if="!isLocked" @click="addWidget" elevation="2">+ Add Widget</wired-button>

      <!-- View Management Buttons -->
      <div class="view-controls">
        <wired-button @click="resetView" elevation="1">🗑️ Reset View</wired-button>
        <wired-button @click="exportView" elevation="1">📤 Export View</wired-button>
        <wired-button @click="importView" elevation="1">📥 Import View</wired-button>
      </div>

      <!-- Hidden file input for import -->
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        @change="handleFileImport"
        style="display: none"
      />
    </div>

    <!-- Main Editor Area -->
    <div class="editor-workspace" :class="{ locked: isLocked }">
      <div class="welcome-message" v-if="widgets.length === 0">
        <h2>Welcome to Widget Editor</h2>
        <p v-if="isLocked">View is locked - unlock to start adding widgets</p>
        <p v-else>Click "Add Widget" to start building your view</p>
        <div class="welcome-icon">🎮</div>
      </div>

      <!-- Widgets -->
      <DraggableWidget
        v-for="widget in widgets"
        :key="widget.id"
        :widget="widget"
        @remove="removeWidget"
        @update-position="updateWidgetPosition"
        @update-size="updateWidgetSize"
      />
    </div>

    <!-- Widget Properties Panel -->
    <div class="properties-panel" v-if="selectedWidget && !isLocked">
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

interface ViewData {
  widgets: Widget[]
  metadata: {
    name: string
    createdAt: string
    version: string
  }
}

// Reactive data
const widgets = ref<Widget[]>([])
const selectedWidget = ref<Widget | null>(null)
const isLocked = ref(false)
const fileInput = ref<HTMLInputElement>()
let nextId = 1

// Methods
const toggleLock = (event: CustomEvent) => {
  isLocked.value = event.detail.checked
  if (isLocked.value) {
    // When locking, deselect any selected widget
    selectedWidget.value = null
  }
}

const addWidget = () => {
  if (isLocked.value) return

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
  if (isLocked.value) return

  const index = widgets.value.findIndex((w) => w.id === id)
  if (index !== -1) {
    if (selectedWidget.value?.id === id) {
      selectedWidget.value = null
    }
    widgets.value.splice(index, 1)
  }
}

const resetView = () => {
  if (confirm('Are you sure you want to reset the view? This will remove all widgets.')) {
    widgets.value = []
    selectedWidget.value = null
    nextId = 1
  }
}

const exportView = () => {
  const viewData: ViewData = {
    widgets: widgets.value,
    metadata: {
      name: 'Widget View',
      createdAt: new Date().toISOString(),
      version: '1.0.0',
    },
  }

  const jsonString = JSON.stringify(viewData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `widget-view-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const importView = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const viewData: ViewData = JSON.parse(content)

        if (viewData.widgets && Array.isArray(viewData.widgets)) {
          widgets.value = viewData.widgets
          selectedWidget.value = null

          // Update nextId to avoid conflicts
          if (viewData.widgets.length > 0) {
            nextId = Math.max(...viewData.widgets.map((w) => w.id)) + 1
          }

          console.log('View imported successfully:', viewData.metadata)
        } else {
          alert('Invalid view file format')
        }
      } catch (error) {
        console.error('Error importing view:', error)
        alert('Error importing view file')
      }
    }
    reader.readAsText(file)
  }

  // Reset the input
  if (target) target.value = ''
}

const updateWidgetPosition = (id: number, x: number, y: number) => {
  if (isLocked.value) return

  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.x = x
    widget.y = y
  }
}

const updateWidgetSize = (id: number, width: number, height: number) => {
  if (isLocked.value) return

  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.width = width
    widget.height = height
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

// Load saved view on mount
onMounted(() => {
  const saved = localStorage.getItem('widget-view')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.widgets) {
        widgets.value = parsed.widgets
        if (parsed.widgets.length > 0) {
          nextId = Math.max(...parsed.widgets.map((w: Widget) => w.id)) + 1
        }
      }
    } catch (error) {
      console.warn('Failed to load saved view:', error)
    }
  }
})

// Auto-save to localStorage
const saveToLocalStorage = () => {
  const viewData: ViewData = {
    widgets: widgets.value,
    metadata: {
      name: 'Auto-saved View',
      createdAt: new Date().toISOString(),
      version: '1.0.0',
    },
  }
  localStorage.setItem('widget-view', JSON.stringify(viewData))
}

// Watch for changes and auto-save
import { watch } from 'vue'
watch(widgets, saveToLocalStorage, { deep: true })
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
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow);
  flex-wrap: wrap;
}

.lock-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-tertiary);
}

.lock-label {
  font-weight: 500;
  color: var(--text-primary);
  min-width: 80px;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.editor-workspace {
  flex: 1;
  position: relative;
  background: var(--bg-primary);
  background-image: radial-gradient(circle, var(--border-color) 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: hidden;
}

/* Canvas-level locking: disable widget manipulation but allow content interaction */
.editor-workspace.locked .vdr {
  /* Disable dragging and resizing */
  pointer-events: none;
}

/* Re-enable pointer events for widget content */
.editor-workspace.locked .widget-card .widget-body {
  pointer-events: auto;
}

/* Disable hover effects when canvas is locked */
.editor-workspace.locked .widget-card:hover .widget-header {
  transform: translateY(-100%) !important;
}

/* Also disable the hover transition entirely when locked */
.editor-workspace.locked .widget-header {
  transform: translateY(-100%) !important;
  transition: none !important;
}

/* Disable active states when canvas is locked */
.editor-workspace.locked .vdr.active {
  border: 2px solid transparent !important;
}

.editor-workspace.locked .vdr.active .widget-header {
  transform: translateY(-100%) !important;
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

/* Responsive design */
@media (max-width: 768px) {
  .toolbar {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .view-controls {
    margin-left: 0;
    flex-wrap: wrap;
  }
}
</style>
