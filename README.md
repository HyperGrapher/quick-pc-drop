# Quick PC Drop

Quick PC Drop is a lightweight file upload solution that allows users to send files from their mobile or desktop browser to a PC over a local network.

## 📌 Features
- Simple local network file uploads
- Lightweight C-based file upload server
- Progressive Web App (PWA) for easy file transfer
- No third-party dependencies for the client (uses native Fetch API)

## 🔗 Web App
Visit **[quickpcdrop.vercel.com](https://quickpcdrop.vercel.com)** on your mobile or desktop browser.

### Installing the PWA
1. Open **[quickpcdrop.vercel.com](https://quickpcdrop.vercel.com)** in **Google Chrome** or a PWA-supported browser.
2. Click the **Install** icon in the URL bar.
3. The app will be added to your home screen for quick access.

## 🖥️ Setting Up the File Upload Server
### 1️⃣ Download and Compile the C Server

#### Windows 10 (MSYS2 GCC)
```sh
# Install MSYS2 if not already installed
pacman -S mingw-w64-x86_64-gcc

# Clone the repository and compile
gcc -o quickpcdrop_server quickpcdrop_server.c -mwindows
```

#### Ubuntu Linux
```sh
# Install GCC if not installed
sudo apt install gcc

# Clone the repository and compile
gcc -o quickpcdrop_server quickpcdrop_server.c
```

### 2️⃣ Run the Server
```sh
./quickpcdrop_server
```
By default, the server listens on port **5005**.

### 3️⃣ Configure Your Mobile App
1. Open the **Quick PC Drop PWA**.
2. Enter your PC’s **local network IP address** (e.g., `192.168.1.2`).
3. Upload a file, and it will be saved on your PC.

## 📡 Network Requirements
- The PC and the mobile device must be on the same local Wi-Fi network.
- Ensure that **port 5005** is open on your firewall.
- If using **nginx**, configure it to forward requests to port 5005.

## 🛠️ Troubleshooting
### File Uploads Are Failing?
1. Check if the C server is running.
2. Verify the firewall settings (allow traffic on port **5005**).
3. Ensure your mobile and PC are on the same network.

### CORS Issues?
- The C server includes CORS headers; if you still face issues, clear browser cache and restart the server.

## 📜 License
This project is open-source and licensed under the **MIT License**.

## 🙌 Contributing
Feel free to submit issues or pull requests to improve Quick PC Drop!

---
💡 **Developed with efficiency in mind!**

