import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const apiBaseUrlWs = useRuntimeConfig().public.apiBaseUrlWs
  const notificationSocket = io(apiBaseUrlWs, {
    autoConnect: false,
  });

  return {
    provide: { notificationSocket },
  };
});
