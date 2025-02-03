export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    const swUrl = "/sw"; // Updated path to match the new route

    try {
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: "/",
      });

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      registration.active?.postMessage({ type: "INIT_IMAGE_CACHE" });

      // Add update checking
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker is installed and ready to take over
              console.log("New service worker installed");
            }
          });
        }
      });
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  }
};

export const precacheImages = (urls: string[]) => {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "PRECACHE_IMAGES",
      payload: urls,
    });
  }
};
