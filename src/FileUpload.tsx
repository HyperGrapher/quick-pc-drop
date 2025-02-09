import React, { useState, useEffect } from "react";

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pcIp, setPcIp] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");

  useEffect(() => {
    if (navigator.serviceWorker.controller) {
      console.log('SW REGISTERED');
    } else {
      console.error('SW is not registered')
    }
  }, []);

  // On mount, load any saved IP from localStorage
  useEffect(() => {
    const savedIp = localStorage.getItem("pcIp");
    if (savedIp) {
      setPcIp(savedIp);
    }

    // Add message listener for service worker responses
    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === "UPLOAD_RESPONSE") {
        if (event.data.success) {
          setUploadStatus(`Successfully uploaded ${event.data.fileName}`);
        } else {
          setUploadStatus(`Failed to upload ${event.data.fileName}: ${event.data.error}`);
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', messageHandler);

    return () => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
    };
  }, []);

  // Handle PC IP input change and persist it
  const handleIpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const ip = event.target.value;
    setPcIp(ip);
    localStorage.setItem("pcIp", ip);
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file);
      }
    }
  };

  // Upload the file by sending it to the service worker via postMessage
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first.");
      return;
    }
    if (!pcIp) {
      setUploadStatus("Please enter your local PC IP address.");
      return;
    }

    setUploadStatus("Starting upload...");

    const reader = new FileReader();
    reader.onload = async () => {
      // Wait for service worker registration
      const registration = await navigator.serviceWorker.ready;

      if (registration.active) {
        console.log("✔ Service worker found.");

        // Construct the target URL from the user-configured IP address
        const targetUrl = `http://${pcIp}:5005`;
        // Send a message to the service worker with file details and binary data
        registration.active.postMessage({
          type: "UPLOAD_FILE",
          url: targetUrl,
          fileName: selectedFile.name,
          contentType: selectedFile.type || "application/octet-stream",
          data: reader.result, // ArrayBuffer containing file data
        });
      } else {
        console.error("🚨 No active service worker found!");
        setUploadStatus("Service worker not active.");
      }
    };

    reader.onerror = () => {
      setUploadStatus("Error reading file.");
    };

    // Read the file as an ArrayBuffer so we can pass binary data to the SW
    reader.readAsArrayBuffer(selectedFile);
  };


  return (
    <>
      <div className="max-w-lg mx-auto bg">

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="user_avatar">Server IP</label>
          <input
            className="block pl-2 py-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 
            dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            type="text"
            value={pcIp}
            onChange={handleIpChange}
            placeholder="e.g., 192.168.1.2"
          />
        </div>

        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="user_avatar">Upload! file</label>
        <input className="block pl-2 py-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 
            dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          aria-describedby="file-selector" type="file" onChange={handleFileChange} />
        <div className="mt-1 text-sm text-gray-800 dark:text-gray-300" id="user_avatar_help">
          Select a file and make sure upload server is running on the same network!!
        </div>

        <button
          className='btn mt-4 w-full bg-amber-300 hover:bg-amber-400 cursor-pointer font-bold px-3 py-1 rounded shadow-2xl'
          onClick={handleUpload}>
          Upload
        </button>
      </div>

      {uploadStatus && (
        <div className="mt-4 p-3 rounded text-slate-300 text-sm">
          {uploadStatus}
        </div>
      )}
    </>
  )


};

export default FileUpload;