<template>
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
        <UCard>
            <!-- Header -->
            <template #header>
                <div class="flex items-center gap-3">
                    <UIcon :name="useFileIcon(file.mimetype)" class="text-3xl text-emerald-400" />
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-slate-200">
                            {{ file.originalname }}
                        </h3>
                    </div>
                </div>
            </template>

            <!-- Content -->
            <div class="space-y-6">
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
                            <span class="text-slate-200 ml-2">{{ formatDate(file.updatedAt) }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">Type:</span>
                            <span class="text-slate-200 ml-2">{{ file.mimetype }}</span>
                        </div>
                        <div>
                            <span class="text-slate-400">Extension:</span>
                            <span class="text-slate-200 ml-2">{{ file.mimetype.split('/')[1] }}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <h4 class="text-sm font-medium text-slate-300">Processing Steps</h4>
                    <div class="space-y-2">
                        <div v-for="step in processingSteps" :key="step.status"
                            class="flex items-center gap-2 p-2 rounded"
                            :class="[getDetailStepClass(step, file.status)]">
                            <div class="w-2 h-2 rounded-full" :class="[getCardStepClass(step, file.status)]">
                            </div>
                            <span class="text-sm text-slate-200">{{ step.label }}</span>
                        </div>
                    </div>
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
import type { FileDto } from '~/types/file.types'

const { processingSteps, getDetailStepClass, getCardStepClass } = useFileStatus();

const props = defineProps<{
    modelValue: boolean
    file: FileDto
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'view', file: FileDto): void
    (e: 'reprocess', file: FileDto): void
    (e: 'delete', file: FileDto): void
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }).format(new Date(date))
}
</script>