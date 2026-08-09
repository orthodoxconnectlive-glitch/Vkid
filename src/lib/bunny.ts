const LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID;
const API_KEY = import.meta.env.VITE_BUNNY_API_KEY;
const CDN_HOSTNAME = import.meta.env.VITE_BUNNY_STREAM_CDN_HOSTNAME;

export async function uploadVideoToBunny(file: File, title: string) {
  if (!LIBRARY_ID || !API_KEY) {
    throw new Error('Bunny Stream environment variables are missing');
  }

  // 1. Create a video object entry in Bunny Stream
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
    throw new Error(`Failed to create Bunny video object: ${errorText}`);
  }

  const videoData = await createResponse.json();
  const videoId = videoData.guid;

  // 2. Upload binary file data to Bunny
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

  // Return direct stream URL and ID
  return {
    videoId,
    videoUrl: `https://${CDN_HOSTNAME}/${videoId}/play_480p.mp4`,
    embedUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`,
  };
}
