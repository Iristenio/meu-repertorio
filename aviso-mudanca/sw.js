// Substitui o service worker do app antigo: apaga a cópia guardada no aparelho, se desliga
// e recarrega as telas abertas, que passam a mostrar o aviso de mudança de endereço.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      for (const nome of await caches.keys()) await caches.delete(nome);
      await self.registration.unregister();
      for (const cliente of await self.clients.matchAll({ type: 'window' })) cliente.navigate(cliente.url);
    })(),
  );
});
