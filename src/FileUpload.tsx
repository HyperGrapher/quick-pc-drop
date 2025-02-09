import React, { useState, useEffect } from "react";
import axios, { type AxiosResponse } from "axios";

const FileUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pcIp, setPcIp] = useState<string>("");

    // On mount, retrieve any saved IP from localStorage
    useEffect(() => {
        const savedIp = localStorage.getItem("pcIp");
        if (savedIp) {
            setPcIp(savedIp);
        }
    }, []);

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    // Update local state and storage when the user changes the PC IP
    const handleIpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const ip = event.target.value;
        setPcIp(ip);
        localStorage.setItem("pcIp", ip);
    };

    // Upload the file to the server at the user-configured IP
    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }
        if (!pcIp) {
            alert("Please enter your local PC IP address.");
            return;
        }

        try {
            // Construct the URL using the user-configured PC IP
            const uploadUrl = `http://${pcIp}:5005`;
            console.log("Uploading file to:", uploadUrl);
            const response: AxiosResponse = await axios.post(uploadUrl, selectedFile, {
                headers: {
                    "x-app-security-code": "secret-pass",
                    "x-file-name": selectedFile.name,
                    "Content-Type": selectedFile.type || "application/octet-stream",
                },
            });

            alert("File uploaded successfully!");
            console.log("Upload response:", response.data);
        } catch (error) {
            console.error("Error during file upload:", error);
            alert("File upload failed.");
        }
    };

    return (
        <div className="max-w-lg mx-auto">

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

            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="user_avatar">Upload file</label>
            <input className="block pl-2 py-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 
            dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                aria-describedby="file-selector" type="file" onChange={handleFileChange} />
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="user_avatar_help">
                Select a file and make sure upload server is running on the same network!!
            </div>

            <button
                className='btn mt-4 w-full bg-amber-300 hover:bg-amber-400 cursor-pointer font-bold px-3 py-1 rounded shadow-2xl'
                onClick={handleUpload}>
                Upload
            </button>
        </div>
    )


};

export default FileUpload;
