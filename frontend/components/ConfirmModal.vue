<template>
    <UModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <UCard>
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon :name="icon" class="text-xl" :class="iconClass" />
                    <h3 class="text-lg font-semibold text-slate-200">{{ title }}</h3>
                </div>
            </template>

            <p class="text-slate-300">
                {{ message }}
            </p>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton color="gray" variant="ghost" @click="$emit('update:modelValue', false)">
                        Cancel
                    </UButton>
                    <UButton :color="confirmButtonColor" @click="handleConfirm">
                        {{ confirmButtonText }}
                    </UButton>
                </div>
            </template>
        </UCard>
    </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: boolean
    title: string
    message: string
    icon: string
    iconClass?: string
    confirmButtonText: string
    confirmButtonColor?: 'red' | 'yellow' | 'emerald' | 'blue' | 'gray'
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'confirm': []
}>()

const handleConfirm = () => {
    emit('confirm')
    emit('update:modelValue', false)
}
</script>