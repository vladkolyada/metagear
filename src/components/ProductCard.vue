<script setup>
import { computed } from 'vue'
import { formatPrice } from '../utils/format.js'

// Картка товару: дані приходять через props, дії йдуть батьку через emit
const props = defineProps({
  product: { type: Object, required: true },
  inCart: { type: Boolean, default: false },
  showTier: { type: Boolean, default: true }, // у рядку тір-листа літера вже є зліва
})
const emit = defineEmits(['add', 'open'])

// Дві головні характеристики — щоб порівнювати товари, не відкриваючи кожен
const keySpecs = computed(() => Object.entries(props.product.specs || {}).slice(0, 2))
</script>

<template>
  <article class="card">
    <button type="button" class="card-image" @click="emit('open', product)" :aria-label="'Докладніше: ' + product.name">
      <img :src="product.image" :alt="product.name" width="600" height="600" loading="lazy">
    </button>

    <div class="card-head">
      <span v-if="showTier" class="tier" :class="'tier-' + product.tier" :title="'Тір ' + product.tier">{{ product.tier }}</span>
      <button type="button" class="card-title" @click="emit('open', product)">{{ product.name }}</button>
    </div>

    <dl class="card-specs">
      <div v-for="[name, value] in keySpecs" :key="name">
        <dt>{{ name }}</dt>
        <dd>{{ value }}</dd>
      </div>
    </dl>

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
  display: flex; flex-direction: column; gap: .6rem;
  padding: .75rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
}
.card:hover { border-color: var(--text); }
.card-image { padding: 0; border: 0; background: #fff; aspect-ratio: 4 / 3; }
.card-image img { width: 100%; height: 100%; object-fit: contain; }
.card-head { display: flex; gap: .6rem; align-items: flex-start; }
.card-title {
  padding: 0; border: 0; background: none; text-align: left; font-weight: 600; font-size: .95rem;
  display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.card-title:hover { text-decoration: underline; text-underline-offset: .15em; }
.card-specs { display: none; margin: 0; font-size: .82rem; color: var(--muted); }
.card-specs div { display: flex; justify-content: space-between; gap: .5rem; }
.card-specs dd { margin: 0; color: var(--text); text-align: right; }
.card-bottom { margin-top: auto; display: flex; flex-direction: column; gap: .5rem; padding-top: .25rem; }
.cart-btn { min-height: 40px; padding: 0 .5rem; font-size: .9rem; white-space: nowrap; }
.in-cart { background: #fff; color: var(--text); border-color: var(--text); }
/* mobile-first: на телефоні кнопка на всю ширину картки, з 40rem — поруч із ціною */
@media (min-width: 40rem) {
  .card { padding: 1rem; }
  .card-specs { display: block; }
  .cart-btn { padding: 0 .9rem; font-size: 1rem; }
  .card-bottom { flex-direction: row; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; }
}
</style>
