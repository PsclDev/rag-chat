import { ref } from 'vue'
import type { Socket } from 'socket.io-client'

const socketInstance = ref<Socket | null>(null)

export function useChatSocket() {
    const { $chatSocket } = useNuxtApp()
    
    if (!socketInstance.value) {
        socketInstance.value = $chatSocket
    }

    const connect = () => {
        if (socketInstance.value) {
            socketInstance.value.connect()
        }
    }

    return {
        connect,
        socket: socketInstance.value
    }
}