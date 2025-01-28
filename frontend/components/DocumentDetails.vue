<template>
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
        <UCard>
            <!-- Header -->
            <template #header>
                <div class="flex items-center gap-3">
                    <UIcon :name="getFileIcon(document.type)" class="text-3xl text-emerald-400" />
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-slate-200">
                            {{ document.name }}
                        </h3>
                        <p class="text-sm text-slate-400">
                            {{ formatFileSize(document.size) }}
                            <span v-if="document.pageCount">• {{ document.pageCount }} pages</span>
                        </p>
                    </div>
                </div>
            </template>

            <!-- Content -->
            <div class="space-y-6">
                <!-- Status and Priority -->
                <div class="flex items-center gap-3">
                    <UBadge :color="getStatusColor(document.status)" size="sm">
                        {{ document.status.charAt(0).toUpperCase() + document.status.slice(1) }}
                    </UBadge>
                    <UBadge v-if="document.priority === 'high'" color="red" size="sm">High Priority</UBadge>
                    <span v-if="document.retryCount > 0" class="text-sm text-slate-400">
                        {{ document.retryCount }} retries
                    </span>
                </div>

                <!-- File Information -->
                <div class="space-y-2">
                    <h4 class="text-sm font-medium text-slate-300">File Information</h4>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span class="text-slate-400">Created:</span>
                            <span class="text-slate-200 ml-2">{{ formatDate(document.createdAt) }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">Last Modified:</span>
                            <span class="text-slate-200 ml-2">{{ formatDate(document.lastModified) }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">Type:</span>
                            <span class="text-slate-200 ml-2">{{ document.mimeType }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">Extension:</span>
                            <span class="text-slate-200 ml-2">{{ document.extension }}</span>
                        </div>
                    </div>
                </div>

                <!-- Tags -->
                <div v-if="document.tags.length > 0" class="space-y-2">
                    <h4 class="text-sm font-medium text-slate-300">Tags</h4>
                    <div class="flex flex-wrap gap-1">
                        <UBadge v-for="tag in document.tags" :key="tag" color="gray" size="sm">
                            {{ tag }}
                        </UBadge>
                    </div>
                </div>

                <!-- Processing Steps -->
                <div class="space-y-2">
                    <h4 class="text-sm font-medium text-slate-300">Processing Steps</h4>
                    <div class="space-y-2">
                        <div v-for="(step, index) in store.processingSteps" :key="step.id"
                            class="flex items-center gap-2 p-2 rounded" :class="[store.getStepClass(document, index).includes('bg-emerald') ? 'bg-emerald-500/10' :
                                store.getStepClass(document, index).includes('bg-yellow') ? 'bg-yellow-500/10' :
                                    'bg-slate-700/30']">
                            <div class="w-2 h-2 rounded-full"
                                :class="[store.getStepClass(document, index).replace('bg-slate-700', 'bg-slate-500')]">
                            </div>
                            <span class="text-sm text-slate-200">{{ step.label }}</span>
                        </div>
                    </div>
                </div>

                <!-- Error Message -->
                <div v-if="document.status === 'error' && document.errorMessage" class="space-y-2">
                    <h4 class="text-sm font-medium text-slate-300">Error Details</h4>
                    <p class="text-sm text-red-400 bg-red-500/10 p-2 rounded">
                        {{ document.errorMessage }}
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <template #footer>
                <div class="flex justify-between">
                    <div>
                        <UButton color="yellow" variant="solid" icon="i-heroicons-arrow-path"
                            @click="emit('reprocess', props.document)">
                            Reingest
                        </UButton>
                    </div>
                    <div class="flex gap-2">
                        <UButton color="gray" variant="solid" icon="i-heroicons-eye"
                            @click="emit('view', props.document)">
                            View
                        </UButton>
                        <UButton color="red" variant="solid" icon="i-heroicons-trash"
                            @click="emit('delete', props.document)">
                            Delete
                        </UButton>
                    </div>
                </div>
            </template>
        </UCard>
    </UModal>
</template>

<script setup lang="ts">
import { type Document, useDocumentsStore } from '~/stores/documents'

const store = useDocumentsStore()

const props = defineProps<{
    modelValue: boolean
    document: Document
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'view': [document: Document]
    'reprocess': [document: Document]
    'delete': [document: Document]
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

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

const getStatusColor = (status: Document['status']) => {
    switch (status) {
        case 'completed':
            return 'emerald'
        case 'processing':
            return 'yellow'
        case 'error':
            return 'red'
        default:
            return 'gray'
    }
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`
}

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }).format(date)
}
</script>