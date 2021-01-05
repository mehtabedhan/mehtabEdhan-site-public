'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "9837981cec1c4a38acd66d3c1af04168",
"assets/assets/parralax_bg/parralax_bg1.png": "475f41d1adbdd595770d3323466c65db",
"assets/assets/parralax_bg/parralax_bg2.png": "475f41d1adbdd595770d3323466c65db",
"assets/assets/parralax_bg/parralax_bg3.png": "475f41d1adbdd595770d3323466c65db",
"assets/assets/parralax_bg/parralax_bg_1.png": "fcd640ec45b07d207a11e98d88451015",
"assets/assets/parralax_bg/parralax_bg_2.png": "3d6f04f0cab91d1ae76ad115b19c8958",
"assets/assets/parralax_bg/parralax_bg_3.png": "664c502ed766b4594c062444a0e79447",
"assets/assets/secondPageCarousel/secondPageCarousel_1.jpg": "5a4a2955ec1ee86974640aaa35490ad2",
"assets/assets/secondPageCarousel/secondPageCarousel_2.jpg": "66ae7a8e3ebae9303b06789e645f7e41",
"assets/assets/secondPageCarousel/skybl-16.jpg": "dadd6eb0b5eb6746ea9c38ff04d95cbd",
"assets/assets/splashIcon.png": "e536e2f5c1af29fa87fb5525859b4a46",
"assets/FontManifest.json": "01700ba55b08a6141f33e168c4a6c22f",
"assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"assets/LICENSE": "1c7f8e26cb658c06a8def795d93ebf2a",
"assets/NOTICES": "17340bdbacd5371b505258c25113f314",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "dff0eb48c3d9cf199d3881ea28ad595f",
"/": "dff0eb48c3d9cf199d3881ea28ad595f",
"main.dart.js": "c8aad48465928440dda08e98e6f1f87c",
"manifest.json": "ae1614c04dd2a37d15dd38f571b796b2",
"mehtabedhan_portfolio-1.2.zip": "42c6616bb3a1293def98cb832cdb50e4",
"mehtabedhan_portfolio-1.5.zip": "82350dc1edd034c85f20547c00138cfc",
"mehtabedhan_portfolio_1.0.zip": "57270820c2e09629add753616fee124f",
"mehtabedhan_portfolio_1.3.zip": "6af413c00da7f46179a127c58a969e0e",
"mehtabedhan_portfolio_1.6.zip": "5651f183ce3151e093ba830c09b4df46",
"mehtanbedhan_portfolio_1.1.zip": "a5f76e7981069bac8161664d230af01d",
"mehtanbedhan_portfolio_1.4.zip": "6122f0b025b63a4fce58415cab09a301"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/LICENSE",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a no-cache param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'no-cache'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'no-cache'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.message == 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message = 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.add(resourceKey);
    }
  }
  return Cache.addAll(resources);
}
