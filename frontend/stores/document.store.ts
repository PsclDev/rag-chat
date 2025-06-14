import type { DocumentDto } from '../types/document.types'

export const useDocumentStore = defineStore('documents', () => {
  const { socket } = useNotificationSocket()
  const baseUrl = useRuntimeConfig().public.apiBaseUrl
  const toast = useToast()
  const documents = ref<DocumentDto[]>([])

  async function getDocuments() {
    try {
      const response = await fetch(`${baseUrl}/documents`)
      const data = await response.json()
      documents.value = data
    }
    catch (error) {
      toast.add({
        title: 'Error fetching documents',
        description: error,
        color: 'error',
        icon: 'i-heroicons-exclamation-triangle',
      })
    }
  }

  return {
    documents,
    getDocuments,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDocumentStore, import.meta.hot))
}
