import type { FileDto, FileUploadResultDto, FileStatusStep, FileStatusDto } from '../types/file.types';

export const useFilesStore = defineStore("files", () => {
	const { socket } = useNotificationSocket();
	const baseUrl = useRuntimeConfig().public.apiBaseUrl;
	const files = ref<FileDto[]>([]);
	
	socket.on('fileStatusUpdate', (data: { fileId: string, status: FileStatusDto[] }) => {
		files.value = files.value.map(f => 
			f.id === data.fileId ? { ...f, status: data.status } : f
		);
	});

	async function getFiles() {
		try {
			const response = await fetch(`${baseUrl}/files`);
			const data = await response.json();
			files.value = data;
		} catch (error) {
			console.error('Error fetching files:', error);
			throw error;
		}
	}

	function getViewerData(id: string) {
		const file = files.value.find(f => f.id === id);
		if (!file) {
			return undefined;
		}

		return {
			name: file.originalname,
			url: `${baseUrl}/files/${id}`,
		}
	}

	async function addFile(newFiles: File[]): Promise<FileUploadResultDto> {
		const formData = new FormData()
		newFiles.forEach(file => {
			formData.append('files', file)
		})

		const response = await fetch(`${baseUrl}/file/upload`, {
			method: 'POST',
			body: formData
		})

		if (!response.ok) {
			throw new Error('Upload failed')
		}

		const result = await response.json() as FileUploadResultDto
		files.value = [...files.value, ...result.validFiles]

		return result
	}

	async function deleteFile(id: string) {
		const response = await fetch(`${baseUrl}/files/${id}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			throw new Error('Upload failed')
		}
		const index = files.value.findIndex((f) => f.id === id);
		if (index !== -1) {
			files.value.splice(index, 1);
		}
	}

	async function reprocessFile(id: string) {
		const response = await fetch(`${baseUrl}/ingestion/reingest/${id}`, {
			method: 'PATCH',
		})
	}

	return {
		files,
		getFiles,
		getViewerData,
		addFile,
		deleteFile,
		reprocessFile,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useFilesStore, import.meta.hot))
}