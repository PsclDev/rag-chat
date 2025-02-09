<template>
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-6xl' }">
        <UCard>
            <!-- Header -->
            <template #header>
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-slate-200">PDF Embed</h3>
                </div>
            </template>

            <!-- Body -->
            <div class="space-y-4">
                <VuePdfEmbed :source="fileUrl" />
            </div>
        </UCard>
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

const fileUrl = computed(() => store.getFileUrl(props.fileId))
</script>