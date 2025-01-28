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
    <TransitionGroup tag="div" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" name="grid"
      appear>
      <DocumentCard v-for="doc in filteredDocuments" :key="doc.id" :document="doc" @view="viewDocument"
        @reprocess="reprocessDocument" @delete="deleteDocument" />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { type Document, useDocumentsStore } from '~/stores/documents'

const store = useDocumentsStore()
const fileInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const statusFilter = ref('all')

const filteredDocuments = computed(() =>
  store.getFilteredDocuments(searchQuery.value, statusFilter.value)
)

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
  for (const file of files) {
    store.addDocument({
      name: file.name,
      type: getFileType(file.type),
      size: file.size,
    })
  }
}

const getFileType = (mimeType: string): Document['type'] => {
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('image')) return 'image'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet'
  return 'document'
}

const viewDocument = (document: Document) => {
  console.log('View document:', document.name)
}

const reprocessDocument = (document: Document) => {
  store.reprocessDocument(document.id)
}

const deleteDocument = (document: Document) => {
  store.deleteDocument(document.id)
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
