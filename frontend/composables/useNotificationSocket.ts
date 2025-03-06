import { ref } from 'vue'
import type { Socket } from 'socket.io-client'

const socketInstance = ref<Socket | null>(null)

export function useNotificationSocket() {
    const { $notificationSocket } = useNuxtApp()
    
    if (!socketInstance.value) {
        socketInstance.value = $notificationSocket
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