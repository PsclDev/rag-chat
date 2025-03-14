<template>
    <div class="w-80 h-full border-r border-slate-700/50">
        <div class="p-4 border-b border-slate-700/50">
            <h2 class="text-lg font-medium text-slate-200">Conversations</h2>
        </div>

        <div class="overflow-y-auto h-[calc(100vh-8rem)]">
            <template v-for="(section) in groupedThreads" :key="section.title">
                <template v-if="section.threads.length">
                    <div
                        class="px-4 py-2 text-xs font-bold underline underline-offset-8 text-slate-400 bg-slate-800/30">
                        {{ section.title
                        }}</div>
                    <div v-for="thread in section.threads" :key="thread.id"
                        @click="store.joinThread(getThreadIndex(thread))"
                        class="p-4 cursor-pointer transition-all duration-200 border-l-2" :class="{
                            'bg-slate-800/50 border-emerald-500': activeThreadIdx === getThreadIndex(thread),
                            'hover:bg-slate-800/30 border-transparent': activeThreadIdx !== getThreadIndex(thread)
                        }">
                        <p class="text-sm text-slate-300 line-clamp-2">{{ thread.title }}</p>
                        <div class="flex items-center gap-2 mt-2">
                            <span class="text-xs text-slate-500">{{ formatTime(thread.lastMessageAt) }}</span>
                            <div class="w-1 h-1 rounded-full bg-slate-700"></div>
                            <span class="text-xs text-slate-500">{{ thread.messageCount }} messages</span>
                        </div>
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ThreadDto } from '~/types/chat.types'

const store = useChatStore()
const { threads, activeThreadIdx } = storeToRefs(store)

const getThreadIndex = (thread: ThreadDto) => {
    return threads.value.findIndex(t => t.id === thread.id)
}

const groupedThreads = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return {
        today: {
            title: 'Today',
            threads: threads.value.filter(thread => {
                const threadDate = new Date(thread.lastMessageAt)
                threadDate.setHours(0, 0, 0, 0)
                return threadDate.getTime() === today.getTime()
            })
        },
        yesterday: {
            title: 'Yesterday',
            threads: threads.value.filter(thread => {
                const threadDate = new Date(thread.lastMessageAt)
                threadDate.setHours(0, 0, 0, 0)
                return threadDate.getTime() === yesterday.getTime()
            })
        },
        older: {
            title: 'Older',
            threads: threads.value.filter(thread => {
                const threadDate = new Date(thread.lastMessageAt)
                threadDate.setHours(0, 0, 0, 0)
                return threadDate.getTime() < yesterday.getTime()
            })
        }
    }
})

const formatTime = (date: string) => {
    const threadDate = new Date(date)
    const yesterdayOrToday = new Date()
    yesterdayOrToday.setHours(0, 0, 0, 0)
    yesterdayOrToday.setDate(yesterdayOrToday.getDate() - 1)

    if (threadDate.getTime() >= yesterdayOrToday.getTime()) {
        return threadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
        return threadDate.toLocaleDateString()
    }
}
</script>