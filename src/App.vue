<script setup>
import { onMounted, ref } from 'vue'

// Перший крок: просто завантажуємо каталог з JSON через fetch і виводимо список
const products = ref([])

onMounted(async () => {
  const response = await fetch(import.meta.env.BASE_URL + 'products.json')
  products.value = await response.json()
})
</script>

<template>
  <h1>MetaGear</h1>
  <ul>
    <li v-for="product in products" :key="product.id">{{ product.name }} — {{ product.price }} ₴</li>
  </ul>
</template>
