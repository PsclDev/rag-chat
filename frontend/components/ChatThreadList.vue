<template>
    <div class="w-80 h-full border-r border-slate-700/50">
        <div class="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 class="text-lg font-medium text-slate-200">Conversations</h2>
            <button @click="store.newThread()"
                class="p-1 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-slate-700/60 transition-all duration-300 z-50 border border-emerald-500/20 hover:border-emerald-500/50 group hover:shadow-lg hover:shadow-emerald-500/10">
                <UIcon name="solar:pen-new-round-bold"
                    class="text-emerald-500 text-xl group-hover:scale-115 group-hover:rotate-3 transition-all duration-300 ease-out" />
            </button>
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
                        <transition name="fade-scale" mode="out-in">
                            <p :key="thread.title" class="text-sm text-slate-300 line-clamp-2">{{ thread.title }}</p>
                        </transition>
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
    const currentThreads = threads.value
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    return {
        today: {
            title: 'Today',
            threads: currentThreads.filter(thread => {
                const threadDate = new Date(thread.lastMessageAt)
                threadDate.setHours(0, 0, 0, 0)
                return threadDate.getTime() === today.getTime()
            })
        },
        yesterday: {
            title: 'Yesterday',
            threads: currentThreads.filter(thread => {
                const threadDate = new Date(thread.lastMessageAt)
                threadDate.setHours(0, 0, 0, 0)
                return threadDate.getTime() === yesterday.getTime()
            })
        },
        older: {
            title: 'Older',
            threads: currentThreads.filter(thread => {
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

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.fade-scale-enter-to,
.fade-scale-leave-from {
    opacity: 1;
    transform: scale(1);
}
</style>