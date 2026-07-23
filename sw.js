"use strict";

const CACHE_NAME = "endfield-protocol-v31-1";
const OFFLINE_URL = "./offline.html";

const STATIC_SHELL = [
  "./offline.html",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon.svg"
];

const MUTABLE_PATHS = new Set([
  "/index.html",
  "/config.js",
  "/dashboard.js",
  "/dashboard.css"
]);

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallbackRequest = request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request, {
      cache: "no-store"
    });

    if (response && response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (_) {
    return (
      (await cache.match(request)) ||
      (await caches.match(fallbackRequest))
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(async response => {
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      networkFirst(
        event.request,
        "./offline.html"
      )
    );
    return;
  }

  const normalizedPath =
    url.pathname.endsWith("/")
      ? "/index.html"
      : url.pathname.replace(
          self.registration.scope
            ? new URL(self.registration.scope).pathname.replace(/\/$/, "")
            : "",
          ""
        );

  const mutable =
    MUTABLE_PATHS.has(normalizedPath) ||
    /\/(config|dashboard)\.(js|css)$/.test(url.pathname);

  if (mutable) {
    event.respondWith(
      networkFirst(event.request)
    );
    return;
  }

  event.respondWith(
    staleWhileRevalidate(event.request)
  );
});

self.addEventListener("push", event => {
  let data = {};

  try {
    data =
      event.data
        ? event.data.json()
        : {};
  } catch (_) {
    data = {
      body:
        event.data?.text() ||
        "New Endfield alert"
    };
  }

  const title =
    data.title ||
    "Endfield Protocol";

  const options = {
    body:
      data.body ||
      data.message ||
      "New account notification.",
    icon:
      data.icon ||
      "./assets/icon-192.png",
    badge:
      data.badge ||
      "./assets/icon-192.png",
    tag:
      data.tag ||
      `endfield-${Date.now()}`,
    renotify:
      Boolean(data.renotify),
    data: {
      url:
        data.url ||
        "./?view=alerts",
      ...data.data
    },
    actions: [
      {
        action: "open",
        title: "Open Dashboard"
      },
      {
        action: "dismiss",
        title: "Dismiss"
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl =
    new URL(
      event.notification.data?.url ||
      "./",
      self.location.origin
    ).href;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(clients => {
        const existing =
          clients.find(client =>
            client.url.startsWith(
              self.location.origin
            )
          );

        if (existing) {
          existing.navigate(targetUrl);
          return existing.focus();
        }

        return self.clients.openWindow(
          targetUrl
        );
      })
  );
});

function openRetryDb() {
  return new Promise(
    (resolve, reject) => {
      const request =
        indexedDB.open(
          "endfield_retry_queue_v1",
          1
        );

      request.onupgradeneeded =
        () => {
          const db =
            request.result;

          if (
            !db.objectStoreNames
              .contains("operations")
          ) {
            db.createObjectStore(
              "operations",
              {
                keyPath: "id",
                autoIncrement: true
              }
            );
          }
        };

      request.onsuccess =
        () => resolve(request.result);

      request.onerror =
        () => reject(request.error);
    }
  );
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
  if (
    event.tag ===
    "endfield-operation-retry"
  ) {
    event.waitUntil(
      retryQueueBestEffort()
    );
  }
});
