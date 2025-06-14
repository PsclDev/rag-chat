<script setup lang="ts">
useHead({
  title: 'KI-Chat',
})
</script>

<template>
  <UApp
    :toaster="{ position: 'top-right' }"
    :tooltip="{ disabled: false }"
  >
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white font-space-grotesk">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
</style>
