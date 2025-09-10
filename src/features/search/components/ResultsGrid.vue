<script setup lang="ts">
import type { ProductItem } from '../types'
import GroceryTile from './GroceryTile.vue'

const props = defineProps<{ items: ProductItem[] }>()
</script>

<template>
  <div class="results-grid">
    <GroceryTile v-for="it in props.items" :key="it.name" :item="it" />
  </div>
</template>

<style scoped></style>
