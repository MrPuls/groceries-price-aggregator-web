<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const value = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    value.value = ''
  }
}
</script>

<template>
  <div class="search" role="search">
    <label class="visually-hidden" for="search-input">Пошук товарів</label>
    <input
      id="search-input"
      v-model="value"
      class="search-input"
      type="search"
      placeholder="Пошук продуктів (наприклад, молоко, яйця) — Ctrl+K або /"
      aria-label="Пошук товарів"
      aria-describedby="search-kbd-hint"
      @keydown="onKeydown"
    />
    <p id="search-kbd-hint" class="hint" aria-live="off">
      Підказка: натисніть <kbd>Ctrl</kbd>+<kbd>K</kbd> або <kbd>/</kbd> щоб швидко перейти до пошуку
    </p>
  </div>
</template>

<style scoped>
.search {
  width: min(720px, 100%);
}
.search-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--fg);
  outline: none;
}
.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 25%, transparent);
}
.hint {
  margin: 0.5rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}
kbd {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  border: 1px solid var(--border);
  border-bottom-width: 2px;
  padding: 0 0.25rem;
  border-radius: 4px;
  background: var(--surface);
}
</style>
