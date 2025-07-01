<template>
  <div id="app">
    <nav>
      <div class="nav-brand">
        <h1>🎮 Game Engine Editor</h1>
      </div>
      <div class="nav-links">
        <RouterLink to="/">Editor</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </div>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: #2a2a2a;
  color: #fff;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1a1a1a;
  border-bottom: 2px solid #444;
}

.nav-brand h1 {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.1);
}

main {
  min-height: calc(100vh - 80px);
}
</style>
