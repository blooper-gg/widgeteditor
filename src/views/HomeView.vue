<template>
  <div class="editor-container">
    <!-- Main Editor Area -->
    <div
      ref="editorWorkspace"
      class="editor-workspace"
      :class="{ locked: isLocked }"
      @click="deselectWidget"
    >
      <div class="welcome-message" v-if="widgets.length === 0">
        <h2>Welcome to Widget Editor</h2>
        <p v-if="isLocked">View is locked - unlock to start adding widgets</p>
        <p v-else>Click "Add Widget" to start building your responsive view</p>
        <div class="welcome-feature">
          <span class="feature-icon">📍</span>
          <span class="feature-text">Hold shift to snap to 10px grid.</span>
        </div>
        <div class="welcome-icon">🎮</div>
      </div>

      <!-- Widgets -->
      <DraggableWidget
        v-for="widget in widgets"
        :key="widget.id"
        :widget="widget"
        :container-dimensions="containerDimensions"
        :is-locked="isLocked"
        @remove="(id) => $emit('remove-widget', id)"
        @update-position-and-size="handleWidgetPositionAndSizeUpdate"
        @select="(widget) => $emit('select-widget', widget)"
      />
    </div>

    <!-- Widget Properties Panel -->
    <div class="properties-panel" v-if="selectedWidget && !isLocked">
      <div class="panel-header">
        <h3>Widget Properties</h3>
      </div>

      <div class="panel-content">
        <div class="property-group">
          <label class="property-label">Name:</label>
          <input
            type="text"
            :value="selectedWidget.name"
            @input="handleNameChange"
            placeholder="Widget name"
            class="property-input"
          />
        </div>

        <div class="property-group">
          <label class="property-label">
            <input
              type="checkbox"
              :checked="selectedWidget.responsive?.enabled || false"
              @change="handleResponsiveToggle"
              class="property-checkbox"
            />
            Responsive Positioning
            <span class="default-badge">DEFAULT</span>
          </label>
          <p class="property-description">
            Widget adapts to window resizing and anchors to nearest edges
          </p>
        </div>

        <div class="property-group">
          <label class="property-label">Anchored to:</label>
          <div class="anchor-controls">
            <div class="anchor-row">
              <label class="anchor-label">Vertical:</label>
              <wired-listbox
                :selected="selectedWidget.responsive?.anchorEdges?.vertical || 'top'"
                @selected="handleVerticalAnchorChange"
                class="anchor-select"
              >
                <wired-item value="top">Top</wired-item>
                <wired-item value="bottom">Bottom</wired-item>
              </wired-listbox>
            </div>
            <div class="anchor-row">
              <label class="anchor-label">Horizontal:</label>
              <wired-listbox
                :selected="selectedWidget.responsive?.anchorEdges?.horizontal || 'left'"
                @selected="handleHorizontalAnchorChange"
                class="anchor-select"
              >
                <wired-item value="left">Left</wired-item>
                <wired-item value="right">Right</wired-item>
              </wired-listbox>
            </div>
          </div>
          <p class="anchor-description">
            Widget stays positioned relative to these edges when window resizes
          </p>
        </div>

        <div class="property-group">
          <label class="property-label">Position:</label>
          <div class="position-controls">
            <div class="position-row">
              <label class="position-label">X px:</label>
              <input
                type="number"
                :value="selectedWidget.x.toString()"
                @input="handleXPositionChange"
                min="0"
                class="property-input position-input"
              />
            </div>
            <div class="position-row">
              <label class="position-label">Y px:</label>
              <input
                type="number"
                :value="selectedWidget.y.toString()"
                @input="handleYPositionChange"
                min="0"
                class="property-input position-input"
              />
            </div>
          </div>
        </div>

        <div class="property-group">
          <label class="property-label">Dimensions:</label>
          <div class="dimension-controls">
            <div v-if="selectedWidget.responsive?.enabled" class="dimension-row">
              <label class="dimension-label">Width %:</label>
              <input
                type="number"
                :value="Math.round(selectedWidget.responsive.widthPercent || 0).toString()"
                @input="handleWidthPercentChange"
                min="1"
                max="100"
                class="property-input dimension-input"
              />
            </div>
            <div v-if="selectedWidget.responsive?.enabled" class="dimension-row">
              <label class="dimension-label">Height %:</label>
              <input
                type="number"
                :value="Math.round(selectedWidget.responsive.heightPercent || 0).toString()"
                @input="handleHeightPercentChange"
                min="1"
                max="100"
                class="property-input dimension-input"
              />
            </div>
            <div v-if="!selectedWidget.responsive?.enabled" class="dimension-row">
              <label class="dimension-label">Width px:</label>
              <input
                type="number"
                :value="selectedWidget.width.toString()"
                @input="handleWidthChange"
                min="20"
                class="property-input dimension-input"
              />
            </div>
            <div v-if="!selectedWidget.responsive?.enabled" class="dimension-row">
              <label class="dimension-label">Height px:</label>
              <input
                type="number"
                :value="selectedWidget.height.toString()"
                @input="handleHeightChange"
                min="20"
                class="property-input dimension-input"
              />
            </div>
          </div>
        </div>

        <div class="property-group">
          <label class="property-label">Layer Order:</label>
          <div class="layer-controls">
            <div class="layer-row">
              <label class="layer-label">Z-Index:</label>
              <input
                type="number"
                :value="(selectedWidget.zIndex || 0).toString()"
                @input="handleZIndexChange"
                class="property-input layer-input"
              />
            </div>
            <div class="layer-buttons">
              <wired-button @click="moveWidgetUp" class="layer-btn"> Move Up </wired-button>
              <wired-button @click="moveWidgetDown" class="layer-btn"> Move Down </wired-button>
            </div>
          </div>
        </div>
      </div>
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
  updateWidgetResponsive,
  calculateWidgetPosition,
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
  'update-widget-name': [id: number, name: string]
  'select-widget': [widget: Widget | null]
  'update-widgets-responsive': [widgets: Widget[]]
}>()

// Create handler that properly updates responsive positioning
const handleWidgetPositionAndSizeUpdate = (
  id: number,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  if (editorWorkspace.value) {
    const widget = props.widgets.find((w) => w.id === id)
    if (widget) {
      const container = getContainerDimensions(editorWorkspace.value)
      const updatedWidget = updateWidgetResponsive(widget, x, y, width, height, container)
      const updatedWidgets = props.widgets.map((w) => (w.id === id ? updatedWidget : w))
      emit('update-widgets-responsive', updatedWidgets)
    }
  }
}

// Refs
const editorWorkspace = ref<HTMLElement>()
const containerDimensions = ref<ContainerDimensions>({ width: 1200, height: 800 })

// Methods
const handleNameChange = (event: Event) => {
  if (props.selectedWidget) {
    emit('update-widget-name', props.selectedWidget.id, (event.target as HTMLInputElement).value)
  }
}

const handleVerticalAnchorChange = (event: CustomEvent) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const updatedWidget: Widget = {
      ...props.selectedWidget,
      responsive: {
        ...props.selectedWidget.responsive,
        enabled: props.selectedWidget.responsive?.enabled ?? true,
        anchorEdges: {
          vertical: event.detail.selected,
          horizontal: props.selectedWidget.responsive?.anchorEdges?.horizontal || 'left',
        },
      },
    }
    const updatedWidgets = props.widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    emit('update-widgets-responsive', updatedWidgets)
  }
}

const handleHorizontalAnchorChange = (event: CustomEvent) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const updatedWidget: Widget = {
      ...props.selectedWidget,
      responsive: {
        ...props.selectedWidget.responsive,
        enabled: props.selectedWidget.responsive?.enabled ?? true,
        anchorEdges: {
          vertical: props.selectedWidget.responsive?.anchorEdges?.vertical || 'top',
          horizontal: event.detail.selected,
        },
      },
    }
    const updatedWidgets = props.widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    emit('update-widgets-responsive', updatedWidgets)
  }
}

const handleWidthPercentChange = (event: Event) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const newPercent = parseFloat((event.target as HTMLInputElement).value)
    if (!isNaN(newPercent) && newPercent > 0 && newPercent <= 100) {
      const updatedWidget: Widget = {
        ...props.selectedWidget,
        responsive: {
          ...props.selectedWidget.responsive,
          enabled: props.selectedWidget.responsive?.enabled ?? true,
          anchorEdges: props.selectedWidget.responsive?.anchorEdges || {
            vertical: 'top',
            horizontal: 'left',
          },
          widthPercent: newPercent,
        },
      }
      const updatedWidgets = props.widgets.map((w) =>
        w.id === updatedWidget.id ? updatedWidget : w,
      )
      emit('update-widgets-responsive', updatedWidgets)
    }
  }
}

const handleHeightPercentChange = (event: Event) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const newPercent = parseFloat((event.target as HTMLInputElement).value)
    if (!isNaN(newPercent) && newPercent > 0 && newPercent <= 100) {
      const updatedWidget: Widget = {
        ...props.selectedWidget,
        responsive: {
          ...props.selectedWidget.responsive,
          enabled: props.selectedWidget.responsive?.enabled ?? true,
          anchorEdges: props.selectedWidget.responsive?.anchorEdges || {
            vertical: 'top',
            horizontal: 'left',
          },
          heightPercent: newPercent,
        },
      }
      const updatedWidgets = props.widgets.map((w) =>
        w.id === updatedWidget.id ? updatedWidget : w,
      )
      emit('update-widgets-responsive', updatedWidgets)
    }
  }
}

const handleWidthChange = (event: Event) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const newWidth = parseInt((event.target as HTMLInputElement).value)
    if (!isNaN(newWidth) && newWidth >= 20) {
      const container = getContainerDimensions(editorWorkspace.value)
      const updatedWidget = updateWidgetResponsive(
        props.selectedWidget,
        props.selectedWidget.x,
        props.selectedWidget.y,
        newWidth,
        props.selectedWidget.height,
        container,
      )
      const updatedWidgets = props.widgets.map((w) =>
        w.id === props.selectedWidget!.id ? updatedWidget : w,
      )
      emit('update-widgets-responsive', updatedWidgets)
    }
  }
}

const handleHeightChange = (event: Event) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const newHeight = parseInt((event.target as HTMLInputElement).value)
    if (!isNaN(newHeight) && newHeight >= 20) {
      const container = getContainerDimensions(editorWorkspace.value)
      const updatedWidget = updateWidgetResponsive(
        props.selectedWidget,
        props.selectedWidget.x,
        props.selectedWidget.y,
        props.selectedWidget.width,
        newHeight,
        container,
      )
      const updatedWidgets = props.widgets.map((w) =>
        w.id === props.selectedWidget!.id ? updatedWidget : w,
      )
      emit('update-widgets-responsive', updatedWidgets)
    }
  }
}

const handleXPositionChange = (event: Event) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const newX = parseInt((event.target as HTMLInputElement).value)
    if (!isNaN(newX) && newX >= 0) {
      const container = getContainerDimensions(editorWorkspace.value)
      const updatedWidget = updateWidgetResponsive(
        props.selectedWidget,
        newX,
        props.selectedWidget.y,
        props.selectedWidget.width,
        props.selectedWidget.height,
        container,
      )
      const updatedWidgets = props.widgets.map((w) =>
        w.id === props.selectedWidget!.id ? updatedWidget : w,
      )
      emit('update-widgets-responsive', updatedWidgets)
    }
  }
}

const handleYPositionChange = (event: Event) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const newY = parseInt((event.target as HTMLInputElement).value)
    if (!isNaN(newY) && newY >= 0) {
      const container = getContainerDimensions(editorWorkspace.value)
      const updatedWidget = updateWidgetResponsive(
        props.selectedWidget,
        props.selectedWidget.x,
        newY,
        props.selectedWidget.width,
        props.selectedWidget.height,
        container,
      )
      const updatedWidgets = props.widgets.map((w) =>
        w.id === props.selectedWidget!.id ? updatedWidget : w,
      )
      emit('update-widgets-responsive', updatedWidgets)
    }
  }
}

const handleZIndexChange = (event: Event) => {
  if (props.selectedWidget) {
    const newZIndex = parseInt((event.target as HTMLInputElement).value)
    if (!isNaN(newZIndex)) {
      const updatedWidget: Widget = {
        ...props.selectedWidget,
        zIndex: newZIndex,
      }
      const updatedWidgets = props.widgets.map((w) =>
        w.id === props.selectedWidget!.id ? updatedWidget : w,
      )
      emit('update-widgets-responsive', updatedWidgets)
    }
  }
}

const moveWidgetUp = () => {
  if (props.selectedWidget) {
    const currentZIndex = props.selectedWidget.zIndex || 0
    const updatedWidget: Widget = {
      ...props.selectedWidget,
      zIndex: currentZIndex + 1,
    }
    const updatedWidgets = props.widgets.map((w) =>
      w.id === props.selectedWidget!.id ? updatedWidget : w,
    )
    emit('update-widgets-responsive', updatedWidgets)
  }
}

const moveWidgetDown = () => {
  if (props.selectedWidget) {
    const currentZIndex = props.selectedWidget.zIndex || 0
    const updatedWidget: Widget = {
      ...props.selectedWidget,
      zIndex: Math.max(0, currentZIndex - 1),
    }
    const updatedWidgets = props.widgets.map((w) =>
      w.id === props.selectedWidget!.id ? updatedWidget : w,
    )
    emit('update-widgets-responsive', updatedWidgets)
  }
}

const handleResponsiveToggle = (event: Event) => {
  if (props.selectedWidget && editorWorkspace.value) {
    const container = getContainerDimensions(editorWorkspace.value)
    const isChecked = (event.target as HTMLInputElement).checked
    let updatedWidget: Widget

    if (isChecked) {
      // Enable responsive positioning - use current dimensions
      updatedWidget = convertWidgetToResponsive(props.selectedWidget, container)
    } else {
      // Disable responsive positioning - preserve current calculated dimensions
      const currentPosition = calculateWidgetPosition(props.selectedWidget, container)
      updatedWidget = {
        ...props.selectedWidget,
        // Use current calculated dimensions to preserve size/position
        x: currentPosition.x,
        y: currentPosition.y,
        width: currentPosition.width,
        height: currentPosition.height,
        responsive: {
          ...props.selectedWidget.responsive,
          enabled: false,
          // Ensure minimum constraints are preserved
          minWidth:
            props.selectedWidget.responsive?.minWidth || Math.max(80, currentPosition.width * 0.6),
          minHeight:
            props.selectedWidget.responsive?.minHeight ||
            Math.max(40, currentPosition.height * 0.6),
          // Preserve anchor edges
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

const deselectWidget = (event: Event) => {
  // Only deselect if clicking on the editor workspace itself (not on a widget)
  if (event.target === editorWorkspace.value) {
    emit('select-widget', null)
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
  overflow: hidden;
}

.panel-header {
  background: var(--bg-primary);
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.panel-content {
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
}

.property-group {
  margin-bottom: 1.5rem;
}

.property-group:last-child {
  margin-bottom: 0;
}

.property-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.property-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
}

.anchor-controls {
  margin-bottom: 0.5rem;
}

.anchor-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.anchor-row:last-child {
  margin-bottom: 0;
}

.anchor-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  min-width: 70px;
  font-weight: 500;
}

.anchor-select {
  flex: 1;
  min-width: 0;
}

.anchor-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
  line-height: 1.3;
  font-style: italic;
}

.default-badge {
  font-size: 0.7rem;
  background: rgba(34, 197, 94, 0.2);
  color: var(--color-success, #16a34a);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 0.5rem;
  font-weight: bold;
  text-transform: uppercase;
}

/* Dark mode default badge */
.dark-mode .default-badge {
  background: rgba(74, 222, 128, 0.25);
  color: #4ade80;
}

.dimension-controls {
  margin-bottom: 0.5rem;
}

.dimension-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.dimension-row:last-child {
  margin-bottom: 0;
}

.dimension-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  min-width: 70px;
  font-weight: 500;
}

.dimension-input {
  flex: 1;
  min-width: 0;
}

.position-controls {
  margin-bottom: 0.5rem;
}

.position-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.position-row:last-child {
  margin-bottom: 0;
}

.position-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  min-width: 50px;
  font-weight: 500;
}

.position-input {
  flex: 1;
  min-width: 0;
}

.layer-controls {
  margin-bottom: 0.5rem;
}

.layer-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.layer-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  min-width: 60px;
  font-weight: 500;
}

.layer-input {
  flex: 1;
  min-width: 0;
}

.layer-buttons {
  display: flex;
  gap: 0.5rem;
}

.layer-btn {
  flex: 1;
  font-size: 0.8rem;
}

.position-info {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
}

/* Input styling for property controls */
.property-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.property-input:focus {
  outline: none;
  border-color: var(--color-primary, #007bff);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.property-input:hover {
  border-color: var(--text-secondary);
}

.property-checkbox {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary, #007bff);
}

/* Dark mode adjustments */
.dark-mode .property-input:focus {
  border-color: var(--color-primary, #4dabf7);
  box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.2);
}

.dark-mode .property-checkbox {
  accent-color: var(--color-primary, #4dabf7);
}

.properties-panel wired-listbox {
  width: 100%;
  --wired-listbox-bg-color: var(--bg-primary) !important;
  --wired-listbox-color: var(--text-primary) !important;
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
