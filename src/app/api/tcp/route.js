import { NextResponse } from "next/server";
import { getTcpClient } from "../../lib/tcpClient"

const HOST = "127.0.0.1"; // your R3 IP
const PORT = 9010;        // your R3 TCP port

export async function POST(req) {
    try {
        const body = await req.json();
        const tcp = getTcpClient(HOST, PORT);

        const response = await tcp.send(body.msg);

        return NextResponse.json({ success: true, response });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}