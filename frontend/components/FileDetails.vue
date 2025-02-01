<template>
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
        <UCard>
            <!-- Header -->
            <template #header>
                <div class="flex items-center gap-3">
                    <UIcon :name="store.getFileIcon(file.type)" class="text-3xl text-emerald-400" />
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-slate-200">
                            {{ file.name }}
                        </h3>
                        <p class="text-sm text-slate-400">
                            {{ formatFileSize(file.size) }}
                            <span v-if="file.pageCount">• {{ file.pageCount }} pages</span>
                        </p>
                    </div>
                </div>
            </template>

            <!-- Content -->
            <div class="space-y-6">
                <!-- Status and Priority -->
                <div class="flex items-center gap-3">
                    <UBadge :color="getStatusColor(file.status)" size="sm">
                        {{ file.status.charAt(0).toUpperCase() + file.status.slice(1) }}
                    </UBadge>
                    <UBadge v-if="file.priority === 'high'" color="red" size="sm">High Priority</UBadge>
                    <span v-if="file.retryCount > 0" class="text-sm text-slate-400">
                        {{ file.retryCount }} retries
                    </span>
                </div>

                <!-- File Information -->
                <div class="space-y-2">
                    <h4 class="text-sm font-medium text-slate-300">File Information</h4>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span class="text-slate-400">Created:</span>
                            <span class="text-slate-200 ml-2">{{ formatDate(file.createdAt) }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">Last Modified:</span>
                            <span class="text-slate-200 ml-2">{{ formatDate(file.lastModified) }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">Type:</span>
                            <span class="text-slate-200 ml-2">{{ file.mimeType }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">Extension:</span>
                            <span class="text-slate-200 ml-2">{{ file.extension }}</span>
                        </div>
                    </div>
                </div>

                <!-- Tags -->
                <div v-if="file.tags.length > 0" class="space-y-2">
                    <h4 class="text-sm font-medium text-slate-300">Tags</h4>
                    <div class="flex flex-wrap gap-1">
                        <UBadge v-for="tag in file.tags" :key="tag" color="gray" size="sm">
                            {{ tag }}
                        </UBadge>
                    </div>
                </div>

                <!-- Processing Steps -->
                <div class="space-y-2">
                    <h4 class="text-sm font-medium text-slate-300">Processing Steps</h4>
                    <div class="space-y-2">
                        <div v-for="(step, index) in store.processingSteps" :key="step.id"
                            class="flex items-center gap-2 p-2 rounded" :class="[store.getStepClass(file, index).includes('bg-emerald') ? 'bg-emerald-500/10' :
                                store.getStepClass(file, index).includes('bg-yellow') ? 'bg-yellow-500/10' :
                                    'bg-slate-700/30']">
                            <div class="w-2 h-2 rounded-full"
                                :class="[store.getStepClass(file, index).replace('bg-slate-700', 'bg-slate-500')]">
                            </div>
                            <span class="text-sm text-slate-200">{{ step.label }}</span>
                        </div>
                    </div>
                </div>

                <!-- Error Message -->
                <div v-if="file.status === 'error' && file.errorMessage" class="space-y-2">
                    <h4 class="text-sm font-medium text-slate-300">Error Details</h4>
                    <p class="text-sm text-red-400 bg-red-500/10 p-2 rounded">
                        {{ file.errorMessage }}
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <template #footer>
                <div class="flex justify-between">
                    <div>
                        <UButton color="yellow" variant="solid" icon="i-heroicons-arrow-path"
                            @click="emit('reprocess', props.file)">
                            Reingest
                        </UButton>
                    </div>
                    <div class="flex gap-2">
                        <UButton color="gray" variant="solid" icon="i-heroicons-eye" @click="emit('view', props.file)">
                            View
                        </UButton>
                        <UButton color="red" variant="solid" icon="i-heroicons-trash"
                            @click="emit('delete', props.file)">
                            Delete
                        </UButton>
                    </div>
                </div>
            </template>
        </UCard>
    </UModal>
</template>

<script setup lang="ts">
import { type File, useFilesStore } from '~/stores/files.store'

const store = useFilesStore()

const props = defineProps<{
    modelValue: boolean
    file: File
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'view': [file: File]
    'reprocess': [file: File]
    'delete': [file: File]
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const getStatusColor = (status: File['status']) => {
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