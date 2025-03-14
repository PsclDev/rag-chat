<template>
    <div class="flex-1 flex flex-col relative">
        <!-- Messages Area -->
        <div ref="messagesContainer" class="absolute inset-0 overflow-y-auto pb-[76px]">
            <div class="flex flex-col gap-5 p-6 h-full">
                <div v-if="currentThreadMessages.length === 0"
                    class="flex items-center justify-center h-full -mt-[76px]">
                    <div class="flex flex-col items-center max-w-3xl w-full">
                        <p class="text-slate-200 text-2xl font-medium mb-8">Ask me anything</p>
                        <div class="flex gap-4 w-full justify-center">
                            <button v-for="question in exampleQuestions" :key="question"
                                @click="handleQuestionClick(question)"
                                class="px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 transition-all duration-200 cursor-pointer hover:bg-emerald-500/20">
                                {{ question }}
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else v-for="message in currentThreadMessages" :key="message.id" class="flex flex-col"
                    :class="[message.author === 'user' ? 'items-end' : 'items-start']">
                    <div class="max-w-2xl rounded-2xl px-4 py-3" :class="[
                        message.author === 'user'
                            ? 'bg-emerald-500/10 text-emerald-50'
                            : 'bg-slate-700/50 text-slate-200'
                    ]">
                        <div class="whitespace-pre-wrap text-sm">{{ message.content }}</div>
                    </div>

                    <span class="text-xs text-slate-500 mt-1">{{ new Date(message.writtenAt).toLocaleString()
                        }}</span>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="absolute bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700/50">
            <div class="p-4 flex gap-4">
                <textarea type="text" placeholder="Type your message..." @keyup="handleKeyUp" @input="autoResize"
                    :disabled="isLoading" v-model="chatInput" ref="textareaRef"
                    class="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"></textarea>

                <UButton
                    class="self-end h-[50px] px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors"
                    variant="solid" icon="solar:plain-bold-duotone" @click="sendMessage">
                </UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const store = useChatStore()
const { currentThreadMessages, isLoading } = storeToRefs(store)
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const chatInput = ref('')
const exampleQuestions = [
    "What can you help me with?",
    "How do I get started?",
    "Tell me about your capabilities"
]

const handleQuestionClick = (question: string) => {
    chatInput.value = question
    sendMessage()
}

const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        sendMessage()
    }
}

const sendMessage = () => {
    store.sendMessage(chatInput.value)
    chatInput.value = ''
}

const autoResize = () => {
    const textarea = textareaRef.value
    if (!textarea) return;

    textarea.style.height = '50px'
    const newHeight = Math.min(textarea.scrollHeight, 144)
    textarea.style.height = `${newHeight}px`
}

watch(currentThreadMessages, () => {
    nextTick(() => {
        scrollToBottom()
    })
})

const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}
</script>

<style scoped>
textarea {
    height: 50px;
    max-height: 144px;
    resize: none;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

textarea::-webkit-scrollbar {
    display: none;
}
</style>