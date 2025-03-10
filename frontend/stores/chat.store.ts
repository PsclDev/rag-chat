import type { ThreadDto } from '../types/chat.types';

export const useChatStore = defineStore("chat", () => {
	const baseUrl = useRuntimeConfig().public.apiBaseUrl;
	const threads = ref<ThreadDto[]>([]);

	async function getThreads() {
		try {
			const response = await fetch(`${baseUrl}/chat-history`);
			const data = await response.json();
			threads.value = data;
		} catch (error) {
			console.error('Error fetching files:', error);
			throw error;
		}
	}
	
	return {
		threads,
		getThreads
	};
});
