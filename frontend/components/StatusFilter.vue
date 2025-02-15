<template>
    <div class="flex flex-wrap gap-2">
        <button v-for="status in ['all', 'queued', 'processing', 'completed', 'error']" :key="status"
            @click="$emit('update:modelValue', status)"
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors" :class="[
                modelValue === status
                    ? 'bg-emerald-400 text-slate-900'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            ]">
            <div class="flex items-center gap-2">
                <div v-if="status === 'processing'" class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div v-else-if="status === 'completed'" class="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <div v-else-if="status === 'error'" class="w-2 h-2 bg-red-400 rounded-full"></div>
                <div v-else-if="status === 'queued'" class="w-2 h-2 bg-slate-400 rounded-full"></div>
                {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                <span class="text-xs opacity-75">({{ statusCounts(status) }})</span>
            </div>
        </button>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    modelValue: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const store = useFilesStore()
const { getCurrentStep } = useFileStatus()
const { files } = storeToRefs(store)

function statusCounts(status: string) {
    if (status === "all") return files.value.length;
    return files.value.filter(file => getCurrentStep(file.status) === status).length;
}
</script>