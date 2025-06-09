// PhysioRoutine Service Worker
const CACHE_NAME = 'physio-app-v1';
const STATIC_CACHE = 'physio-static-v1.0.0';
const DYNAMIC_CACHE = 'physio-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/api/placeholder/32/32',
    '/api/placeholder/16/16',
    '/api/placeholder/180/180',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Exercise images and dynamic content
const EXERCISE_IMAGES = [
    '/api/placeholder/300/200',
    '/api/placeholder/400/300'
];

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/exercises/images/hamstring-stretch.jpg',
    '/exercises/images/piriformis-stretch.jpg',
    '/exercises/images/standing-hip-flexor.jpg',
    '/exercises/images/straight-leg-raise.jpg',
    '/exercises/images/bridge.jpg',
    '/exercises/images/clamshells.jpg',
    '/exercises/images/cervical-retraction.jpg',
    '/exercises/images/thoracic-extension.jpg',
    '/exercises/images/lumbar-extension.jpg'
];

const MEDIA_CACHE_NAME = 'physio-app-media-v1';
const MEDIA_EXTENSIONS = ['.gif', '.mp4', '.jpg', '.png', '.webp'];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static files
            caches.open(CACHE_NAME).then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(ASSETS_TO_CACHE);
            }),
            // Cache exercise images
            caches.open(DYNAMIC_CACHE).then((cache) => {
                console.log('Service Worker: Caching exercise images');
                return cache.addAll(EXERCISE_IMAGES);
            }),
            caches.open(MEDIA_CACHE_NAME)
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            // Force activation of new service worker
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old caches
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== DYNAMIC_CACHE &&
                        cacheName !== MEDIA_CACHE_NAME &&
                        cacheName.startsWith('physio-')) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            // Take control of all clients
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external URLs (except fonts and placeholder images)
    if (url.origin !== location.origin && 
        !url.hostname.includes('fonts.googleapis.com') &&
        !url.pathname.includes('/api/placeholder/')) {
        return;
    }
    
    const isMediaFile = MEDIA_EXTENSIONS.some(ext => url.pathname.endsWith(ext));

    if (isMediaFile) {
        event.respondWith(
            caches.open(MEDIA_CACHE_NAME).then((cache) => {
                return cache.match(request).then((response) => {
                    if (response) return response;

                    return fetch(request).then((networkResponse) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        event.respondWith(
            caches.match(request).then((response) => {
                return response || fetch(request);
            })
        );
    }
});

// Background sync for data synchronization
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    
    if (event.tag === 'sync-routines') {
        event.waitUntil(syncRoutines());
    }
    
    if (event.tag === 'sync-progress') {
        event.waitUntil(syncProgress());
    }
});

async function syncRoutines() {
    try {
        // Implement routine synchronization logic here
        console.log('Service Worker: Syncing routines...');
        // This would typically sync with a backend server
        
        // For demo purposes, we'll just log
        console.log('Service Worker: Routines synced successfully');
    } catch (error) {
        console.error('Service Worker: Failed to sync routines:', error);
    }
}

async function syncProgress() {
    try {
        // Implement progress synchronization logic here
        console.log('Service Worker: Syncing progress...');
        // This would typically sync with a backend server
        
        console.log('Service Worker: Progress synced successfully');
    } catch (error) {
        console.error('Service Worker: Failed to sync progress:', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: 'Time for your physiotherapy routine!',
        icon: '/api/placeholder/192/192',
        badge: '/api/placeholder/72/72',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'start-routine',
                title: 'Start Routine',
                icon: '/api/placeholder/32/32'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/api/placeholder/32/32'
            }
        ]
    };
    
    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || 'PhysioRoutine Reminder';
    }
    
    event.waitUntil(
        self.registration.showNotification('PhysioRoutine', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification click received');
    
    event.notification.close();
    
    const action = event.action;
    
    if (action === 'start-routine') {
        // Open app and start most recent routine
        event.waitUntil(
            clients.openWindow('/?action=quick-start')
        );
    } else if (action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Periodic background sync (for browsers that support it)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'routine-reminder') {
        event.waitUntil(sendRoutineReminder());
    }
});

async function sendRoutineReminder() {
    try {
        // Check if user has routines and hasn't exercised today
        const hasRoutines = await checkUserHasRoutines();
        const exercisedToday = await checkExercisedToday();
        
        if (hasRoutines && !exercisedToday) {
            await self.registration.showNotification('PhysioRoutine Reminder', {
                body: 'Don\'t forget your daily physiotherapy routine!',
                icon: '/api/placeholder/192/192',
                badge: '/api/placeholder/72/72',
                tag: 'routine-reminder'
            });
        }
    } catch (error) {
        console.error('Service Worker: Failed to send routine reminder:', error);
    }
}

async function checkUserHasRoutines() {
    // This would check IndexedDB for user routines
    // For demo purposes, return true
    return true;
}

async function checkExercisedToday() {
    // This would check if user completed any routines today
    // For demo purposes, return false to show reminder
    return false;
}

// Handle service worker updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Clean up old caches periodically
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAN_CACHE') {
        event.waitUntil(cleanupOldCaches());
    }
});

async function cleanupOldCaches() {
    try {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
            name.startsWith('physio-') && 
            name !== STATIC_CACHE && 
            name !== DYNAMIC_CACHE &&
            name !== MEDIA_CACHE_NAME
        );
        
        await Promise.all(
            oldCaches.map(cacheName => caches.delete(cacheName))
        );
        
        console.log('Service Worker: Old caches cleaned up');
    } catch (error) {
        console.error('Service Worker: Failed to clean up caches:', error);
    }
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

console.log('Service Worker: Loaded successfully');