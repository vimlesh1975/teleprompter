import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export async function GET(req) {
    try {
        const DB_NAME = process.env.DB_NAME;
        console.log('DB_NAME:', DB_NAME);
        return new Response(JSON.stringify({ DB_NAME }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { DB_NAME } = body;

        // Log the received DB_NAME
        console.log(DB_NAME);

        // Path to the .env file
        const envFilePath = path.resolve(process.cwd(), '.env.local');

        // Read the existing content of the .env file
        let envContent = fs.existsSync(envFilePath)
            ? fs.readFileSync(envFilePath, 'utf-8')
            : '';

        // Split the content into lines and update the DB_NAME
        let lines = envContent.split('\n');
        let updated = false;

        lines = lines.map(line => {
            if (line.startsWith('DB_NAME=')) {
                updated = true;
                return `DB_NAME=${DB_NAME}`;
            }
            return line;
        });

        // If DB_NAME wasn't found, add it to the end of the file
        if (!updated) {
            lines.push(`DB_NAME=${DB_NAME}`);
        }

        // Join the lines back into a string
        envContent = lines.join('\n');

        // Write the updated content back to the .env file
        fs.writeFileSync(envFilePath, envContent, 'utf-8');

        return new Response(JSON.stringify({ message: 'DB_NAME updated in .env.local file' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

