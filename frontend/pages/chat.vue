<template>
    <div class="bg-slate-800 rounded-lg border border-slate-700 shadow-lg min-h-[calc(100vh-4rem)] flex">
        <ChatThreadList />
        <ChatMessages />
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'

const store = useChatStore()

onMounted(async () => {
    await store.getThreads()
    const chatSocket = useChatSocket();
    chatSocket.connect();
})
</script>