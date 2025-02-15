<template>
  <div class="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-space-grotesk">
    <!-- Upload Dropzone -->
    <UCard class="mb-4 bg-slate-800 shadow-lg border border-slate-700">
      <div
        class="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center transition-colors hover:border-slate-500"
        @dragover.prevent @drop.prevent="handleDrop">
        <UIcon name="i-heroicons-cloud-arrow-up" class="text-5xl mb-3 text-emerald-400" />
        <p class="text-slate-300 text-base">
          Drop files here or
          <UButton variant="ghost" class="text-emerald-400 hover:text-emerald-300" @click="triggerFileInput">browse
          </UButton>
        </p>
        <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileSelect" />
      </div>
    </UCard>

    <!-- Search and Filters -->
    <div class="mb-8 space-y-4">
      <!-- Search Bar -->
      <div class="relative">
        <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="searchQuery" type="text" placeholder="Search files..."
          class="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors" />
      </div>

      <!-- Filter Chips -->
      <StatusFilter v-model="statusFilter" />
    </div>

    <!-- Document Grid -->
    <TransitionGroup tag="div" class="grid gap-4 auto-cols-fr" :class="gridColumns" name="grid" appear>
      <FileCard v-for="file in filteredFiles" :key="file.id" :file="file" />
    </TransitionGroup>

    <!-- Upload Modal -->
    <UploadModal v-model="showUploadModal" :files="selectedFiles" @files-change="selectedFiles = $event"
      @upload-complete="handleUploadComplete" />
  </div>
</template>

<script setup lang="ts">
import { useFilesStore } from '~/stores/files.store'

useHead({
  title: 'KI-Run\'s RAG',
})

const store = useFilesStore()
const { files } = storeToRefs(store)
const { getCurrentStep } = useFileStatus()
const fileInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const statusFilter = ref('all')
const showUploadModal = ref(false)
const selectedFiles = ref<File[]>([])

onMounted(async () => {
  await store.getFiles()
})

const filteredFiles = computed(() =>
  files.value
    .filter(file => {
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        if (!file.originalname.toLowerCase().includes(query)) {
          return false
        }
      }

      // Apply status filter
      if (statusFilter.value !== 'all') {
        const currentStep = getCurrentStep(file.status)
        if (currentStep !== statusFilter.value) {
          return false
        }
      }

      return true
    })
)

const gridColumns = computed(() => {
  const length = filteredFiles.value.length
  return {
    'grid-cols-1 sm:grid-cols-2': length >= 1,
    'md:grid-cols-3': length < 15,
    'md:grid-cols-4': length >= 15,
    'lg:grid-cols-3': length < 12,
    'lg:grid-cols-4': length >= 12,
    'lg:grid-cols-5': length >= 25,
  }
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const files = Array.from(input.files)
    handleFiles(files)
  }
}

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files)
    handleFiles(files)
  }
}

const handleFiles = (files: File[]) => {
  selectedFiles.value = files
  showUploadModal.value = true
}

const handleUploadComplete = () => {
  selectedFiles.value = []
  showUploadModal.value = false
}

</script>

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
