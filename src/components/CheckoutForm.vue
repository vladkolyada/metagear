<script setup>
import { computed, reactive, ref } from 'vue'
import { formatPrice } from '../utils/format.js'

// Оформлення замовлення: поля через v-model, перевірка — через computed
const props = defineProps({
  total: { type: Number, required: true },
  count: { type: Number, required: true },
})
const emit = defineEmits(['back', 'submit'])

const form = reactive({ name: '', phone: '', email: '', delivery: 'nova', city: '', address: '', comment: '' })
const submitted = ref(false) // помилки показуємо лише після першої спроби надіслати

const errors = computed(() => {
  const e = {}
  if (form.name.trim().length < 2) e.name = "Вкажіть ім'я та прізвище"
  if (!/^\+?380\d{9}$/.test(form.phone.replace(/[\s()-]/g, ''))) e.phone = 'Формат: +380 XX XXX XX XX'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Вкажіть коректний e-mail'
  if (form.delivery !== 'pickup' && form.city.trim().length < 2) e.city = 'Вкажіть місто'
  if (form.delivery !== 'pickup' && form.address.trim().length < 1) e.address = form.delivery === 'nova' ? 'Вкажіть номер відділення' : 'Вкажіть адресу'
  return e
})
const isValid = computed(() => Object.keys(errors.value).length === 0)

function send() {
  submitted.value = true
  if (!isValid.value) return
  emit('submit', { ...form, total: props.total })
}
</script>

<template>
  <form class="checkout" @submit.prevent="send" novalidate>
    <p class="summary">{{ count }} товар(ів) на суму <strong>{{ formatPrice(total) }}</strong></p>

    <label>Ім'я та прізвище
      <input v-model="form.name" autocomplete="name" :aria-invalid="submitted && !!errors.name">
      <span v-if="submitted && errors.name" class="error">{{ errors.name }}</span>
    </label>
    <div class="row">
      <label>Телефон
        <input v-model="form.phone" type="tel" placeholder="+380 50 123 45 67" autocomplete="tel" :aria-invalid="submitted && !!errors.phone">
        <span v-if="submitted && errors.phone" class="error">{{ errors.phone }}</span>
      </label>
      <label>E-mail
        <input v-model="form.email" type="email" autocomplete="email" :aria-invalid="submitted && !!errors.email">
        <span v-if="submitted && errors.email" class="error">{{ errors.email }}</span>
      </label>
    </div>

    <fieldset>
      <legend>Доставка</legend>
      <label class="radio"><input v-model="form.delivery" type="radio" value="nova"> Нова пошта (відділення)</label>
      <label class="radio"><input v-model="form.delivery" type="radio" value="courier"> Кур'єр</label>
      <label class="radio"><input v-model="form.delivery" type="radio" value="pickup"> Самовивіз з магазину</label>
    </fieldset>

    <div v-if="form.delivery !== 'pickup'" class="row">
      <label>Місто
        <input v-model="form.city" autocomplete="address-level2" :aria-invalid="submitted && !!errors.city">
        <span v-if="submitted && errors.city" class="error">{{ errors.city }}</span>
      </label>
      <label>{{ form.delivery === 'nova' ? 'Номер відділення' : 'Адреса' }}
        <input v-model="form.address" :aria-invalid="submitted && !!errors.address">
        <span v-if="submitted && errors.address" class="error">{{ errors.address }}</span>
      </label>
    </div>

    <label>Коментар (необов'язково)
      <textarea v-model="form.comment" rows="3" maxlength="500"></textarea>
    </label>

    <p v-if="submitted && !isValid" class="error" role="alert">Перевірте поля, позначені червоним.</p>
    <div class="actions">
      <button type="button" class="btn btn-outline" @click="emit('back')">← Назад до кошика</button>
      <button type="submit" class="btn btn-buy">Підтвердити замовлення</button>
    </div>
  </form>
</template>

<style scoped>
.checkout { display: grid; gap: 1rem; }
.summary { margin: 0; padding: .75rem 1rem; background: #f6f2ff; border-radius: 8px; }
label { display: grid; gap: .35rem; font-size: .9rem; font-weight: 600; }
input, textarea {
  width: 100%; min-width: 0; padding: .65rem .8rem; font-weight: 400;
  border: 1px solid var(--border); border-radius: 8px; background: #fff;
}
input:focus, textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124, 58, 237, .15); }
input[aria-invalid="true"] { border-color: var(--sale); }
.error { color: var(--sale); font-size: .8rem; font-weight: 500; margin: 0; }
.row { display: grid; gap: 1rem; }
@media (min-width: 560px) { .row { grid-template-columns: 1fr 1fr; } }
fieldset { margin: 0; padding: .75rem 1rem; border: 1px solid var(--border); border-radius: 8px; display: grid; gap: .4rem; }
legend { padding: 0 .3rem; font-weight: 600; font-size: .9rem; }
.radio { display: flex; align-items: center; gap: .5rem; font-weight: 400; }
.radio input { width: auto; }
.actions { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: space-between; }
</style>
