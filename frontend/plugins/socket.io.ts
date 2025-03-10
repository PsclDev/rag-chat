import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const apiBaseUrlWs = useRuntimeConfig().public.apiBaseUrlWs;

  const chatSocket = io(`${apiBaseUrlWs}/chat`, {
    autoConnect: false,
  });
  const notificationSocket = io(`${apiBaseUrlWs}/notification`, {
    autoConnect: false,
  });

  return {
    provide: { chatSocket, notificationSocket },
  };
});
