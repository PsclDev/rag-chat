<template>
    <UModal v-model:open="isOpen">
        <template #content>
            <UCard>
                <!-- Header -->
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-slate-200">Upload Files</h3>
                        <p class="text-sm text-slate-400">{{ files.length }} files selected</p>
                    </div>
                </template>

                <!-- Body -->
                <div class="space-y-4">
                    <!-- File List -->
                    <div class="max-h-96 overflow-y-auto space-y-2">
                        <div v-for="(file, index) in files" :key="index"
                            class="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <UIcon :name="useFileIcon(file.type)" class="text-2xl text-emerald-400" />
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-slate-200">{{ file.name }}</p>
                                    <p class="text-xs text-slate-400">{{ formatFileSize(file.size) }}</p>
                                    <p v-if="isFileRejected(file.name)" class="text-xs text-red-400 mt-1">
                                        {{ getRejectedMessage(file.name) }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <template v-if="rejectedFileStatus.length > 0">
                                    <UIcon v-if="!isFileRejected(file.name)" name="i-heroicons-check-circle"
                                        class="text-2xl text-emerald-400" />
                                    <UIcon v-else name="i-heroicons-x-circle" class="text-2xl text-red-400" />
                                </template>
                                <UButton v-if="!isUploading && rejectedFileStatus.length === 0" color="error"
                                    variant="ghost" icon="i-heroicons-x-mark" @click="removeFile(index)" size="sm">
                                    Remove
                                </UButton>
                            </div>
                        </div>
                    </div>

                    <!-- Upload Progress -->
                    <div v-if="isUploading" class="space-y-2">
                        <UProgress animation="swing" />
                    </div>
                </div>

                <!-- Footer -->
                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton variant="ghost" :disabled="isUploading" @click="isOpen = false" class="text-white">
                            Cancel
                        </UButton>
                        <UButton loading-auto color="success" variant="solid" :loading="isUploading"
                            class="text-gray-900" :disabled="files.length === 0 || isUploading" @click="startUpload">
                            Upload
                        </UButton>
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { RejectedFileDto } from '~/types/file.types'

const store = useFilesStore()

const props = defineProps<{
    modelValue: boolean
    files: File[]
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'filesChange': [files: File[]]
    'uploadComplete': []
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const isUploading = ref(false)
const rejectedFileStatus = ref<{ filename: string, message: string }[]>([])

const removeFile = (index: number) => {
    const newFiles = [...props.files]
    newFiles.splice(index, 1)
    emit('filesChange', newFiles)
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`
}

const startUpload = async () => {
    if (props.files.length === 0) return

    isUploading.value = true
    try {
        const result = await store.addFile(props.files)

        if (result.rejectedFiles.length === 0) {
            isOpen.value = false
            emit('uploadComplete')
        }

        rejectedFileStatus.value = result.rejectedFiles.map((file: RejectedFileDto) => ({
            filename: file.file.originalname,
            message: file.reason
        }))


    } catch (error) {
        console.log(error)
    } finally {
        isUploading.value = false
    }
}

const isFileRejected = (filename: string) => {
    return rejectedFileStatus.value.some(file => file.filename === filename)
}

const getRejectedMessage = (filename: string) => {
    return rejectedFileStatus.value.find(file => file.filename === filename)?.message
}
</script>