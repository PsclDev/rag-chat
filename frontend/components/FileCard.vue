<template>
    <div>
        <UCard class="bg-slate-800 border border-slate-700 hover:shadow-lg transition-shadow group relative">
            <!-- File Info -->
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
                    <UButton size="xs" color="red" variant="solid" icon="i-heroicons-trash"
                        @click="showDeleteModal = true">
                        Delete
                    </UButton>
                </div>
            </div>
        </UCard>

        <!-- Details Modal -->
        <FileDetails v-model="showDetails" :file="file" @view="handleView" @reprocess="handleReprocess"
            @delete="handleDelete" />

        <!-- PDF Embed Modal -->
        <PdfEmbed v-model="showEmbed" :file-id="file.id" />

        <!-- Delete Confirmation Modal -->
        <ConfirmModal v-model="showDeleteModal" title="Confirm Delete"
            :message="`Are you sure you want to delete '${file.originalname}'? This action cannot be undone.`"
            icon="i-heroicons-exclamation-triangle" icon-class="text-red-400" confirm-button-text="Delete"
            confirm-button-color="red" @confirm="handleDelete" />
    </div>
</template>

<script setup lang="ts">
import { useFilesStore } from '~/stores/files.store'
import type { FileDto } from '~/types/file.types'
const props = defineProps<{
    file: FileDto
}>()

const store = useFilesStore()
const showEmbed = ref(false)
const showDetails = ref(false)
const showDeleteModal = ref(false)

// Action handlers
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