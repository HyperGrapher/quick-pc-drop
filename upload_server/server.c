/*
 * Lightweight HTTP File Upload Server with CORS Support
 *
 * Listens on port 5005, accepts file uploads via HTTP POST,
 * verifies the header "x-app-security-code" equals "secret-pass",
 * extracts the file name from the header "x-file-name",
 * and saves the file to disk under the directory defined by STORE_PATH.
 *
 * CORS is enabled:
 *  - The server responds to OPTIONS preflight requests.
 *  - All HTTP responses include the proper CORS headers.
 *
 * On Windows, a MessageBox is displayed with the upload result.
 */

// Build command:
// gcc -o file_server.exe file_server-cors.c -lws2_32 -luser32


#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#ifdef _WIN32
    #include <winsock2.h>
    #include <windows.h>
    // Use _stricmp as the equivalent for strcasecmp.
    #define strcasecmp _stricmp
    #pragma comment(lib, "ws2_32.lib")
#else
    #include <unistd.h>
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
#endif

#define PORT 5005
#define BUFFER_SIZE 4096
#define STORE_PATH "C:\\uploads"  // On Windows, use an existing directory (adjust as needed)
                                  // On Linux, you might use "/some/path"
#define SECURITY_CODE "secret-pass"

// CORS headers to be included in every response.
const char *cors_headers =
    "Access-Control-Allow-Origin: *\r\n"
    "Access-Control-Allow-Methods: POST, OPTIONS\r\n"
    "Access-Control-Allow-Headers: x-app-security-code, x-file-name, Content-Type\r\n";

// Helper: cross-platform socket close.
#ifdef _WIN32
    #define CLOSESOCKET(s) closesocket(s)
#else
    #define CLOSESOCKET(s) close(s)
#endif

// Helper: trim leading whitespace.
char *ltrim(char *s) {
    while(*s && isspace((unsigned char)*s)) s++;
    return s;
}

// Process an individual client connection.
void process_client(int client_socket) {
    char buffer[BUFFER_SIZE];
    int received = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);
    printf("Recieved File Upload...\n");

    if (received <= 0) {
        CLOSESOCKET(client_socket);
        return;
    }
    buffer[received] = '\0';

    // Extract the HTTP method from the request line.
    char method[16] = {0};
    sscanf(buffer, "%15s", method);

    // --- Handle OPTIONS Preflight Requests ---
    if (strcasecmp(method, "OPTIONS") == 0) {
        char response[512];
        snprintf(response, sizeof(response),
                 "HTTP/1.1 200 OK\r\n"
                 "%s"
                 "Content-Length: 0\r\n"
                 "Connection: close\r\n"
                 "\r\n",
                 cors_headers);
        send(client_socket, response, strlen(response), 0);
        CLOSESOCKET(client_socket);
        return;
    }

    // --- Ensure we have a full header section (terminated by "\r\n\r\n") ---
    char *headers_end = strstr(buffer, "\r\n\r\n");
    if (!headers_end) {
        const char *badreq = "HTTP/1.1 400 Bad Request\r\n"
                             /* Include CORS headers */
                             "Access-Control-Allow-Origin: *\r\n"
                             "Content-Length: 0\r\n"
                             "Connection: close\r\n\r\n";
        send(client_socket, badreq, strlen(badreq), 0);
        CLOSESOCKET(client_socket);
        return;
    }
    int header_length = (int)(headers_end - buffer) + 4;
    char *body_ptr = buffer + header_length;

    // --- Parse Required Headers ---
    char security_value[128] = {0};
    char file_name[256] = {0};
    int content_length = 0;

    // Duplicate header portion for tokenizing.
    char *header_copy = strdup(buffer);
    if (!header_copy) {
        CLOSESOCKET(client_socket);
        return;
    }
    char *line = strtok(header_copy, "\r\n");
    while (line) {
        // Look for "x-app-security-code:" header.
        if (strncasecmp(line, "x-app-security-code:", 20) == 0) {
            char *value = ltrim(line + 20);
            strncpy(security_value, value, sizeof(security_value)-1);
        }
        // Look for "x-file-name:" header.
        else if (strncasecmp(line, "x-file-name:", 12) == 0) {
            char *value = ltrim(line + 12);
            strncpy(file_name, value, sizeof(file_name)-1);
        }
        // Look for "Content-Length:" header.
        else if (strncasecmp(line, "Content-Length:", 15) == 0) {
            char *value = ltrim(line + 15);
            content_length = atoi(value);
        }
        line = strtok(NULL, "\r\n");
    }
    free(header_copy);

    // --- Validate Security Header ---
    if (strlen(security_value) == 0 || strcmp(security_value, SECURITY_CODE) != 0) {
        char response[512];
        snprintf(response, sizeof(response),
                 "HTTP/1.1 403 Forbidden\r\n"
                 "%s"
                 "Content-Length: 0\r\n"
                 "Connection: close\r\n"
                 "\r\n",
                 cors_headers);
        send(client_socket, response, strlen(response), 0);
#ifdef _WIN32
        char msg[512];
        snprintf(msg, sizeof(msg),
                 "Incoming file: %s\nSUCCESS: NO\nPATH TO BE SAVED: \"%s\"\nReason: Invalid security code.",
                 file_name[0] ? file_name : "Unknown", STORE_PATH);
        MessageBoxA(NULL, msg, "File Upload", MB_OK | MB_ICONERROR);
#else
        fprintf(stderr, "Forbidden: Invalid security code.\n");
#endif
        CLOSESOCKET(client_socket);
        return;
    }

    // --- Validate File Name ---
    if (strlen(file_name) == 0) {
        char response[512];
        snprintf(response, sizeof(response),
                 "HTTP/1.1 400 Bad Request\r\n"
                 "%s"
                 "Content-Length: 0\r\n"
                 "Connection: close\r\n"
                 "\r\n",
                 cors_headers);
        send(client_socket, response, strlen(response), 0);
#ifdef _WIN32
        MessageBoxA(NULL, "No file name provided.", "File Upload", MB_OK | MB_ICONERROR);
#else
        fprintf(stderr, "Bad Request: No file name provided.\n");
#endif
        CLOSESOCKET(client_socket);
        return;
    }

    // --- Validate Content-Length ---
    if (content_length <= 0) {
        char response[512];
        snprintf(response, sizeof(response),
                 "HTTP/1.1 411 Length Required\r\n"
                 "%s"
                 "Content-Length: 0\r\n"
                 "Connection: close\r\n"
                 "\r\n",
                 cors_headers);
        send(client_socket, response, strlen(response), 0);
        CLOSESOCKET(client_socket);
        return;
    }

    // --- Read File Data ---
    // Allocate buffer for the file.
    char *file_buffer = malloc(content_length);
    if (!file_buffer) {
        char response[512];
        snprintf(response, sizeof(response),
                 "HTTP/1.1 500 Internal Server Error\r\n"
                 "%s"
                 "Content-Length: 0\r\n"
                 "Connection: close\r\n"
                 "\r\n",
                 cors_headers);
        send(client_socket, response, strlen(response), 0);
        CLOSESOCKET(client_socket);
        return;
    }
    // Some file data may have already been read into our buffer.
    int body_bytes_in_buffer = received - header_length;
    memcpy(file_buffer, body_ptr, body_bytes_in_buffer);
    int total_file_read = body_bytes_in_buffer;
    while (total_file_read < content_length) {
        int r = recv(client_socket, file_buffer + total_file_read, content_length - total_file_read, 0);
        if (r <= 0) break;
        total_file_read += r;
    }

    // --- Save the File ---
    char full_path[512];
#ifdef _WIN32
    // On Windows, use backslashes.
    snprintf(full_path, sizeof(full_path), "%s\\%s", STORE_PATH, file_name);
#else
    snprintf(full_path, sizeof(full_path), "%s/%s", STORE_PATH, file_name);
#endif

    FILE *fp = fopen(full_path, "wb");
    if (!fp) {
        char response[512];
        snprintf(response, sizeof(response),
                 "HTTP/1.1 500 Internal Server Error\r\n"
                 "%s"
                 "Content-Length: 0\r\n"
                 "Connection: close\r\n"
                 "\r\n",
                 cors_headers);
        send(client_socket, response, strlen(response), 0);
        free(file_buffer);
#ifdef _WIN32
        char msg[512];
        snprintf(msg, sizeof(msg),
                 "Incoming file: %s\nSUCCESS: NO\nPATH TO BE SAVED: \"%s\"\nReason: Cannot open file for writing.",
                 file_name, STORE_PATH);
        MessageBoxA(NULL, msg, "File Upload", MB_OK | MB_ICONERROR);
#else
        fprintf(stderr, "Error: Cannot open file %s for writing.\n", full_path);
#endif
        CLOSESOCKET(client_socket);
        return;
    }
    fwrite(file_buffer, 1, total_file_read, fp);
    fclose(fp);
    free(file_buffer);

    // --- Send Success Response with CORS Headers ---
    const char *ok_body = "File uploaded successfully!";
    char response[1024];
    snprintf(response, sizeof(response),
             "HTTP/1.1 200 OK\r\n"
             "%s"
             "Content-Type: text/plain\r\n"
             "Content-Length: %zu\r\n"
             "Connection: close\r\n"
             "\r\n"
             "%s",
             cors_headers, strlen(ok_body), ok_body);
    send(client_socket, response, strlen(response), 0);

    // --- Windows MessageBox Notification ---
#ifdef _WIN32
    {
        char msg[512];
        snprintf(msg, sizeof(msg),
                 "Incoming file: %s\nSUCCESS: YES\nPATH TO BE SAVED: \"%s\"",
                 file_name, STORE_PATH);
        MessageBoxA(NULL, msg, "File Upload", MB_OK | MB_ICONINFORMATION);
    }
#else
    printf("Incoming file: %s\nSUCCESS: YES\nPATH TO BE SAVED: \"%s\"\n", file_name, STORE_PATH);
#endif

    CLOSESOCKET(client_socket);
}

int main() {
#ifdef _WIN32
    // Initialize Winsock.
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2,2), &wsa) != 0) {
        fprintf(stderr, "Failed to initialize Winsock.\n");
        return EXIT_FAILURE;
    }
#endif

    // Create a socket.
    int server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket < 0) {
        perror("socket");
        return EXIT_FAILURE;
    }

    // Allow quick reuse of the port.
    int opt = 1;
    setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, (char *)&opt, sizeof(opt));

    // Bind the socket to PORT.
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY; // Listen on all interfaces.
    server_addr.sin_port = htons(PORT);

    if (bind(server_socket, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind");
        CLOSESOCKET(server_socket);
        return EXIT_FAILURE;
    }

    // Listen for incoming connections.
    if (listen(server_socket, 10) < 0) {
        perror("listen");
        CLOSESOCKET(server_socket);
        return EXIT_FAILURE;
    }

    printf("HTTP File Upload Server (with CORS) listening on port %d...\n", PORT);

    // Main loop: accept and process connections sequentially.
    while (1) {
        struct sockaddr_in client_addr;
#ifdef _WIN32
        int client_len = sizeof(client_addr);
#else
        socklen_t client_len = sizeof(client_addr);
#endif
        int client_socket = accept(server_socket, (struct sockaddr *)&client_addr, &client_len);
        if (client_socket < 0) {
            perror("accept");
            continue;
        }
        process_client(client_socket);
    }

    CLOSESOCKET(server_socket);
#ifdef _WIN32
    WSACleanup();
#endif
    return EXIT_SUCCESS;
}
