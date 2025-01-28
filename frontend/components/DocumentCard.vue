<template>
    <UCard class="bg-slate-800 border border-slate-700 hover:shadow-lg transition-shadow group relative">
        <!-- Document Info -->
        <div class="flex items-center p-4">
            <UIcon :name="getFileIcon(document.type)" class="text-3xl text-emerald-400 mr-4" />
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-200 truncate">
                    {{ document.name }}
                </p>
                <p class="text-xs text-slate-400">
                    {{ formatFileSize(document.size) }}
                </p>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- Details Button (Top Right) -->
            <div class="absolute top-2 right-2">
                <UButton size="xs" color="gray" variant="solid" icon="i-heroicons-eye" @click="$emit('view', document)">
                    View
                </UButton>
            </div>

            <!-- Center Buttons -->
            <div class="h-full flex items-center justify-center gap-3">
                <UButton size="xs" color="blue" variant="solid" icon="i-heroicons-information-circle"
                    @click="showDetails = true">
                    Details
                </UButton>
                <UButton size="xs" color="yellow" variant="solid" icon="i-heroicons-arrow-path"
                    @click="$emit('reprocess', document)">
                    Reingest
                </UButton>
                <UButton size="xs" color="red" variant="solid" icon="i-heroicons-trash"
                    @click="$emit('delete', document)">
                    Delete
                </UButton>
            </div>
        </div>

        <!-- Processing Steps -->
        <div class="px-4 pb-4">
            <div class="flex gap-0.5 h-1">
                <div v-for="(step, index) in store.processingSteps" :key="step.id"
                    class="flex-1 rounded-sm transition-colors duration-300" :class="[store.getStepClass(document, index),
                    document.status === 'processing' && index === document.currentStep ? 'animate-pulse-subtle' : '']">
                </div>
            </div>
            <p class="text-xs text-slate-400 mt-2">
                {{ store.getCurrentStepLabel(document) }}
            </p>
        </div>
    </UCard>

    <DocumentDetails v-model="showDetails" :document="document" @view="$emit('view', document)"
        @reprocess="$emit('reprocess', document)" @delete="$emit('delete', document)" />
</template>

<script setup lang="ts">
import { type Document, useDocumentsStore } from '~/stores/documents'

const store = useDocumentsStore()
const showDetails = ref(false)

const props = defineProps<{
    document: Document
}>()

defineEmits<{
    (e: 'view', document: Document): void
    (e: 'reprocess', document: Document): void
    (e: 'delete', document: Document): void
}>()

const getFileIcon = (type: Document['type']) => {
    switch (type) {
        case 'pdf':
            return 'i-heroicons-document-text'
        case 'image':
            return 'i-heroicons-photo'
        case 'spreadsheet':
            return 'i-heroicons-table-cells'
        default:
            return 'i-heroicons-document'
    }
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`
}
</script>