<script setup>
import ProductCard from './ProductCard.vue'

// Один рядок тір-листа: кольоровий квадрат з літерою і товари цього тіру
defineProps({
  tier: { type: String, required: true },
  title: { type: String, required: true },
  items: { type: Array, required: true },
  cartIds: { type: Array, required: true },
})
const emit = defineEmits(['add', 'open'])
</script>

<template>
  <section class="row" :aria-label="'Тір ' + tier + ': ' + title">
    <div class="label" :class="'tier-' + tier">
      <span class="letter">{{ tier }}</span>
      <span class="title">{{ title }}</span>
    </div>
    <div class="items">
      <ProductCard v-for="product in items" :key="product.id" :product="product"
                   :in-cart="cartIds.includes(product.id)" :show-tier="false"
                   @add="emit('add', $event)" @open="emit('open', $event)" />
    </div>
  </section>
</template>

<style scoped>
.row { display: grid; background: #e7e8eb; border: 1px solid var(--border); }
.label { display: flex; align-items: center; gap: .75rem; padding: .6rem 1rem; }
.letter { font-family: var(--font-display); font-weight: 900; font-size: 1.6rem; line-height: 1; }
.title { font-weight: 600; font-size: .95rem; }
.items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding: 8px; }

/* З 40rem — квадратний ярлик зліва, як у справжньому тір-листі */
@media (min-width: 40rem) {
  .row { grid-template-columns: 7.5rem 1fr; }
  .label { flex-direction: column; justify-content: center; text-align: center; gap: .4rem; padding: 1rem .5rem; }
  .letter { font-size: 2.75rem; }
  .title { font-size: .8rem; }
  .items { grid-template-columns: repeat(auto-fill, minmax(min(13rem, 100%), 1fr)); gap: 10px; padding: 10px; }
}
</style>
