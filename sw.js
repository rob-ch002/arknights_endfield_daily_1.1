"use strict";

const CACHE_NAME = "endfield-protocol-v31";
const OFFLINE_URL = "./offline.html";
const SHELL = [
  "./",
  "./index.html",
  "./dashboard.css",
  "./dashboard.js",
  "./config.js",
  "./manifest.webmanifest",
  "./offline.html",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(async () => (await caches.match("./index.html")) || caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data?.text() || "New Endfield alert" }; }
  const title = data.title || "Endfield Protocol";
  const options = {
    body: data.body || data.message || "New account notification.",
    icon: data.icon || "./assets/icon-192.png",
    badge: data.badge || "./assets/icon-192.png",
    tag: data.tag || `endfield-${Date.now()}`,
    renotify: Boolean(data.renotify),
    data: { url: data.url || "./?view=alerts", ...data.data },
    actions: [
      { action: "open", title: "Open Dashboard" },
      { action: "dismiss", title: "Dismiss" }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const targetUrl = new URL(event.notification.data?.url || "./", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      const existing = clients.find(client => client.url.startsWith(self.location.origin));
      if (existing) { existing.navigate(targetUrl); return existing.focus(); }
      return self.clients.openWindow(targetUrl);
    })
  );
});

function openRetryDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("endfield_retry_queue_v1", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("operations")) db.createObjectStore("operations", { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function retryQueueBestEffort() {
  const clients =
    await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

  if (!clients.length) {
    return;
  }

  clients.forEach(client => {
    client.postMessage({
      type:
        "retry-queue-process"
    });
  });
}

self.addEventListener("sync", event => {
  if (event.tag === "endfield-operation-retry") event.waitUntil(retryQueueBestEffort());
});
