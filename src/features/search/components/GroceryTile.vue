<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { ProductItem } from '../types'
import { getProductPrice } from '@/services/api/products'

const props = defineProps<{ item: ProductItem }>()
const open = ref(false)

type StoreState = {
  status: 'idle' | 'loading' | 'loaded' | 'error'
  value?: string
  error?: string
}

const storeStates = reactive<Record<string, StoreState>>({})

function ensureStates() {
  for (const store of props.item.availableStores) {
    if (!storeStates[store]) storeStates[store] = { status: 'idle' }
  }
}

async function loadPrices() {
  ensureStates()
  const tasks = props.item.availableStores.map(async (store) => {
    const id = props.item.storeIdMap[store]
    if (!id) return
    const st = storeStates[store]
    if (st.status === 'loaded') return
    st.status = 'loading'
    try {
      const price = await getProductPrice(id)
      st.value =
        price.raw || `${isNaN(price.amount) ? '' : price.amount.toFixed(2)} ${price.currency}`
      st.status = 'loaded'
    } catch (e) {
      st.status = 'error'
      st.error = 'Помилка'
    }
  })
  await Promise.all(tasks)
}

async function toggle() {
  open.value = !open.value
  if (open.value) {
    await loadPrices()
  }
}
</script>

<template>
  <article class="card tile">
    <button
      class="tile-head"
      type="button"
      @click="toggle"
      :aria-expanded="open"
      :aria-controls="`details-${props.item.name}`"
    >
      <img
        class="thumb"
        :src="
          props.item.imageUrl ||
          'https://images.unsplash.com/photo-1506617420156-8e4536971650?q=80&w=800&auto=format&fit=crop'
        "
        alt=""
        loading="lazy"
      />
      <div class="name">{{ props.item.name }}</div>
      <div class="shops" aria-hidden="true">
        <span v-for="s in props.item.availableStores" :key="s" class="shop-badge">{{ s[0] }}</span>
      </div>
    </button>
    <div class="details" :id="`details-${props.item.name}`" v-show="open">
      <ul class="prices">
        <li v-for="s in props.item.availableStores" :key="s" class="price-row">
          <span class="shop">{{ s }}</span>
          <span class="price">
            <span v-if="storeStates[s]?.status === 'loading'">Завантаження…</span>
            <span v-else-if="storeStates[s]?.status === 'error'">
              {{ storeStates[s]?.error }}
              <button class="retry" type="button" @click.stop="loadPrices">Повторити</button>
            </span>
            <span v-else-if="storeStates[s]?.status === 'loaded'">{{ storeStates[s]?.value }}</span>
            <span v-else>—</span>
          </span>
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.tile {
  display: grid;
}
.tile-head {
  display: grid;
  grid-template-rows: auto auto;
  gap: 0.5rem;
  text-align: left;
  padding: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
}
.thumb {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 8px;
}
.name {
  font-weight: 600;
}
.shops {
  display: flex;
  gap: 0.25rem;
}
.shop-badge {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--border);
  color: var(--fg);
  font-size: 0.8rem;
}
.details {
  border-top: 1px solid var(--border);
  padding: 0.5rem 0.75rem 0.75rem;
}
.prices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.25rem;
}
.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.price {
  font-variant-numeric: tabular-nums;
}
.retry {
  margin-left: 0.5rem;
}
</style>
