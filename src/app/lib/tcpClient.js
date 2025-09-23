// lib/tcpClient.js
import net from "net";

let client = null;
let isConnected = false;

export function getTcpClient(host, port) {
    if (!client) {
        client = new net.Socket();

        client.connect(port, host, () => {
            console.log("Connected to TCP server");
            isConnected = true;
        });

        client.on("error", (err) => {
            console.error("TCP Error:", err.message);
            isConnected = false;
            client.destroy();
            client = null;
        });

        client.on("close", () => {
            console.log("TCP connection closed");
            isConnected = false;
            client = null;
        });
    }

    return {
        send: (message) =>
            new Promise((resolve, reject) => {
                if (!isConnected) {
                    return reject(new Error("Not connected to TCP server"));
                }

                client.write(message + "\n", (err) => {
                    if (err) return reject(err);
                    resolve("Command sent: " + message);
                });
            }),
    };
}
