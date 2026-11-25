<script setup>
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import CartItem from './CartItem.vue'
import CheckoutForm from './CheckoutForm.vue'
import { formatPrice } from '../utils/format.js'

// Кошик: список товарів → оформлення → «дякуємо»
defineProps({
  items: { type: Array, required: true },
  count: { type: Number, required: true },
  total: { type: Number, required: true },
})
const emit = defineEmits(['close', 'increase', 'decrease', 'remove', 'order'])

const step = ref('cart') // 'cart' | 'checkout' | 'done'
const orderNumber = ref(null)

function placeOrder(order) {
  orderNumber.value = Math.floor(100000 + Math.random() * 900000) // умовний номер замовлення
  emit('order', order)
  step.value = 'done'
}
</script>

<template>
  <BaseModal :title="step === 'checkout' ? 'Оформлення замовлення' : 'Кошик'" @close="emit('close')">
    <!-- Замовлення оформлено -->
    <div v-if="step === 'done'" class="state">
      <p class="big">🎉 Дякуємо! Замовлення №{{ orderNumber }} прийнято.</p>
      <p>Це навчальний проєкт, тому замовлення ніде не зберігається і нікуди не надсилається.</p>
      <button type="button" class="btn btn-accent" @click="emit('close')">Повернутися до каталогу</button>
    </div>

    <!-- Порожній кошик -->
    <div v-else-if="items.length === 0" class="state">
      <p class="big">🛒 Кошик порожній</p>
      <p>Додайте товари з каталогу — вони з'являться тут.</p>
      <button type="button" class="btn btn-accent" @click="emit('close')">До каталогу</button>
    </div>

    <CheckoutForm v-else-if="step === 'checkout'" :total="total" :count="count"
                  @back="step = 'cart'" @submit="placeOrder" />

    <template v-else>
      <ul class="list">
        <CartItem v-for="item in items" :key="item.id" :item="item"
                  @increase="emit('increase', $event)" @decrease="emit('decrease', $event)" @remove="emit('remove', $event)" />
      </ul>
      <div class="total">
        <span>Разом ({{ count }} шт.):</span>
        <strong class="price">{{ formatPrice(total) }}</strong>
      </div>
      <div class="actions">
        <button type="button" class="btn btn-outline" @click="emit('close')">Продовжити покупки</button>
        <button type="button" class="btn btn-buy" @click="step = 'checkout'">Оформити замовлення</button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border); }
.total { display: flex; justify-content: flex-end; align-items: baseline; gap: .75rem; padding: 1rem 0; }
.actions { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: space-between; }
.state { padding: 1.5rem 0; text-align: center; }
.state .big { font-size: 1.25rem; font-weight: 700; margin: 0 0 .5rem; }
.state p { color: var(--muted); margin: 0 0 1.25rem; }
.state .big { color: var(--text); }
</style>
