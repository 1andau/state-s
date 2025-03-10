
import React, { useState } from 'react';
import axios from 'axios';


const VideoUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
          },
        }
      );
      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };


  return (
    <div>
    <input type="file" accept="video/*" onChange={handleFileChange} />
    <button onClick={handleUpload}>Upload Video</button>
  </div>
  );
};

export default VideoUploader;