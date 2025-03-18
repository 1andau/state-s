import React, { useState } from 'react';
import axios from 'axios';

const VideoUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
  
    setIsUploading(true);
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
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(progress);
          },
        }
      );
  
      // Вызываем onUploadSuccess с данными о видео
      onUploadSuccess(response.data.result); // Убедитесь, что response.data.result содержит нужные данные
    } catch (error) {
      console.log('Error uploading video:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Video'}
      </button>
      {isUploading && (
        <div style={{ width: '100%', backgroundColor: '#ddd', marginTop: '10px' }}>
          <div
            style={{
              width: `${uploadProgress}%`,
              height: '20px',
              backgroundColor: 'gray',
            }}
          ></div>
        </div>
      )}
      {uploadProgress === 100 && (
        <button onClick={() => onUploadSuccess(file)}>Continue</button>
      )}
    </div>
  );
};

export default VideoUploader;