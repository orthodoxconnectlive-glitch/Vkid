const LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID || '723727';
const API_KEY = import.meta.env.VITE_BUNNY_API_KEY;

export async function uploadVideoToBunny(file: File, title: string) {
  if (!LIBRARY_ID || !API_KEY) {
    throw new Error('Bunny Stream API keys are missing in Cloudflare environment settings.');
  }

  // 1. Register video entry in Bunny Stream
  const createResponse = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
    {
      method: 'POST',
      headers: {
        AccessKey: API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    }
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Bunny video creation failed: ${errorText}`);
  }

  const videoData = await createResponse.json();
  const videoId = videoData.guid;

  // 2. Upload video binary file
  const uploadResponse = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    {
      method: 'PUT',
      headers: {
        AccessKey: API_KEY,
      },
      body: file,
    }
  );

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload video binary to Bunny Stream');
  }

  // Official Bunny responsive iframe embed URL
  const embedUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=true&loop=false&muted=false&preload=true`;

  return {
    videoId,
    videoUrl: embedUrl,
    embedUrl,
  };
}
