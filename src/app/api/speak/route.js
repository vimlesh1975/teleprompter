// app/api/speak/route.js

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
});



function splitText(text, maxBytes = 4900) {
  const chunks = [];
  let currentChunk = '';

  text.split(/(?<=\.)/g).forEach((sentence) => {
    if (new TextEncoder().encode(currentChunk + sentence).length > maxBytes) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  });

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

export async function POST(request) {
  const { text, languageCode, name } = await request.json();

  if (!text) {
    return new Response(JSON.stringify({ error: 'No text provided.' }), { status: 400 });
  }

  try {
    const chunks = splitText(text);
    const audioChunks = [];

    for (const chunk of chunks) {
      const [response] = await client.synthesizeSpeech({
        input: { text: chunk },
        voice: { languageCode, name },
        audioConfig: { audioEncoding: 'MP3' },
      });
      audioChunks.push(response.audioContent);
    }

    // Concatenate audio chunks
    const combinedAudio = Buffer.concat(audioChunks.map((chunk) => Buffer.from(chunk, 'base64')));

    return new Response(combinedAudio, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return new Response(JSON.stringify({ error: 'Error synthesizing speech.' }), { status: 500 });
  }
}
