importScripts('/javascripts/idb-keyval.js');

var cacheName = '117';

cacheSource = [
  '/javascripts/test.js?V=2',
  '/images/huoying.jpg',
  '/stylesheets/style6.css'
]

//用于判断用户第一次注册service worker,不提示更新
let isFirstServiceWorker = true;

//安装阶段跳过等待，直接进入 active
self.addEventListener('install', function(event) {
      let p = Promise.all([// 清理旧版本
        caches.keys().then(function (cacheList) {
            return Promise.all(
                cacheList.map(function (cName) {
                    isFirstServiceWorker = false;
                    if (cName !== cacheName) {
                        return caches.delete(cName);
                    }
                })
            );
        }),
        caches.open(cacheName).then(cache => cache.addAll(cacheSource))
    ]);
    p.then(()=>{
      self.skipWaiting()
    })


    event.waitUntil(p);
});

self.addEventListener('activate', event => {
  let p = self.clients.claim();
  if( ! isFirstServiceWorker ){
    p.then(()=>{
      self.clients.matchAll().then(clientList => {
          clientList.forEach(client => {
              //client.postMessage('reload');
          })
      });
    })
  }

  event.waitUntil(p);

});

//fetch  接口不缓存sw.js 和 接口请求
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      if (response) {
        return response;
      }

      var fetchRequest = event.request.clone();
      console.log('请求：',fetchRequest)
      return fetch(fetchRequest).then(
        function(fetchResponse) {
          if(!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }

          var responseToCache = fetchResponse.clone();

          if(checkFileExt( responseToCache.url )){
            console.log('保存：',responseToCache.url)
            caches.open(cacheName)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          }


          return fetchResponse;
        }
      );
    })
  );
});

//检测文件后缀名
function checkFileExt(filename){
   var flag = false; //状态
   var arr = ["jpg","png","gif",'css','js'];
   //取出上传文件的扩展名
   var index = filename.lastIndexOf(".");
   var ext = filename.substr( index + 1 );

   for( var i = 0; i < arr.length; i++ ){
     if( ext.indexOf(arr[i]) > 0 ){
      flag = true;
      break;
     }
   }
   return flag;
}
// The sync event for the contact form
self.addEventListener('sync', function (event) {
  console.log(333333333,event.tag)
  if (event.tag === 'content') {
        console.log(44444444444)
        event.waitUntil(
          idbKeyval.get('sendMessage').then(value =>{
              console.log(5555555555,value)
              fetch('/sendMessage/', {
                method: 'POST',
                headers: new Headers({ 'content-type': 'application/json' }),
                body: JSON.stringify(value)
              }).then( response =>{

                if( response.status == 200 ) {
                  // 删除客户端存储的数据
                  idbKeyval.delete('sendMessage');

                  response.json().then(function(data){
                      console.log("后台已经保存了：",data)
                  });
                }
              })
            }
          )
        );
    }
});

self.addEventListener('push', function (event) {

  var payload = event.data ? JSON.parse(event.data.text()) : 'no payload';

  var title = 'da ming ge';

  //显示消息
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.msg,
      url: payload.url,
      icon: payload.icon
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  clients.openWindow('http://localhost:8087');

}, false);
