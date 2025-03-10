<template>
    <div class="flex-1 flex flex-col relative">
        <!-- Messages Area -->
        <div class="absolute inset-0 overflow-y-auto pb-[76px]">
            <div class="p-6 space-y-6">
                <div v-for="message in messages" :key="message.id" class="flex flex-col"
                    :class="[message.author === 'user' ? 'items-end' : 'items-start']">

                    <!-- Message Bubble -->
                    <div class="max-w-2xl rounded-2xl px-4 py-3" :class="[
                        message.author === 'user'
                            ? 'bg-emerald-500/10 text-emerald-50'
                            : 'bg-slate-700/50 text-slate-200'
                    ]">
                        <div class="whitespace-pre-wrap text-sm">{{ message.content }}</div>
                    </div>

                    <!-- Timestamp -->
                    <span class="text-xs text-slate-500 mt-1">{{ new Date(message.timestamp).toLocaleString()
                    }}</span>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="absolute bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700/50">
            <div class="p-4 flex gap-4">
                <input type="text" placeholder="Type your message..."
                    class="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors">
                <UButton
                    class="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors"
                    variant="solid" icon="solar:plain-bold-duotone">
                </UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { MessageDto } from '~/types/chat.types'

const props = defineProps<{
    messages: MessageDto[]
}>()
</script>