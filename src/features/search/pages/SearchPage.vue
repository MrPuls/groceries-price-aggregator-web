<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import ResultsGrid from '../components/ResultsGrid.vue'
import type { ProductItem } from '../types'
import { debounce } from '@/utils/debounce'
import { sanitizeQuery } from '@/utils/sanitize'
import { searchProducts } from '@/services/api/products'

const route = useRoute()
const router = useRouter()

const q = ref<string>((route.query.q as string) || '')
const isTyping = ref(false)
const announce = ref('')

const items = ref<ProductItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
let inFlight: AbortController | null = null

function focusSearch() {
  const el = document.getElementById('search-input') as HTMLInputElement | null
  el?.focus()
}

function globalKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  const isEditable = !!target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  if (!isEditable && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    focusSearch()
  } else if (!isEditable && e.key === '/' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    focusSearch()
  }
}

async function runSearch(term: string) {
  const s = sanitizeQuery(term)
  if (inFlight) {
    inFlight.abort()
    inFlight = null
  }
  if (!s) {
    items.value = []
    isLoading.value = false
    error.value = null
    announce.value = ''
    return
  }
  isLoading.value = true
  error.value = null
  const ac = new AbortController()
  inFlight = ac
  try {
    const res = await searchProducts(s, { signal: ac.signal })
    items.value = res
    announce.value = `Знайдено ${res.length} результат(и/ів) для \"${s}\"`
  } catch (e: any) {
    if (e?.name === 'AbortError') return
    error.value = 'Помилка мережі. Спробуйте ще раз.'
  } finally {
    if (inFlight === ac) inFlight = null
    isLoading.value = false
  }
}

const debouncedReplace = debounce((nextQ: string) => {
  const sanitized = sanitizeQuery(nextQ)
  const query = { ...route.query }
  if (sanitized) {
    query.q = sanitized
  } else {
    delete query.q
  }
  router.replace({ name: 'search', query }).catch(() => {})
  isTyping.value = false
  announce.value = sanitized ? `Пошук: ${sanitized}` : ''
}, 300)

watch(
  () => q.value,
  (val) => {
    isTyping.value = true
    debouncedReplace(val)
  },
)

watch(
  () => route.query.q,
  (val) => {
    const v = (val as string) || ''
    if (v !== q.value) q.value = v
    runSearch(v)
  },
  { immediate: true },
)

onMounted(() => {
  announce.value = ''
  window.addEventListener('keydown', globalKeydown)
})

onBeforeUnmount(() => {
  debouncedReplace.cancel()
  if (inFlight) inFlight.abort()
  window.removeEventListener('keydown', globalKeydown)
})
</script>

<template>
  <section class="search-page">
    <div class="hero">
      <h1 class="title">Groceries Price Aggregator</h1>
      <p class="subtitle">Find the best prices across shops</p>
    </div>

    <div class="center">
      <SearchBar v-model="q" />
    </div>

    <div class="container visually-hidden" aria-live="polite">{{ announce }}</div>

    <div class="container">
      <template v-if="!sanitizeQuery(q).length">
        <div class="empty-state">Почніть вводити назву продукту вище.</div>
      </template>
      <template v-else>
        <div v-if="isLoading" class="empty-state">Завантаження…</div>
        <div v-else-if="error" class="empty-state">
          {{ error }}
          <button type="button" @click="runSearch(q)">Повторити</button>
        </div>
        <div v-else-if="items.length === 0" class="empty-state">
          Нічого не знайдено для "{{ sanitizeQuery(q) }}".
        </div>
        <template v-else>
          <ResultsGrid :items="items" />
        </template>
      </template>
    </div>
  </section>
</template>

<style scoped>
.search-page {
  padding-top: 2rem;
}
.hero {
  text-align: center;
  margin-bottom: 1.5rem;
}
.title {
  margin: 0;
  font-size: 1.75rem;
}
.subtitle {
  margin: 0.25rem 0 0;
  color: var(--muted);
}
.empty-state {
  text-align: center;
  color: var(--muted);
  padding: 2rem 0;
}
</style>
