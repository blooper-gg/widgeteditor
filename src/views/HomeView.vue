<template>
  <div class="editor-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <button @click="addWidget" class="toolbar-btn">+ Add Widget</button>
      <button @click="resetLayout" class="toolbar-btn">Reset Layout</button>
    </div>

    <!-- Main Editor Area -->
    <div class="editor-workspace">
      <div class="welcome-message" v-if="widgets.length === 0">
        <h2>Welcome to Game Engine Editor</h2>
        <p>Click "Add Widget" to start building your interface</p>
        <div class="welcome-icon">🎮</div>
      </div>

      <!-- Widgets will go here -->
      <div v-for="widget in widgets" :key="widget.id" class="widget-placeholder">
        <h3>{{ widget.name }}</h3>
        <button @click="removeWidget(widget.id)" class="remove-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Types
interface Widget {
  id: number
  name: string
  type: string
}

// Reactive data
const widgets = ref<Widget[]>([])
let nextId = 1

// Methods
const addWidget = () => {
  widgets.value.push({
    id: nextId++,
    name: `Widget ${nextId - 1}`,
    type: 'placeholder',
  })
}

const removeWidget = (id: number) => {
  const index = widgets.value.findIndex((w) => w.id === id)
  if (index !== -1) {
    widgets.value.splice(index, 1)
  }
}

const resetLayout = () => {
  widgets.value = []
  nextId = 1
}
</script>

<style scoped>
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #2a2a2a;
}

.toolbar {
  background: #1a1a1a;
  padding: 1rem;
  border-bottom: 1px solid #444;
  display: flex;
  gap: 1rem;
}

.toolbar-btn {
  background: #444;
  color: #fff;
  border: 1px solid #666;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  transition: background 0.2s;
}

.toolbar-btn:hover {
  background: #555;
}

.editor-workspace {
  flex: 1;
  padding: 2rem;
  position: relative;
  background: linear-gradient(
    45deg,
    #2a2a2a 25%,
    #323232 25%,
    #323232 50%,
    #2a2a2a 50%,
    #2a2a2a 75%,
    #323232 75%
  );
  background-size: 20px 20px;
}

.welcome-message {
  text-align: center;
  margin-top: 4rem;
}

.welcome-message h2 {
  color: #fff;
  margin-bottom: 1rem;
}

.welcome-message p {
  color: #ccc;
  margin-bottom: 2rem;
}

.welcome-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.widget-placeholder {
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed #666;
  border-radius: 8px;
  padding: 2rem;
  margin: 1rem;
  display: inline-block;
  position: relative;
  min-width: 200px;
  min-height: 150px;
}

.widget-placeholder h3 {
  margin: 0 0 1rem 0;
  color: #fff;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff5555;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.remove-btn:hover {
  background: #ff3333;
}
</style>
