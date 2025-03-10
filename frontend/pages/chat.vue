<template>
    <div class="bg-slate-800 rounded-lg border border-slate-700 shadow-lg min-h-[calc(100vh-4rem)] flex">
        <ChatThreadList :threads="threads" :active-thread="activeThread" @selected-thread="selectThread" />
        <ChatMessages v-if="messages.length > 0" :messages="messages" />
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'

const store = useChatStore()
const { threads } = storeToRefs(store)

onMounted(async () => {
    await store.getThreads()
})

const activeThread = ref(0)

const selectThread = (index: number) => {
    activeThread.value = index
}

const messages = computed(() => {
    return threads.value[activeThread.value]?.messages ?? []
})
</script>