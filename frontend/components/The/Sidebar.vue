<script setup lang="ts">
const navigationItems = [
  {
    title: 'Documents',
    path: '/documents',
    icon: 'material-symbols:description-outline',
  },
  {
    title: 'Chat',
    path: '/chat',
    icon: 'material-symbols:android-chat',
  },
  {
    title: 'Agents',
    path: '/agents',
    icon: 'material-symbols:robot-2-outline-rounded',
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: 'material-symbols:settings-outline-rounded',
  },
]
</script>

<template>
  <div class="h-full w-16 flex flex-col items-center py-8 gap-4 bg-slate-900">
    <nav
      v-for="item in navigationItems"
      :key="item.path"
      class="flex flex-col items-center"
    >
      <UTooltip :text="item.title">
        <NuxtLink
          :to="item.path"
          class="flex p-2 rounded-lg hover:bg-emerald-400/70 transition-all duration-300 ease-in-out"
        >
          <UIcon
            :name="item.icon"
            class="w-6 h-6"
          />
        </NuxtLink>
      </UTooltip>
    </nav>
  </div>
</template>

<style scoped>
.router-link-active {
  background-color: oklch(76.5% 0.177 163.223);
}
</style>
