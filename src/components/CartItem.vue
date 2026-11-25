<script setup>
import { formatPrice } from '../utils/format.js'

// Рядок кошика. Сам кошик не змінює — лише повідомляє батьку, що натиснули
defineProps({
  item: { type: Object, required: true }, // товар + поле qty
})
const emit = defineEmits(['increase', 'decrease', 'remove'])
</script>

<template>
  <li class="cart-item">
    <img :src="item.image" :alt="item.name" width="72" height="72">
    <div class="info">
      <p class="name">{{ item.name }}</p>
      <p class="unit">{{ formatPrice(item.price) }} / шт.</p>
    </div>
    <div class="qty" role="group" :aria-label="'Кількість: ' + item.name">
      <button type="button" @click="emit('decrease', item.id)" :disabled="item.qty <= 1" aria-label="Зменшити кількість">−</button>
      <span aria-live="polite">{{ item.qty }}</span>
      <button type="button" @click="emit('increase', item.id)" :disabled="item.qty >= 99" aria-label="Збільшити кількість">+</button>
    </div>
    <p class="sum">{{ formatPrice(item.price * item.qty) }}</p>
    <button type="button" class="remove" @click="emit('remove', item.id)" :aria-label="'Видалити з кошика: ' + item.name">✕</button>
  </li>
</template>

<style scoped>
.cart-item {
  display: grid; grid-template-columns: 72px 1fr auto; grid-template-areas: "img info remove" "img qty sum";
  gap: .5rem 1rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border);
}
img { grid-area: img; width: 72px; height: 72px; object-fit: contain; }
.info { grid-area: info; min-width: 0; }
.name { margin: 0; font-weight: 600; font-size: .95rem; }
.unit { margin: .15rem 0 0; font-size: .8rem; color: var(--muted); }
.qty { grid-area: qty; display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 8px; width: max-content; }
.qty button { width: 36px; height: 36px; border: 0; background: none; font-size: 1.1rem; }
.qty button:hover:not(:disabled) { color: var(--accent); }
.qty button:disabled { color: var(--border); cursor: not-allowed; }
.qty span { min-width: 2rem; text-align: center; font-weight: 600; }
.sum { grid-area: sum; margin: 0; font-weight: 700; text-align: right; white-space: nowrap; }
.remove { grid-area: remove; justify-self: end; width: 32px; height: 32px; border: 0; border-radius: 6px; background: none; color: var(--muted); }
.remove:hover { color: var(--sale); background: #fdecec; }
</style>
