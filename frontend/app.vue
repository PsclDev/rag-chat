<template>
  <UApp>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-space-grotesk">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>

<script setup lang="ts">
useHead({
  title: 'KI-Run\'s RAG',
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
</style>
