<script setup>
import BaseModal from './BaseModal.vue'
import { formatPrice } from '../utils/format.js'

// Сторінка товару у вигляді модального вікна (без окремого роутера)
defineProps({
  product: { type: Object, required: true },
  inCart: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'add'])
</script>

<template>
  <BaseModal :title="product.name" @close="emit('close')">
    <div class="product">
      <img :src="product.image" :alt="product.name" width="600" height="600">
      <div>
        <p class="category">{{ product.category }}</p>
        <p class="description">{{ product.description }}</p>

        <h3>Характеристики</h3>
        <dl class="specs">
          <div v-for="(value, name) in product.specs" :key="name">
            <dt>{{ name }}</dt>
            <dd>{{ value }}</dd>
          </div>
        </dl>

        <div class="buy">
          <div>
            <div v-if="product.oldPrice" class="old-price">{{ formatPrice(product.oldPrice) }}</div>
            <div class="price" :class="{ sale: product.oldPrice }">{{ formatPrice(product.price) }}</div>
          </div>
          <button type="button" class="btn btn-buy" @click="emit('add', product)">
            {{ inCart ? 'Додати ще один' : 'Купити' }}
          </button>
        </div>
        <p v-if="inCart" class="in-cart">✓ Товар уже в кошику</p>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.product { display: grid; gap: 1.5rem; }
@media (min-width: 40rem) { .product { grid-template-columns: 1fr 1.1fr; align-items: start; } }
img { width: 100%; aspect-ratio: 1; object-fit: contain; border: 1px solid var(--border); border-radius: var(--radius); }
.category { margin: 0; color: var(--accent); font-weight: 600; font-size: .875rem; }
.description { margin: .5rem 0 1.25rem; }
h3 { font-size: 1rem; margin-bottom: .5rem; }
.specs { margin: 0 0 1.25rem; }
.specs div { display: flex; justify-content: space-between; gap: 1rem; padding: .45rem 0; border-bottom: 1px dashed var(--border); }
.specs dt { color: var(--muted); }
.specs dd { margin: 0; text-align: right; font-weight: 500; }
.buy { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
.in-cart { margin: .75rem 0 0; color: var(--buy); font-weight: 600; }
</style>
