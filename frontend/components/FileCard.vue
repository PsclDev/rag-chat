<template>
    <div>
        <UCard class="bg-slate-900 border border-slate-800 hover:shadow-lg transition-shadow group relative">
            <div class="flex items-center p-4">
                <UIcon :name="useFileIcon(file.mimetype)" class="text-3xl text-emerald-400 mr-4" />
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-200 truncate">
                        {{ file.originalname }}
                    </p>
                    <p class="text-xs text-slate-400">
                        {{ formatFileSize(file.size) }}
                    </p>
                </div>
            </div>

            <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="absolute top-2 right-2">
                    <UButton size="md" color="neutral" variant="solid" icon="solar:eye-bold" @click="handleView">
                        View
                    </UButton>
                </div>

                <div class="h-full flex items-center justify-center gap-3">
                    <UButton size="sm" color="primary" variant="solid" icon="solar:info-square-bold"
                        @click="showDetails = true">
                        Details
                    </UButton>
                    <UButton size="sm" color="error" variant="solid" icon="solar:trash-bin-minimalistic-bold"
                        @click="showDeleteModal = true">
                        Delete
                    </UButton>
                </div>
            </div>

            <div class="px-4 pb-4 group-hover:opacity-20">
                <div class="flex gap-0.5 h-1">
                    <div v-for="(step) in processingSteps" :key="step.status"
                        class="flex-1 rounded-sm transition-colors duration-300"
                        :class="[getCardStepClass(step, file.status)]">
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">
                    {{ getCurrentStepLabel(file.status) }}
                </p>
            </div>
        </UCard>

        <FileDetails v-model="showDetails" :file="file" @view="handleView" @reprocess="showReingestModal = true"
            @delete="showDeleteModal = true" />

        <PdfEmbed v-model="showEmbed" :file-id="file.id" />

        <ConfirmModal v-model="showDeleteModal" title="Confirm Delete"
            :message="`Are you sure you want to delete '${file.originalname}'? This action cannot be undone.`"
            icon="i-heroicons-exclamation-triangle" icon-class="text-red-400" confirm-button-text="Delete"
            confirm-button-color="error" @confirm="handleDelete" />

        <ConfirmModal v-model="showReingestModal" title="Confirm Reingestion"
            :message="`Are you sure to reprocess '${file.originalname}'? All previous embeddings will be deleted.`"
            icon="i-heroicons-exclamation-triangle" icon-class="text-red-400" confirm-button-text="Reingest"
            confirm-button-color="error" @confirm="handleReprocess" />
    </div>
</template>

<script setup lang="ts">
import { useFilesStore } from '~/stores/files.store'
import type { FileDto } from '~/types/file.types'
const props = defineProps<{
    file: FileDto
}>()

const store = useFilesStore()
const { processingSteps, getCardStepClass, getCurrentStepLabel } = useFileStatus();
const showEmbed = ref(false)
const showDetails = ref(false)
const showDeleteModal = ref(false)
const showReingestModal = ref(false)

const handleView = () => {
    showEmbed.value = true
}

const handleReprocess = () => {
    store.reprocessFile(props.file.id)
}

const handleDelete = () => {
    store.deleteFile(props.file.id)
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`
}
</script>