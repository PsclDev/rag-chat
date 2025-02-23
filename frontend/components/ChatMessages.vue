<script setup lang="ts">
interface Reference {
    title: string;
    relevance: number; // 0-100
}

interface Agent {
    name: string;
    icon: string;
}

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    references?: Reference[];
    agent?: Agent;
}

const messages: Message[] = [
    {
        id: 1,
        role: 'user',
        content: 'Can you analyze these Q4 financial reports and focus on the revenue growth trends?',
        timestamp: '10:30 AM'
    },
    {
        id: 2,
        role: 'assistant',
        content: 'I\'ve reviewed the Q4 reports. The revenue shows a 15% YoY growth, with particularly strong performance in digital services (↑23%) and enterprise solutions (↑18%). The growth is primarily driven by increased customer adoption in APAC markets and successful upselling to existing clients. Would you like me to break down specific revenue streams?',
        timestamp: '10:31 AM',
        agent: {
            name: 'Generalist',
            icon: 'solar:chart-bold-duotone'
        },
        references: [
            { title: 'Q4 2023 Financial Report.pdf', relevance: 95 },
            { title: 'Revenue Analysis Dashboard - Q4.xlsx', relevance: 88 },
            { title: 'APAC Market Growth Strategy.doc', relevance: 75 }
        ]
    },
    {
        id: 3,
        role: 'user',
        content: 'Yes, please break down the main revenue streams and highlight any concerning trends.',
        timestamp: '10:32 AM'
    },
    {
        id: 4,
        role: 'assistant',
        content: 'Here\'s the breakdown of main revenue streams:\n\n1. Digital Services: $12.5M (↑23%)\n- Cloud solutions: $5.2M\n- API integrations: $4.8M\n- Mobile platforms: $2.5M\n\n2. Enterprise Solutions: $8.3M (↑18%)\n- Licensed software: $4.1M\n- Consulting: $2.7M\n- Support: $1.5M\n\nConcerning trends:\n- Traditional license revenue growth slowing (↑5% vs ↑12% last quarter)\n- Customer acquisition cost increased by 8%\n- EMEA market showing signs of saturation',
        timestamp: '10:33 AM',
        agent: {
            name: 'Financial Analyst',
            icon: 'solar:chart-bold-duotone'
        },
        references: [
            { title: 'Revenue Breakdown Q4 2023.xlsx', relevance: 98 },
            { title: 'CAC Analysis Report.pdf', relevance: 85 },
            { title: 'EMEA Market Report Q4.pdf', relevance: 82 },
            { title: 'License Revenue Trends 2023.xlsx', relevance: 78 }
        ]
    }
]
</script>

<template>
    <div class="flex-1 flex flex-col relative">
        <!-- Messages Area -->
        <div class="absolute inset-0 overflow-y-auto pb-[76px]">
            <div class="p-6 space-y-6">
                <div v-for="message in messages" :key="message.id" class="flex flex-col"
                    :class="[message.role === 'user' ? 'items-end' : 'items-start']">

                    <!-- Message Bubble -->
                    <div class="max-w-2xl rounded-2xl px-4 py-3" :class="[
                        message.role === 'user'
                            ? 'bg-emerald-500/10 text-emerald-50'
                            : 'bg-slate-700/50 text-slate-200'
                    ]">
                        <!-- Agent Identifier -->
                        <div v-if="message.role === 'assistant' && message.agent"
                            class="flex items-center gap-2 mb-2 pb-2">
                            <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10">
                                <UIcon :name="message.agent.icon" class="text-emerald-500 text-sm" />
                            </div>
                            <span class="text-sm font-medium text-emerald-500">{{ message.agent.name }}</span>
                        </div>

                        <div class="whitespace-pre-wrap text-sm">{{ message.content }}</div>

                        <!-- References Section -->
                        <div v-if="message.role === 'assistant' && message.references?.length"
                            class="mt-3 pt-3 border-t border-slate-600/50">
                            <div class="text-xs text-slate-400 mb-2">References:</div>
                            <div class="flex flex-wrap gap-2">
                                <div v-for="ref in message.references" :key="ref.title"
                                    class="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/50 text-xs">
                                    <UIcon name="i-heroicons-document" class="text-slate-400" />
                                    <span class="text-slate-300">{{ ref.title }}</span>
                                    <span class="text-emerald-500/70">{{ ref.relevance }}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timestamp -->
                    <span class="text-xs text-slate-500 mt-1">{{ message.timestamp }}</span>
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