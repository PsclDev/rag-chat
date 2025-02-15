import type { FileDto, FileUploadResultDto, FileStatusStep } from '../types/file.types';

export const useFilesStore = defineStore("files", () => {
	const baseUrl = useRuntimeConfig().public.apiBaseUrl;
	const files = ref<FileDto[]>([]);

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

	function getFileUrl(id: string) {
		return `${baseUrl}/files/${id}`
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

	function reprocessFile(id: string) {
		// TODO: Implement api request
	}

	return {
		files,
		getFiles,
		getFileUrl,
		addFile,
		deleteFile,
		reprocessFile,
	};
});
