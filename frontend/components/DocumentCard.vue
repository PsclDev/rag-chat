<template>
    <div>
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
                    <UButton size="xs" color="gray" variant="solid" icon="i-heroicons-eye" @click="handleView">
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
                        @click="showReprocessModal = true">
                        Reingest
                    </UButton>
                    <UButton size="xs" color="red" variant="solid" icon="i-heroicons-trash"
                        @click="showDeleteModal = true">
                        Delete
                    </UButton>
                </div>
            </div>

            <!-- Processing Steps -->
            <div class="px-4 pb-4">
                <div class="flex gap-0.5 h-1">
                    <div v-for="(step, index) in store.processingSteps" :key="step.id"
                        class="flex-1 rounded-sm transition-colors duration-300"
                        :class="[store.getStepClass(document, index),
                        document.status === 'processing' && index === document.currentStep ? 'animate-pulse-subtle' : '']">
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">
                    {{ store.getCurrentStepLabel(document) }}
                </p>
            </div>
        </UCard>

        <!-- Details Modal -->
        <DocumentDetails v-model="showDetails" :document="document" @view="handleView" @reprocess="handleReprocess"
            @delete="handleDelete" />

        <!-- Reprocess Confirmation Modal -->
        <ConfirmModal v-model="showReprocessModal" title="Confirm Reprocess"
            :message="`Are you sure you want to reprocess '${document.name}'? This will restart the processing from the beginning.`"
            icon="i-heroicons-arrow-path" icon-class="text-yellow-400" confirm-button-text="Reprocess"
            confirm-button-color="yellow" @confirm="handleReprocess" />

        <!-- Delete Confirmation Modal -->
        <ConfirmModal v-model="showDeleteModal" title="Confirm Delete"
            :message="`Are you sure you want to delete '${document.name}'? This action cannot be undone.`"
            icon="i-heroicons-exclamation-triangle" icon-class="text-red-400" confirm-button-text="Delete"
            confirm-button-color="red" @confirm="handleDelete" />
    </div>
</template>

<script setup lang="ts">
import { type Document, useDocumentsStore } from '~/stores/documents'

const props = defineProps<{
    document: Document
}>()

const store = useDocumentsStore()
const showDetails = ref(false)
const showReprocessModal = ref(false)
const showDeleteModal = ref(false)

// Action handlers
const handleView = () => {
    // Here you can implement the view logic
    // For example, opening a preview modal or navigating to a view page
    console.log('View document:', props.document.name)
}

const handleReprocess = () => {
    store.reprocessDocument(props.document.id)
}

const handleDelete = () => {
    store.deleteDocument(props.document.id)
}

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