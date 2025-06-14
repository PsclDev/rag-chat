<script setup lang="ts">
import { useDocumentStore } from '~/stores/document.store'

const store = useDocumentStore()
const { documents } = storeToRefs(store)
const { getCurrentStep } = useFileStatus()
const searchQuery = ref('')
const statusFilter = ref('all')

onMounted(async () => {
  await store.getDocuments()
  const notificationSocket = useNotificationSocket()
  notificationSocket.connect()
})

const filteredDocuments = computed(() =>
  documents.value
    .filter((document) => {
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        if (!document.file.originalname.toLowerCase().includes(query)) {
          return false
        }
      }

      // Apply status filter
      if (statusFilter.value !== 'all') {
        const currentStep = getCurrentStep(document.status)
        if (currentStep !== statusFilter.value) {
          return false
        }
      }

      return true
    }),
)

const gridColumns = computed(() => {
  const length = filteredDocuments.value.length
  return {
    'grid-cols-2 sm:grid-cols-2': length >= 1,
    'md:grid-cols-3': length < 15,
    'md:grid-cols-4': length >= 15,
    'lg:grid-cols-3': length < 12,
    'lg:grid-cols-4': length >= 12,
    'lg:grid-cols-5': length >= 25,
  }
})
</script>

<template>
  <div>
    <FileUploadCard />

    <div class="my-8 space-y-4">
      <div class="relative">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search files..."
          class="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
        >
      </div>

      <StatusFilter v-model="statusFilter" />
    </div>

    <TransitionGroup
      tag="div"
      class="grid gap-4 auto-cols-fr"
      :class="gridColumns"
      name="grid"
      appear
    >
      <DocumentCard
        v-for="document in filteredDocuments"
        :key="document.id"
        :document="document"
      />
    </TransitionGroup>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

@keyframes pulse-subtle {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.animate-pulse-subtle {
    animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    will-change: opacity;
}

.grid-move {
    transition: transform 0.5s ease;
}

.grid-enter-active,
.grid-leave-active {
    transition: all 0.5s ease;
}

.grid-enter-from,
.grid-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.grid-leave-active {
    position: absolute;
}
</style>
