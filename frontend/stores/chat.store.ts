import type { ThreadDto, MessageDto } from '../types/chat.types';

export const useChatStore = defineStore("chat", () => {
	const { socket } = useChatSocket();
	const baseUrl = useRuntimeConfig().public.apiBaseUrl;
	const toast = useToast()
	const isLoading = ref(false);
	const activeThread = ref<ThreadDto | null>(null)
	const activeThreadIdx = ref(-1)
	const threads = ref<ThreadDto[]>([]);
	const currentThreadMessages = ref<MessageDto[]>([]);

	function newThread() {
		activeThreadIdx.value = -1;
		activeThread.value = null;
		currentThreadMessages.value = [];
	}
	
	function joinThread(threadIdx: number) {
		const thread = threads.value[threadIdx];
		if (!thread || !socket) return;

		activeThreadIdx.value = threadIdx;
		activeThread.value = thread;
		currentThreadMessages.value = thread.messages;
		socket.emit('join_thread', thread.id);
	}

	socket.on('thread_created', (data: ThreadDto) => {
		threads.value.unshift(data);
		joinThread(0);
	});

	socket.on('thread_updated', ({ messages, ...rest }: ThreadDto) => {
		const threadIdx = threads.value.findIndex(t => t.id === rest.id);
		if (threadIdx === -1) {
			return;
		}

		const existingThreads = [...threads.value];
		const thread = existingThreads[threadIdx];
		
		const updatedThread = {
			...thread,
			...rest,
			messages: thread.messages
		};
		existingThreads[threadIdx] = updatedThread;
		threads.value = existingThreads;

		if (threadIdx === activeThreadIdx.value) {
			activeThread.value = updatedThread;
		}
	});

	socket.on('message_received', (data: MessageDto) => {
		if (!activeThread.value) return;

		const updatedThread: ThreadDto = {
			...activeThread.value,
			messages: [...activeThread.value.messages, data],
			messageCount: activeThread.value.messageCount + 1,
			lastMessageAt: data.writtenAt
		};

		threads.value[activeThreadIdx.value] = updatedThread;
		activeThread.value = updatedThread;
		currentThreadMessages.value = updatedThread.messages;

		if (data.author === 'assistant') {
			isLoading.value = false;
		}
	});

	function sendMessage(message: string) {
		if (!socket) return;

		if (activeThreadIdx.value !== -1) {			
			socket.emit('send_message', {
				threadId: activeThread.value?.id,
				message,
			});
		} else {
			socket.emit('new_thread', {
				message,
			});
		}
		isLoading.value = true;
	}

	async function getThreads() {
		try {
			const response = await fetch(`${baseUrl}/chat-history`);
			const data = await response.json();
			threads.value = data;
		} catch (error) {
			toast.add({
				title: 'Error fetching chat history',
				description: error,
				color: 'error',
				icon: 'i-heroicons-exclamation-triangle',
			})
		}

	}

	return {
		isLoading,
		activeThread,
		activeThreadIdx,
		currentThreadMessages,
		threads,
		getThreads,
		newThread,
		joinThread,
		sendMessage,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot))
}