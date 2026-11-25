<script setup>
import { formatPrice } from '../utils/format.js'

// Картка товару: дані приходять через props, дії йдуть батьку через emit
defineProps({
  product: { type: Object, required: true },
  inCart: { type: Boolean, default: false },
})
const emit = defineEmits(['add', 'open'])
</script>

<template>
  <article class="card">
    <button type="button" class="card-image" @click="emit('open', product)" :aria-label="'Докладніше: ' + product.name">
      <img :src="product.image" :alt="product.name" width="600" height="600" loading="lazy">
      <span v-if="product.oldPrice" class="badge">−{{ Math.round((1 - product.price / product.oldPrice) * 100) }}%</span>
    </button>

    <button type="button" class="card-title" @click="emit('open', product)">{{ product.name }}</button>
    <p class="card-category">{{ product.category }}</p>

    <div class="card-bottom">
      <div>
        <div v-if="product.oldPrice" class="old-price">{{ formatPrice(product.oldPrice) }}</div>
        <div class="price" :class="{ sale: product.oldPrice }">{{ formatPrice(product.price) }}</div>
      </div>
      <button type="button" class="btn cart-btn" :class="inCart ? 'in-cart' : 'btn-buy'"
              @click="emit('add', product)" :aria-label="(inCart ? 'Ще один у кошик: ' : 'Додати в кошик: ') + product.name">
        {{ inCart ? '✓ У кошику' : 'У кошик' }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex; flex-direction: column; gap: .5rem;
  padding: 1rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
  transition: box-shadow .2s, border-color .2s;
}
.card:hover { box-shadow: var(--shadow); border-color: transparent; }
.card-image {
  position: relative; padding: 0; border: 0; background: #fff; aspect-ratio: 1; border-radius: 8px; overflow: hidden;
}
.card-image img { width: 100%; height: 100%; object-fit: contain; transition: transform .25s; }
.card:hover .card-image img { transform: scale(1.04); }
.badge {
  position: absolute; top: .5rem; left: .5rem; padding: .15rem .5rem;
  font-size: .8rem; font-weight: 700; color: #fff; background: var(--sale); border-radius: 6px;
}
.card-title {
  padding: 0; border: 0; background: none; text-align: left; font-size: .95rem;
  display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  min-height: 2.8em;
}
.card-title:hover { color: var(--accent); text-decoration: underline; }
.card-category { margin: 0; font-size: .8rem; color: var(--muted); }
.card-bottom { margin-top: auto; display: flex; flex-wrap: wrap; gap: .5rem; align-items: flex-end; justify-content: space-between; }
.cart-btn { min-height: 40px; padding: 0 .9rem; }
.in-cart { background: #e7f6ed; color: #007a35; border-color: #9fd8b5; }
.in-cart:hover { background: #d6f0e0; }
</style>
