<template>
  <div class="about">
    <div class="about-content">
      <h1>About Game Engine Editor</h1>
      <p>
        A customizable, widget-based game development environment built with Vue.js and Wired.js
      </p>

      <div class="features">
        <h2>Features</h2>
        <ul>
          <li>Draggable and resizable widgets</li>
          <li>Customizable workspace layout</li>
          <li>Hand-drawn UI aesthetic with Wired.js</li>
          <li>Modular component system</li>
        </ul>
      </div>

      <div class="tech-stack">
        <h2>Built With</h2>
        <div class="tech-items">
          <span class="tech-item">Vue.js 3</span>
          <span class="tech-item">Vite</span>
          <span class="tech-item">Wired Elements</span>
          <span class="tech-item">Bun</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  min-height: 100vh;
  background: #2a2a2a;
  color: #fff;
  padding: 2rem;
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.about-content h1 {
  font-family: 'Courier New', monospace;
  margin-bottom: 1rem;
  color: #4caf50;
}

.about-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #ccc;
}

.features,
.tech-stack {
  margin: 2rem 0;
}

.features h2,
.tech-stack h2 {
  color: #fff;
  border-bottom: 2px solid #444;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 0.5rem 0;
  color: #ccc;
}

.features li:before {
  content: '🎮 ';
  margin-right: 0.5rem;
}

.tech-items {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.tech-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #666;
  font-size: 0.9rem;
}
</style>
