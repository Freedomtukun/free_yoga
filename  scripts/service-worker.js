const CACHE_NAME = 'smartyoga-cache-v1';

// 需要缓存的资源
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/images/default-avatar.png',
  '/favicon.ico',
  '/offline.html',
  '/manifest.json'
];

// 在安装阶段缓存必要资源
self.addEventListener('install', event => {
  // 等待直到所有资源都被缓存
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // 确保新的 Service Worker 立即激活
  );
});

// 当服务工作线程激活时，清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除不在白名单中的缓存
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 控制所有客户端
  );
});

// 拦截请求并提供缓存响应 (优先网络，回退到缓存)
self.addEventListener('fetch', event => {
  // 只处理GET请求
  if (event.request.method !== 'GET') return;
  
  // 不缓存API请求
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    // 尝试从网络获取
    fetch(event.request)
      .then(response => {
        // 请求成功，克隆响应以缓存
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // 网络请求失败，从缓存中提供资源
        return caches.match(event.request)
          .then(cachedResponse => {
            // 如果缓存中有响应，返回它
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // 如果是HTML请求，返回离线页面
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // 没有离线响应可返回
            return new Response('网络不可用，且未找到离线缓存', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// 后台同步（当网络重新连接时使用）
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pose-data') {
    event.waitUntil(syncPoseData());
  }
});

// 模拟将离线保存的数据同步到服务器
async function syncPoseData() {
  // 从IndexedDB获取离线保存的数据并同步
  const db = await openDB('offlineStore', 1);
  const tx = db.transaction('poseData', 'readonly');
  const store = tx.objectStore('poseData');
  const offlineData = await store.getAll();
  
  // 发送每条记录
  const syncPromises = offlineData.map(async (data) => {
    try {
      await fetch('/api/poses/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify(data.record)
      });
      
      // 同步成功后从存储中删除
      const deleteTx = db.transaction('poseData', 'readwrite');
      const deleteStore = deleteTx.objectStore('poseData');
      await deleteStore.delete(data.id);
    } catch (error) {
      console.error('同步数据失败:', error);
    }
  });
  
  await Promise.all(syncPromises);
}

// 辅助函数：打开IndexedDB
function openDB(dbName, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    
    request.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('poseData')) {
        db.createObjectStore('poseData', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}