<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'

const isDark = ref(false)

function applyTheme(dark: boolean) {
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    root.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = saved ? saved === 'dark' : prefersDark
  applyTheme(isDark.value)
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand" data-test="brand">Groceries</div>
      <button class="theme-toggle" type="button" @click="toggleTheme" :aria-pressed="isDark">
        <span v-if="isDark">🌙 Dark</span>
        <span v-else>☀️ Light</span>
      </button>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  background: var(--bg);
  color: var(--fg);
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}
.brand {
  font-size: 1.25rem;
  font-weight: 700;
}
.theme-toggle {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.4rem 0.6rem;
  color: var(--fg);
}
.app-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.25rem;
}
</style>
