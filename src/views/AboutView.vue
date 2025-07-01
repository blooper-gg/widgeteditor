<template>
  <div class="about">
    <div class="about-container">
      <wired-card class="about-card">
        <div class="about-header">
          <h1>🎮 Widget Editor</h1>
          <p class="about-subtitle">
            A drag-and-drop widget editor built with Vue.js and Wired Elements
          </p>
        </div>

        <div class="about-content">
          <div class="about-section">
            <h2>What is this?</h2>
            <p>
              This is a simple widget editor that lets you drag and drop components onto a canvas.
              It's built as a demonstration of Vue.js 3 with TypeScript and uses Wired Elements for
              a unique hand-drawn aesthetic.
            </p>
          </div>

          <div class="about-section">
            <h2>Features</h2>
            <ul class="feature-list">
              <li>🎯 Drag and drop widgets</li>
              <li>🎨 Customizable properties</li>
              <li>💾 Auto-save functionality</li>
              <li>🌙 Dark mode support</li>
              <li>📱 Responsive design</li>
            </ul>
          </div>

          <div class="about-section">
            <h2>Tech Stack</h2>
            <div class="tech-stack">
              <span class="tech-tag">Vue 3</span>
              <span class="tech-tag">TypeScript</span>
              <span class="tech-tag">Wired Elements</span>
              <span class="tech-tag">Vite</span>
              <span class="tech-tag">Pinia</span>
            </div>
          </div>
        </div>

        <div class="about-actions">
          <wired-button @click="$router.push('/')" class="primary-btn">
            🚀 Try the Editor
          </wired-button>
        </div>
      </wired-card>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.about {
  min-height: 100%;
  padding: 2rem;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-container {
  width: 100%;
  max-width: 800px;
}

.about-card {
  padding: 3rem !important;
  border-radius: 12px !important;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.about-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 700;
}

.about-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.about-content {
  margin-bottom: 3rem;
}

.about-section {
  margin-bottom: 2.5rem;
}

.about-section:last-child {
  margin-bottom: 0;
}

.about-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.about-section p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  font-size: 1.1rem;
  padding: 0.75rem 0;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.feature-list li:last-child {
  border-bottom: none;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tech-tag {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
}

.about-actions {
  text-align: center;
}

.primary-btn {
  font-size: 1.1rem !important;
  padding: 1rem 2rem !important;
  font-weight: 600 !important;
}

.primary-btn:hover {
  transform: translateY(-2px);
}

/* Responsive design */
@media (max-width: 768px) {
  .about {
    padding: 1rem;
  }

  .about-card {
    padding: 2rem !important;
  }

  .about-header h1 {
    font-size: 2rem;
  }

  .about-subtitle {
    font-size: 1.1rem;
  }

  .about-section h2 {
    font-size: 1.3rem;
  }

  .about-section p {
    font-size: 1rem;
  }

  .feature-list li {
    font-size: 1rem;
  }

  .tech-stack {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .about-card {
    padding: 1.5rem !important;
  }

  .about-header h1 {
    font-size: 1.75rem;
  }

  .primary-btn {
    font-size: 1rem !important;
    padding: 0.875rem 1.5rem !important;
  }
}
</style>
