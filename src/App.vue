<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <nav>
      <div class="nav-brand">
        <h1>blooper editor</h1>
      </div>

      <!-- Widget Editor Controls -->
      <div class="widget-controls" v-if="isWidgetEditor">
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
      </div>

      <div class="nav-controls">
        <wired-toggle v-if="mounted" :checked="isDarkMode" @change="toggleDarkMode"></wired-toggle>
        <span class="dark-mode-label">{{ isDarkMode ? 'Dark' : 'Light' }}</span>
      </div>

      <!-- Hidden file input for import -->
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        @change="handleFileImport"
        style="display: none"
      />
    </nav>

    <main>
      <RouterView
        v-if="isWidgetEditor"
        :widgets="widgets"
        :selected-widget="selectedWidget"
        :is-locked="isLocked"
        @remove-widget="removeWidget"
        @update-widget-position="updateWidgetPosition"
        @update-widget-size="updateWidgetSize"
        @update-widget-position-and-size="updateWidgetPositionAndSize"
        @update-widget-name="updateWidgetName"
        @update-widget-type="updateWidgetType"
        @update-widgets-responsive="updateWidgetsResponsive"
        @select-widget="selectWidget"
      />
      <RouterView v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import type { Widget } from '@/types/widget'
import {
  updateWidgetResponsive,
  updateWidgetPositionAndSize as updateWidgetPositionAndSizeUtil,
  getContainerDimensions,
  convertWidgetToResponsive,
} from '@/utils/responsive-positioning'

// Types
interface ViewData {
  widgets: Widget[]
  metadata: {
    name: string
    createdAt: string
    version: string
  }
}

const isDarkMode = ref(false)
const mounted = ref(false)
const route = useRoute()

// Widget Editor State
const widgets = ref<Widget[]>([])
const selectedWidget = ref<Widget | null>(null)
const isLocked = ref(false)
const fileInput = ref<HTMLInputElement>()
let nextId = 1

// Check if we're on the widget editor route
const isWidgetEditor = computed(() => {
  return route.name === 'home' || route.path === '/'
})

// Dark mode methods
const toggleDarkMode = (event: CustomEvent) => {
  isDarkMode.value = event.detail.checked
  localStorage.setItem('dark-mode', JSON.stringify(isDarkMode.value))
}

// Widget Editor Methods
const toggleLock = (event: CustomEvent) => {
  isLocked.value = event.detail.checked
  if (isLocked.value) {
    // When locking, deselect any selected widget
    selectedWidget.value = null
  }
}

const addWidget = () => {
  if (isLocked.value) return

  // Get container dimensions for responsive positioning
  const editorWorkspace = document.querySelector('.editor-workspace')
  const container = editorWorkspace
    ? getContainerDimensions(editorWorkspace as HTMLElement)
    : { width: 1200, height: 800 }

  const baseX = Math.random() * 400 + 50
  const baseY = Math.random() * 300 + 50
  const baseWidth = 200
  const baseHeight = 150

  const newWidget: Widget = {
    id: nextId++,
    name: `Widget ${nextId - 1}`,
    type: 'button',
    x: baseX,
    y: baseY,
    width: baseWidth,
    height: baseHeight,
  }

  // Convert to responsive positioning using the utility function
  const responsiveWidget = convertWidgetToResponsive(newWidget, container)

  widgets.value.push(responsiveWidget)
  selectedWidget.value = responsiveWidget
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
          // Convert imported widgets to responsive positioning if they don't have it
          const editorWorkspace = document.querySelector('.editor-workspace')
          const container = editorWorkspace
            ? getContainerDimensions(editorWorkspace as HTMLElement)
            : { width: 1200, height: 800 }

          widgets.value = viewData.widgets.map((widget: Widget) => {
            if (!widget.responsive?.enabled) {
              // Convert legacy widgets to responsive positioning using utility function
              return convertWidgetToResponsive(widget, container)
            }
            return widget
          })

          selectedWidget.value = null

          // Update nextId to avoid conflicts
          if (widgets.value.length > 0) {
            nextId = Math.max(...widgets.value.map((w) => w.id)) + 1
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

    // Update responsive configuration if enabled
    if (widget.responsive?.enabled) {
      const editorWorkspace = document.querySelector('.editor-workspace')
      if (editorWorkspace) {
        const container = getContainerDimensions(editorWorkspace as HTMLElement)
        const updatedWidget = updateWidgetResponsive(
          widget,
          x,
          y,
          widget.width,
          widget.height,
          container,
        )

        // Update the widget in the array
        const index = widgets.value.findIndex((w) => w.id === id)
        if (index !== -1) {
          widgets.value[index] = updatedWidget
        }
      }
    }
  }
}

const updateWidgetSize = (id: number, width: number, height: number) => {
  if (isLocked.value) return

  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.width = width
    widget.height = height

    // Update responsive configuration if enabled
    if (widget.responsive?.enabled) {
      const editorWorkspace = document.querySelector('.editor-workspace')
      if (editorWorkspace) {
        const container = getContainerDimensions(editorWorkspace as HTMLElement)
        const updatedWidget = updateWidgetResponsive(
          widget,
          widget.x,
          widget.y,
          width,
          height,
          container,
        )

        // Update the widget in the array
        const index = widgets.value.findIndex((w) => w.id === id)
        if (index !== -1) {
          widgets.value[index] = updatedWidget
        }
      }
    }
  }
}

const updateWidgetPositionAndSize = (
  id: number,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  if (isLocked.value) return

  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    const editorWorkspace = document.querySelector('.editor-workspace')
    if (editorWorkspace) {
      const container = getContainerDimensions(editorWorkspace as HTMLElement)
      const updatedWidget = updateWidgetPositionAndSizeUtil(widget, x, y, width, height, container)

      // Update the widget in the array
      const index = widgets.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        widgets.value[index] = updatedWidget
      }
    }
  }
}

const updateWidgetName = (id: number, name: string) => {
  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.name = name
  }
}

const updateWidgetType = (id: number, type: string) => {
  const widget = widgets.value.find((w) => w.id === id)
  if (widget) {
    widget.type = type
  }
}

const updateWidgetsResponsive = (updatedWidgets: Widget[]) => {
  widgets.value = updatedWidgets

  // Update selected widget if it was modified
  if (selectedWidget.value) {
    const updatedSelected = updatedWidgets.find((w) => w.id === selectedWidget.value?.id)
    if (updatedSelected) {
      selectedWidget.value = updatedSelected
    }
  }
}

const selectWidget = (widget: Widget | null) => {
  if (!isLocked.value) {
    selectedWidget.value = widget
  }
}

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

// Update CSS custom property for editor height
const updateEditorHeight = () => {
  const nav = document.querySelector('nav')
  if (nav) {
    const navHeight = nav.offsetHeight
    document.documentElement.style.setProperty('--editor-height', `calc(100vh - ${navHeight}px)`)
  }
}

onMounted(() => {
  mounted.value = true
  const saved = localStorage.getItem('dark-mode')
  if (saved) {
    isDarkMode.value = JSON.parse(saved)
  }

  // Load saved widget view
  const savedView = localStorage.getItem('widget-view')
  if (savedView) {
    try {
      const parsed = JSON.parse(savedView)
      if (parsed.widgets) {
        // Convert existing widgets to responsive positioning if they don't have it
        const editorWorkspace = document.querySelector('.editor-workspace')
        const container = editorWorkspace
          ? getContainerDimensions(editorWorkspace as HTMLElement)
          : { width: 1200, height: 800 }

        widgets.value = parsed.widgets.map((widget: Widget) => {
          if (!widget.responsive?.enabled) {
            // Convert legacy widgets to responsive positioning using utility function
            return convertWidgetToResponsive(widget, container)
          }
          return widget
        })

        if (widgets.value.length > 0) {
          nextId = Math.max(...widgets.value.map((w: Widget) => w.id)) + 1
        }
      }
    } catch (error) {
      console.warn('Failed to load saved view:', error)
    }
  }

  // Set initial editor height and update on resize
  updateEditorHeight()
  window.addEventListener('resize', updateEditorHeight)

  // Use ResizeObserver to watch for toolbar size changes
  const nav = document.querySelector('nav')
  if (nav && window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(updateEditorHeight)
    resizeObserver.observe(nav)
  }
})

// Watch for changes and auto-save
watch(widgets, saveToLocalStorage, { deep: true })
</script>

<style>
@import 'vue-draggable-resizable/style.css';
/* Global reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  font-family: 'Segoe UI', 'Comic Sans MS', cursive, sans-serif;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #333333;
  transition: all 0.3s ease;
}

/* Light mode (default) */
#app {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Dark mode */
#app.dark-mode {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #404040;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --border-color: #555555;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  background: var(--bg-primary);
  color: var(--text-primary);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--border-color);
  box-shadow: var(--shadow);
  min-height: 70px;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
  font-weight: bold;
}

.widget-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
  justify-content: center;
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
}

.nav-center {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.nav-center wired-button {
  font-size: 1rem !important;
  padding: 0.5rem 1rem !important;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark-mode-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

main {
  height: var(--editor-height, calc(100vh - 70px)); /* Fallback height if JS hasn't run yet */
  overflow: hidden;
  background: var(--bg-primary);
}

/* Wired elements styling */
wired-button {
  --wired-button-bg-color: var(--bg-tertiary) !important;
  --wired-button-color: var(--text-primary) !important;
  --wired-button-border-color: var(--border-color) !important;
  transition: all 0.2s ease !important;
  font-weight: 500 !important;
}

wired-button:hover {
  transform: translateY(-1px);
  --wired-button-bg-color: var(--bg-secondary) !important;
  --wired-button-border-color: var(--text-primary) !important;
}

.nav-center .active > wired-button {
  --wired-button-bg-color: var(--text-primary) !important;
  --wired-button-color: var(--bg-primary) !important;
  --wired-button-border-color: var(--text-primary) !important;
}

wired-toggle {
  --wired-toggle-bg-color: var(--bg-tertiary) !important;
  --wired-toggle-color: var(--text-primary) !important;
  --wired-toggle-knob-color: var(--bg-primary) !important;
  --wired-toggle-knob-off-color: var(--text-secondary) !important;
}

wired-card {
  --wired-card-bg-color: var(--bg-secondary) !important;
  --wired-card-color: var(--text-primary) !important;
}

wired-input {
  --wired-input-color: var(--text-primary) !important;
  --wired-input-bg-color: var(--bg-primary) !important;
}

wired-listbox {
  --wired-listbox-bg-color: var(--bg-primary) !important;
  --wired-listbox-color: var(--text-primary) !important;
}

/* Responsive design */
@media (max-width: 768px) {
  nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-brand h1 {
    font-size: 1.2rem;
  }

  .widget-controls {
    justify-content: center;
    flex-direction: column;
    gap: 0.5rem;
  }

  .widget-controls .lock-section {
    order: -1;
  }

  .view-controls {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .nav-center {
    justify-content: center;
  }

  .nav-controls {
    justify-content: center;
  }
}
</style>
