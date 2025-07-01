<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <nav>
      <div class="nav-brand">
        <h1>blooper editor</h1>
      </div>
      <div class="nav-center">
        <span :class="{ active: $route.path === '/' }">
          <wired-button @click="$router.push('/')"> Editor </wired-button>
        </span>
        <span :class="{ active: $route.path === '/about' }">
          <wired-button @click="$router.push('/about')"> About </wired-button>
        </span>
      </div>
      <div class="nav-controls">
        <wired-toggle v-if="mounted" :checked="isDarkMode" @change="toggleDarkMode"></wired-toggle>
        <span class="dark-mode-label">{{ isDarkMode ? 'Dark' : 'Light' }}</span>
      </div>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'

const isDarkMode = ref(false)
const mounted = ref(false)

const toggleDarkMode = (event: CustomEvent) => {
  isDarkMode.value = event.detail.checked
  localStorage.setItem('dark-mode', JSON.stringify(isDarkMode.value))
}

onMounted(() => {
  mounted.value = true
  const saved = localStorage.getItem('dark-mode')
  if (saved) {
    isDarkMode.value = JSON.parse(saved)
  }
})
</script>

<style>
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
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
  font-weight: bold;
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
  flex: 1;
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

  .nav-center {
    justify-content: center;
  }

  .nav-controls {
    justify-content: center;
  }
}
</style>
