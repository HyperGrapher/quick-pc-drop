/* eslint-env serviceworker */


precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("message", async (event) => {
    if (event.data && event.data.type === "UPLOAD_FILE") {
      const { url, fileName, contentType, data } = event.data;
      try {
        const response = await fetch(url, {
          method: "POST",
          body: data,
          headers: {
            "x-app-security-code": "secret-pass",
            "x-file-name": fileName,
            "Content-Type": contentType,
          },
          // Ensure we don't use any cached responses
          cache: 'no-store',
        });
  
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
  
        // Send success message back to the client
        event.source.postMessage({
          type: "UPLOAD_RESPONSE",
          success: true,
          fileName: fileName
        });
      } catch (error) {
        console.error("Service Worker upload error:", error);
        // Send error message back to the client
        event.source.postMessage({
          type: "UPLOAD_RESPONSE",
          success: false,
          error: error.message,
          fileName: fileName
        });
      }
    }
  });
  
  // Listen for the activate event and claim clients
  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());

    console.log('Service Worker activated and clients are claimed.');
  });