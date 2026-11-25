<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ProductCard from './components/ProductCard.vue'
import TierRow from './components/TierRow.vue'
import ProductModal from './components/ProductModal.vue'
import CartModal from './components/CartModal.vue'
import { formatPrice } from './utils/format.js'

const CART_KEY = 'metagear-cart'

// ---------- Стан ----------
const products = ref([])
const loading = ref(true)
const loadError = ref(false)

const category = ref('Усі')
const search = ref('')
const sort = ref('tier') // tier | cheap | expensive | name

const cart = ref(loadCart()) // [{ id, qty }]
const cartOpen = ref(false)
const selected = ref(null) // товар, відкритий у вікні

// ---------- Завантаження каталогу ----------
async function loadProducts() {
  loading.value = true
  loadError.value = false
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'products.json')
    if (!response.ok) throw new Error('HTTP ' + response.status)
    const data = await response.json()
    // шлях до фото робимо повним (важливо, якщо сайт лежить у підпапці на GitHub Pages)
    products.value = data.map((p) => ({ ...p, image: import.meta.env.BASE_URL + p.image }))
  } catch (error) {
    console.error('Не вдалося завантажити каталог:', error)
    loadError.value = true
  } finally {
    loading.value = false
  }
}
onMounted(loadProducts)

// ---------- Фільтр, пошук, сортування (computed) ----------
const categories = computed(() => ['Усі', ...new Set(products.value.map((p) => p.category))])

function countIn(name) {
  return name === 'Усі' ? products.value.length : products.value.filter((p) => p.category === name).length
}

const visibleProducts = computed(() => {
  const query = search.value.trim().toLowerCase()
  const list = products.value.filter((p) =>
    (category.value === 'Усі' || p.category === category.value) &&
    p.name.toLowerCase().includes(query),
  )
  // toSorted() повертає новий масив — у computed нічого не змінюємо
  if (sort.value === 'cheap') return list.toSorted((a, b) => a.price - b.price)
  if (sort.value === 'expensive') return list.toSorted((a, b) => b.price - a.price)
  if (sort.value === 'name') return list.toSorted((a, b) => a.name.localeCompare(b.name, 'uk'))
  return list
})

// Режим «тір-лист»: товари розкладені по рядках S / A / B
const TIERS = [
  { tier: 'S', title: 'Найкраще зараз' },
  { tier: 'A', title: 'Сильний вибір' },
  { tier: 'B', title: 'Під свою задачу' },
]
const tierRows = computed(() =>
  TIERS
    .map((row) => ({ ...row, items: visibleProducts.value.filter((p) => p.tier === row.tier) }))
    .filter((row) => row.items.length > 0),
)

function resetFilters() {
  category.value = 'Усі'
  search.value = ''
}

// ---------- Кошик ----------
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY))
    return Array.isArray(saved) ? saved.filter((i) => Number.isInteger(i.id) && i.qty > 0) : []
  } catch {
    return [] // зіпсовані дані або заборонене сховище — починаємо з порожнього кошика
  }
}

// Кожна зміна кошика одразу записується в localStorage
watch(cart, (value) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(value))
  } catch (error) {
    console.error('Не вдалося зберегти кошик:', error)
  }
}, { deep: true })

// Рядки кошика: беремо дані товару з каталогу + кількість
const cartItems = computed(() =>
  cart.value
    .map((item) => ({ ...products.value.find((p) => p.id === item.id), qty: item.qty }))
    .filter((item) => item.name), // товар міг зникнути з каталогу
)
const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.qty, 0))
const cartTotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.price * item.qty, 0))

const cartIds = computed(() => cart.value.map((item) => item.id))
const isInCart = (id) => cartIds.value.includes(id)

function addToCart(product) {
  const item = cart.value.find((i) => i.id === product.id)
  if (item) item.qty = Math.min(item.qty + 1, 99)
  else cart.value.push({ id: product.id, qty: 1 })
}
function changeQty(id, delta) {
  const item = cart.value.find((i) => i.id === id)
  if (item) item.qty = Math.min(Math.max(item.qty + delta, 1), 99)
}
function removeFromCart(id) {
  cart.value = cart.value.filter((i) => i.id !== id)
}
function onOrder() {
  cart.value = [] // замовлення оформлено — кошик очищаємо
}
</script>

<template>
  <a class="skip" href="#catalog">Перейти до каталогу</a>

  <header class="header">
    <div class="wrap header-row">
      <a class="logo" href="./" aria-label="MetaGear — на головну">
        <span class="tier tier-S" aria-hidden="true">M</span>
        <span>MetaGear</span>
      </a>

      <label class="search">
        <span class="visually-hidden">Пошук товарів</span>
        <input v-model="search" type="search" placeholder="Пошук: ThinkPad, RTX, миша…" autocomplete="off">
      </label>

      <button type="button" class="cart-link" @click="cartOpen = true" :aria-label="'Кошик, товарів: ' + cartCount">
        <span>Кошик</span>
        <span class="cart-count">{{ cartCount }}</span>
      </button>
    </div>
  </header>

  <section class="intro">
    <div class="wrap intro-row">
      <h1>Тір-лист заліза</h1>
      <p>«Мета» в іграх — те, що працює найкраще прямо зараз. Ми розклали техніку так само: від S — найкраще за свої гроші — до B, яке варто брати під конкретну задачу.</p>
    </div>
  </section>

  <main id="catalog" class="wrap" tabindex="-1">
    <div class="controls">
      <nav class="tabs" aria-label="Категорії">
        <button v-for="name in categories" :key="name" type="button" :class="{ active: name === category }"
                :aria-pressed="name === category" @click="category = name">
          {{ name }} <span>{{ countIn(name) }}</span>
        </button>
      </nav>
      <label class="sort">Показати
        <select v-model="sort">
          <option value="tier">за тір-листом</option>
          <option value="cheap">спершу дешевші</option>
          <option value="expensive">спершу дорожчі</option>
          <option value="name">за назвою</option>
        </select>
      </label>
    </div>
    <p v-if="!loading && !loadError" class="found" aria-live="polite">Знайдено товарів: {{ visibleProducts.length }}</p>

    <p v-if="loading" class="message">Завантажуємо каталог…</p>

    <div v-else-if="loadError" class="message">
      <p>Каталог не завантажився. Перевірте з'єднання й спробуйте ще раз.</p>
      <button type="button" class="btn btn-accent" @click="loadProducts">Завантажити знову</button>
    </div>

    <div v-else-if="visibleProducts.length === 0" class="message">
      <p class="big">Нічого не знайдено</p>
      <p>За запитом «{{ search }}» у категорії «{{ category }}» товарів немає. Змініть запит або подивіться всі товари.</p>
      <button type="button" class="btn btn-accent" @click="resetFilters">Показати всі товари</button>
    </div>

    <div v-else-if="sort === 'tier'" class="tier-list">
      <TierRow v-for="row in tierRows" :key="row.tier" :tier="row.tier" :title="row.title" :items="row.items"
               :cart-ids="cartIds" @add="addToCart" @open="selected = $event" />
    </div>

    <div v-else class="grid">
      <ProductCard v-for="product in visibleProducts" :key="product.id" :product="product"
                   :in-cart="isInCart(product.id)" @add="addToCart" @open="selected = $event" />
    </div>
  </main>

  <footer class="footer">
    <div class="wrap">
      <p>MetaGear — навчальний проєкт (КП № 2, Vue.js 3). Ціни, характеристики, тіри й замовлення умовні.</p>
    </div>
  </footer>

  <ProductModal v-if="selected" :product="selected" :in-cart="isInCart(selected.id)"
                @close="selected = null" @add="addToCart" />

  <CartModal v-if="cartOpen" :items="cartItems" :count="cartCount" :total="cartTotal"
             @close="cartOpen = false" @increase="changeQty($event, 1)" @decrease="changeQty($event, -1)"
             @remove="removeFromCart" @order="onOrder" />

  <!-- На телефоні: сума кошика внизу екрана -->
  <button v-if="cartCount" type="button" class="mobile-cart" @click="cartOpen = true">
    Кошик, {{ cartCount }} шт.: {{ formatPrice(cartTotal) }}
  </button>
</template>

<style scoped>
/* Верстка mobile-first, як у КП №1: базові стилі — для телефона,
   далі @media (min-width: …rem) додають простір для ширших екранів. */

/* ---------- Шапка ---------- */
.header { position: sticky; top: 0; z-index: 20; background: #fff; border-bottom: 1px solid var(--border); }
.header-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding-block: 10px; }
.logo {
  display: flex; align-items: center; gap: .6rem; margin-right: auto;
  color: var(--text); text-decoration: none; font-family: var(--font-display); font-weight: 700; font-size: 1.1rem;
}
.search { order: 3; flex-basis: 100%; min-width: 0; }
.search input {
  width: 100%; height: 44px; padding: 0 1rem; border: 2px solid var(--border); border-radius: var(--radius); background: var(--bg);
}
.search input:focus { outline: none; border-color: var(--text); background: #fff; }
.cart-link {
  display: flex; align-items: center; gap: .6rem; height: 44px; padding: 0 .4rem 0 1rem;
  border: 2px solid var(--text); border-radius: var(--radius); background: #fff; font-weight: 600;
}
.cart-count {
  display: grid; place-items: center; min-width: 30px; height: 30px; padding: 0 6px;
  border-radius: 4px; background: var(--text); color: #fff; font-size: .85rem;
}
.cart-link:hover { background: var(--text); color: #fff; }
.cart-link:hover .cart-count { background: #fff; color: var(--text); }

/* ---------- Вступ ---------- */
.intro { background: #fff; border-bottom: 1px solid var(--border); }
.intro-row { display: grid; gap: .75rem; padding-block: 1.5rem; }
.intro h1 { font-family: var(--font-display); font-weight: 900; font-size: clamp(1.75rem, 1.2rem + 3vw, 3.25rem); letter-spacing: -.02em; }
.intro p { margin: 0; max-width: 60ch; color: var(--muted); }

/* ---------- Каталог ---------- */
main { padding-block: 20px 96px; }
main:focus { outline: none; }
.controls { display: grid; gap: 12px; margin-bottom: .5rem; }
.tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.tabs button {
  display: inline-flex; gap: .45rem; align-items: center; min-height: 40px; padding: 0 .9rem;
  border: 1px solid var(--border); border-radius: 20px; background: #fff; font-weight: 600; font-size: .92rem;
}
.tabs button span { color: var(--muted); font-weight: 400; }
.tabs button:hover { border-color: var(--text); }
.tabs button.active { background: var(--text); border-color: var(--text); color: #fff; }
.tabs button.active span { color: #c9cad0; }
.sort { display: flex; align-items: center; gap: .5rem; font-size: .9rem; color: var(--muted); }
.sort select { height: 40px; max-width: 100%; padding: 0 .6rem; border: 1px solid var(--border); border-radius: var(--radius); background: #fff; color: var(--text); }
.found { margin: .25rem 0 1rem; color: var(--muted); font-size: .9rem; }

.tier-list { display: grid; gap: 12px; }
/* Звичайна сітка (коли сортуємо за ціною чи назвою) */
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }

.message { padding: 3rem 1rem; text-align: center; background: var(--card); border: 1px solid var(--border); }
.message p { margin: 0 auto 1rem; max-width: 50ch; color: var(--muted); }
.message .big { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--text); }

.footer { padding-block: 24px 88px; background: #fff; border-top: 1px solid var(--border); color: var(--muted); font-size: .875rem; }
.footer p { margin: 0; max-width: 65ch; }

/* Кнопка кошика внизу екрана — лише на телефоні */
.mobile-cart {
  position: fixed; left: var(--gutter); right: var(--gutter); bottom: 12px; z-index: 30;
  min-height: 50px; border: 0; border-radius: var(--radius); background: var(--text); color: #fff; font-weight: 600; box-shadow: var(--shadow);
}

/* ---------- Від 40rem (640px) ---------- */
@media (min-width: 40rem) {
  .header-row { flex-wrap: nowrap; min-height: 72px; padding-block: 0; }
  .logo { margin-right: 0; }
  .search { order: 0; flex: 1; }
  .controls { grid-template-columns: 1fr auto; align-items: center; }
  /* сітка як у КП №1: скільки влізе колонок, але не вужчих за 13rem */
  .grid { grid-template-columns: repeat(auto-fill, minmax(min(13rem, 100%), 1fr)); gap: 12px; }
  main { padding-bottom: 48px; }
  .footer { padding-bottom: 24px; }
  .mobile-cart { display: none; }
}

/* ---------- Від 56rem (896px) ---------- */
@media (min-width: 56rem) {
  .intro-row { grid-template-columns: auto 1fr; align-items: end; gap: 2.5rem; padding-block: 2rem; }
}
</style>
