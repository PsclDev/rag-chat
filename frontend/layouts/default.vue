<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const togglePage = () => {
    if (route.path === '/chat') {
        router.push('/documents')
    } else {
        router.push('/chat')
    }
}

const getIcon = () => {
    if (route.path === '/chat') {
        return 'solar:documents-bold-duotone'
    } else {
        return 'solar:chat-dots-bold'
    }
}
</script>

<template>
    <div class="relative p-8">
        <button @click="togglePage"
            class="fixed bottom-6 left-6 p-3.5 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-slate-700/60 transition-all duration-300 z-50 border border-emerald-500/20 hover:border-emerald-500/50 group hover:shadow-lg hover:shadow-emerald-500/10">
            <UIcon :name="getIcon()"
                class="text-emerald-500 text-xl group-hover:scale-125 group-hover:rotate-3 transition-all duration-300 ease-out" />
        </button>

        <slot />
    </div>
</template>

<style scoped>
.fixed {
    position: fixed;
}
</style>
