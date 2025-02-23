<script setup lang="ts">
const threads = [
    "Analysis of Q4 financial reports with focus on revenue growth",
    "Technical documentation review for the new API endpoints",
    "Marketing strategy brainstorming session notes",
    "Customer feedback summary from recent product launch",
    "Project timeline and milestone planning discussion",
    "Bug report analysis for the mobile app version 2.1",
    "Team meeting notes about upcoming feature releases",
    "Vendor comparison for cloud infrastructure services"
]

const activeThread = ref(0)

const selectThread = (index: number) => {
    activeThread.value = index
}
</script>

<template>
    <div class="w-80 h-full border-r border-slate-700/50">
        <div class="p-4 border-b border-slate-700/50">
            <h2 class="text-lg font-medium text-slate-200">Conversations</h2>
        </div>

        <div class="overflow-y-auto h-[calc(100vh-8rem)]">
            <div v-for="(thread, index) in threads" :key="index" @click="selectThread(index)"
                class="p-4 cursor-pointer transition-all duration-200 border-l-2" :class="{
                    'bg-slate-800/50 border-emerald-500': activeThread === index,
                    'hover:bg-slate-800/30 border-transparent': activeThread !== index
                }">
                <p class="text-sm text-slate-300 line-clamp-2">{{ thread }}</p>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs text-slate-500">{{ new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 *
                        1000).toLocaleDateString() }}</span>
                    <div class="w-1 h-1 rounded-full bg-slate-700"></div>
                    <span class="text-xs text-slate-500">{{ Math.floor(Math.random() * 20 + 5) }} messages</span>
                </div>
            </div>
        </div>
    </div>
</template>