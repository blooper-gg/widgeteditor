<template>
  <div class="editor-container">
    <!-- Main Editor Area -->
    <div ref="editorWorkspace" class="editor-workspace" :class="{ locked: isLocked }">
      <div class="welcome-message" v-if="widgets.length === 0">
        <h2>Welcome to Widget Editor</h2>
        <p v-if="isLocked">View is locked - unlock to start adding widgets</p>
        <p v-else>Click "Add Widget" to start building your responsive view</p>
        <div class="welcome-feature">
          <span class="feature-icon">📍</span>
          <span class="feature-text">All widgets use responsive positioning by default</span>
        </div>
        <div class="welcome-icon">🎮</div>
      </div>

      <!-- Widgets -->
      <DraggableWidget
        v-for="widget in widgets"
        :key="widget.id"
        :widget="widget"
        :container-dimensions="containerDimensions"
        @remove="(id) => $emit('remove-widget', id)"
        @update-position="(id, x, y) => $emit('update-widget-position', id, x, y)"
        @update-size="(id, width, height) => $emit('update-widget-size', id, width, height)"
        @update-position-and-size="
          (id, x, y, width, height) =>
            $emit('update-widget-position-and-size', id, x, y, width, height)
        "
        @click="$emit('select-widget', widget)"
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
            @input="handleNameChange"
            placeholder="Widget name"
          ></wired-input>
        </div>
        <div class="property-group">
          <label>Type:</label>
          <wired-listbox :selected="selectedWidget.type" @selected="handleTypeChange">
            <wired-item value="button">Button</wired-item>
            <wired-item value="text">Text</wired-item>
            <wired-item value="input">Input</wired-item>
            <wired-item value="canvas">Canvas</wired-item>
          </wired-listbox>
        </div>
        <div class="property-group">
          <label>
            <wired-checkbox
              :checked="selectedWidget.responsive?.enabled || false"
              @change="handleResponsiveToggle"
            />
            Responsive Positioning
            <span class="default-badge">Default</span>
          </label>
          <p class="property-description">
            Widget adapts to window resizing and anchors to nearest edges
          </p>
        </div>
        <div class="property-group">
          <label>Anchored to:</label>
          <p class="anchor-info">
            {{ selectedWidget.responsive?.anchorEdges?.vertical || 'top' }} -
            {{ selectedWidget.responsive?.anchorEdges?.horizontal || 'left' }}
          </p>
          <p class="anchor-description">
            Widget stays positioned relative to these edges when window resizes
          </p>
        </div>
      </wired-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import DraggableWidget from '@/components/DraggableWidget.vue'
import type { Widget, ContainerDimensions } from '@/types/widget'
import {
  getContainerDimensions,
  debounce,
  convertWidgetToResponsive,
  recalculateAllWidgetPositions,
} from '@/utils/responsive-positioning'

// Props
interface Props {
  widgets: Widget[]
  selectedWidget: Widget | null
  isLocked: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'remove-widget': [id: number]
  'update-widget-position': [id: number, x: number, y: number]
  'update-widget-size': [id: number, width: number, height: number]
  'update-widget-position-and-size': [
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ]
  'update-widget-name': [id: number, name: string]
  'update-widget-type': [id: number, type: string]
  'select-widget': [widget: Widget | null]
  'update-widgets-responsive': [widgets: Widget[]]
}>()

// Refs
const editorWorkspace = ref<HTMLElement>()
const containerDimensions = ref<ContainerDimensions>({ width: 1200, height: 800 })

// Methods
const handleNameChange = (event: Event) => {
  if (props.selectedWidget) {
    emit('update-widget-name', props.selectedWidget.id, (event.target as HTMLInputElement).value)
  }
}

const handleTypeChange = (event: CustomEvent) => {
  if (props.selectedWidget) {
    emit('update-widget-type', props.selectedWidget.id, event.detail.selected)
  }
}

const handleResponsiveToggle = (event: CustomEvent) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const container = getContainerDimensions(editorWorkspace.value)
    let updatedWidget: Widget

    if (event.detail.checked) {
      // Enable responsive positioning
      updatedWidget = convertWidgetToResponsive(props.selectedWidget, container)
    } else {
      // Disable responsive positioning
      updatedWidget = {
        ...props.selectedWidget,
        responsive: {
          ...props.selectedWidget.responsive,
          enabled: false,
          anchorEdges: props.selectedWidget.responsive?.anchorEdges || {
            horizontal: 'left',
            vertical: 'top',
          },
        },
      }
    }

    // Update the widget
    const updatedWidgets = props.widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    emit('update-widgets-responsive', updatedWidgets)
  }
}

const updateContainerDimensions = () => {
  if (editorWorkspace.value) {
    const newDimensions = getContainerDimensions(editorWorkspace.value)
    containerDimensions.value = newDimensions

    // Recalculate positions for responsive widgets
    const updatedWidgets = recalculateAllWidgetPositions(props.widgets, newDimensions)

    // Only emit if there are changes
    const hasChanges = updatedWidgets.some((widget, index) => {
      const original = props.widgets[index]
      return (
        widget.x !== original.x ||
        widget.y !== original.y ||
        widget.width !== original.width ||
        widget.height !== original.height
      )
    })

    if (hasChanges) {
      emit('update-widgets-responsive', updatedWidgets)
    }
  }
}

// Debounced resize handler
const debouncedResize = debounce(updateContainerDimensions, 150)

// Lifecycle
onMounted(async () => {
  await nextTick()
  updateContainerDimensions()

  // Add resize listener
  window.addEventListener('resize', debouncedResize)

  // Use ResizeObserver for container size changes
  if (editorWorkspace.value && window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(debouncedResize)
    resizeObserver.observe(editorWorkspace.value)

    // Store observer for cleanup
    ;(
      editorWorkspace.value as HTMLElement & { __resizeObserver?: ResizeObserver }
    ).__resizeObserver = resizeObserver
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedResize)

  // Clean up ResizeObserver
  const element = editorWorkspace.value as HTMLElement & { __resizeObserver?: ResizeObserver }
  if (element && element.__resizeObserver) {
    element.__resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.editor-container {
  height: var(--editor-height, calc(100vh - 70px));
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

.welcome-feature {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.feature-icon {
  font-size: 1.2rem;
}

.feature-text {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
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

.property-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
  line-height: 1.3;
}

.anchor-info {
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--bg-tertiary);
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0 0 0;
  text-transform: capitalize;
}

.anchor-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
  line-height: 1.3;
  font-style: italic;
}

.default-badge {
  font-size: 0.7rem;
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 0.5rem;
  font-weight: bold;
  text-transform: uppercase;
}

/* Responsive design */
@media (max-width: 768px) {
  .properties-panel {
    position: fixed;
    top: auto;
    bottom: 20px;
    right: 20px;
    left: 20px;
    width: auto;
  }
}
</style>
