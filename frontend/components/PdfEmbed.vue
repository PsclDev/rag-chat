<template>
    <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-6xl h-full' }">
        <template #content>
            <UCard class="h-full" v-if="info">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-slate-200">{{ info.name }}</h3>
                    </div>
                </template>

                <div class="space-y-4 flex justify-center h-full">
                    <VuePdfEmbed :source="info.url" />
                </div>
            </UCard>
            <UCard v-else>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-slate-200">File not found</h3>
                    </div>
                </template>

                <div class="space-y-4">
                    <p>The file might have been moved or deleted.</p>
                </div>
            </UCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
const store = useFilesStore()

const props = defineProps<{
    modelValue: boolean
    fileId: string
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const info = store.getViewerData(props.fileId)
</script>