<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// Спільне модальне вікно: затемнення, кнопка «закрити», закриття клавішею Esc
defineProps({ title: { type: String, required: true } })
const emit = defineEmits(['close'])
const dialog = ref(null)

function onKey(event) {
  if (event.key === 'Escape') emit('close')
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  dialog.value.focus() // фокус у вікно, щоб клавіатура працювала одразу
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <section ref="dialog" class="modal" role="dialog" aria-modal="true" :aria-label="title" tabindex="-1">
      <header class="modal-head">
        <h2>{{ title }}</h2>
        <button type="button" class="close" @click="emit('close')" aria-label="Закрити">✕</button>
      </header>
      <slot />
    </section>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 50; display: flex; align-items: flex-start; justify-content: center;
  padding: 4vh 1rem; background: rgba(17, 17, 23, .55); overflow-y: auto;
}
.modal {
  width: 100%; max-width: 760px; padding: 1.25rem 1.5rem 1.5rem; background: #fff; border-radius: 14px; box-shadow: var(--shadow);
}
.modal:focus { outline: none; }
.modal-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: .75rem; }
.modal-head h2 { font-size: 1.35rem; }
.close { width: 40px; height: 40px; flex-shrink: 0; border: 0; border-radius: 8px; background: #f2f2f5; font-size: 1rem; }
.close:hover { background: #e7e5f3; color: var(--accent); }
@media (max-width: 600px) {
  .overlay { padding: 0; }
  .modal { min-height: 100%; border-radius: 0; padding: 1rem; }
}
</style>
