import axios from 'axios';

export const fetchVideos = async () => {
  try {
    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
        },
      }
    );
    return response.data.result.map(video => ({
      ...video,
      thumbnail: `https://customer-b7p449dj2tzggbg3.cloudflarestream.com/${video.uid}/thumbnails/thumbnail.jpg`
    }));
  } catch (error) {
    throw new Error('Failed to fetch videos');
  }
};



export const checkVideoStatus = async (videoUid) => {
  console.log("Checking status for:", videoUid);
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoUid}`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
    },
  });
  
  if (!response.ok) {
    console.error("Status check failed:", response.status);
    throw new Error('Status check failed');
  }

  const data = await response.json();
  console.log("Status response:", data.result);
  return data.result;
};