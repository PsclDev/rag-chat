<template>
    <UModal v-model:open="isOpen">
        <template #content>
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
                        <UButton color="neutral" variant="ghost" class="text-white"
                            @click="$emit('update:modelValue', false)">
                            Cancel
                        </UButton>
                        <UButton :color="confirmButtonColor" @click="handleConfirm">
                            {{ confirmButtonText }}
                        </UButton>
                    </div>
                </template>
            </UCard>
        </template>
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
    confirmButtonColor?: 'error' | 'warning' | 'success' | 'info' | 'neutral'
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'confirm': []
}>()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const handleConfirm = () => {
    emit('confirm')
    emit('update:modelValue', false)
}
</script>