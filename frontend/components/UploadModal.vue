<template>
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
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
                            <UIcon :name="store.getFileIcon(getFileType(file.type))"
                                class="text-2xl text-emerald-400" />
                            <div>
                                <p class="text-sm font-medium text-slate-200">{{ file.name }}</p>
                                <p class="text-xs text-slate-400">{{ formatFileSize(file.size) }}</p>
                            </div>
                        </div>
                        <UButton color="red" variant="ghost" icon="i-heroicons-x-mark" @click="removeFile(index)"
                            size="xs">
                            Remove
                        </UButton>
                    </div>
                </div>

                <!-- Upload Progress -->
                <div v-if="isUploading" class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-200">Uploading...</span>
                        <span class="text-slate-400">{{ uploadProgress }}%</span>
                    </div>
                    <div class="w-full bg-slate-700 rounded-full h-2">
                        <div class="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                            :style="{ width: `${uploadProgress}%` }"></div>
                    </div>
                </div>

                <!-- Error Message -->
                <p v-if="errorMessage" class="text-sm text-red-400">{{ errorMessage }}</p>
            </div>

            <!-- Footer -->
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton color="gray" variant="solid" :disabled="isUploading" @click="isOpen = false">
                        Cancel
                    </UButton>
                    <UButton color="emerald" variant="solid" :loading="isUploading"
                        :disabled="files.length === 0 || isUploading" @click="startUpload">
                        Upload
                    </UButton>
                </div>
            </template>
        </UCard>
    </UModal>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
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
const uploadProgress = ref(0)
const errorMessage = ref('')

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

const getFileType = (mimeType: string): 'pdf' | 'image' | 'spreadsheet' | 'document' => {
    if (mimeType.includes('pdf')) return 'pdf'
    if (mimeType.includes('image')) return 'image'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet'
    return 'document'
}

const startUpload = async () => {
    if (props.files.length === 0) return

    isUploading.value = true
    errorMessage.value = ''
    uploadProgress.value = 0

    try {
        const formData = new FormData()
        props.files.forEach(file => {
            formData.append('files', file)
        })

        const response = await fetch(`${config.public.apiBaseUrl}/file/upload`, {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            throw new Error('Upload failed')
        }

        const result = await response.json()

        // Add documents to store
        result.validFiles.forEach((file: any) => {
            store.addDocument({
                name: file.originalname,
                type: getFileType(file.mimetype),
                size: file.size
            })
        })

        isOpen.value = false
        emit('uploadComplete')
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Upload failed'
    } finally {
        isUploading.value = false
    }
}

// Simulate upload progress
watch(isUploading, (value) => {
    if (value) {
        const interval = setInterval(() => {
            if (uploadProgress.value < 90) {
                uploadProgress.value += Math.random() * 10
            }
            if (!isUploading.value) {
                clearInterval(interval)
                uploadProgress.value = 100
            }
        }, 200)
    }
})
</script>