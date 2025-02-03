import { NextResponse } from "next/server";

export async function GET() {
 

  const serviceWorkerContent = `
    const CACHE_NAME = 'image-cache-v1';
    const CACHE_LIMIT = 200;

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => cache.addAll(['/default-profile.png']))
      );
    });

    self.addEventListener('activate', (event) => {
      event.waitUntil(
        caches.keys().then(keys => 
          Promise.all(keys.map(key => 
            key !== CACHE_NAME ? caches.delete(key) : null
          ))
        )
      );
    });

    self.addEventListener('message', (event) => {
      if (event.data.type === 'PRECACHE_IMAGES') {
        event.waitUntil(
          caches.open(CACHE_NAME).then(cache => 
            Promise.all(
              event.data.payload.map(url => 
                cache.match(url).then(res => res || fetch(url))
              )
            )
          )
        );
      }
    });

    self.addEventListener('fetch', (event) => {
      if (event.request.destination === 'image') {
        event.respondWith(
          caches.open(CACHE_NAME).then(cache => 
            cache.match(event.request).then(response => {
              if (response) return response;
              
              return fetch(event.request).then(networkResponse => {
                cache.put(event.request, networkResponse.clone());
                enforceCacheLimit();
                return networkResponse;
              }).catch(() => caches.match('/default-profile.png'));
            })
          )
        );
      }
    });

    async function enforceCacheLimit() {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      
      if (keys.length > CACHE_LIMIT) {
        await Promise.all(
          keys.slice(0, keys.length - CACHE_LIMIT).map(key => cache.delete(key))
        );
      }
    }
  `;

  return new NextResponse(serviceWorkerContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
