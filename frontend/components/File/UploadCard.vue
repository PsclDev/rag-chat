<script setup lang="ts">
const fileInput = ref<HTMLInputElement | null>(null)
const showUploadModal = ref(false)
const selectedFiles = ref<File[]>([])

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
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
  console.log('files', files, 'selectedFiles', selectedFiles.value, 'showUploadModal', showUploadModal.value)
}

const handleUploadComplete = () => {
  selectedFiles.value = []
  showUploadModal.value = false
}
</script>

<template>
  <UCard class="bg-slate-900 shadow-lg border border-slate-800">
    <div
      class="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center transition-colors hover:border-slate-500"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <div>
        <UIcon
          name="material-symbols:upload-file"
          class="text-5xl mb-3 text-emerald-500"
        />
        <p class="cursor-default">
          Drop files here or
          <UButton
            variant="ghost"
            class="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors duration-300"
            @click="triggerFileInput"
          >
            browse
          </UButton>
        </p>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          multiple
          @change="handleFileSelect"
        >
      </div>
    </div>
  </UCard>

  <ModalFileUpload
    v-model="showUploadModal"
    :files="selectedFiles"
    @files-change="selectedFiles = $event"
    @upload-complete="handleUploadComplete"
  />
</template>
