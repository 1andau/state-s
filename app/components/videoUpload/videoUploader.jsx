import React, { useState } from 'react';
import axios from 'axios';
import styles from "./upload.module.css"


const VideoUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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
       //URL для предпросмотра
       setPreviewUrl(response.data.result.url);
       
      // Вызываем onUploadSuccess с данными о видео
      onUploadSuccess(response.data.result); // Убедитесь, что response.data.result содержит нужные данные
    } catch (error) {
      console.log('Error uploading video:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
    <input
      type="file"
      accept="video/*"
      onChange={handleFileChange}
      className={styles.fileInput}
    />
    <button className={styles.uploadButton} onClick={handleUpload} disabled={isUploading}>
      {isUploading ? 'Uploading...' : 'Upload Video'}
    </button>
    {isUploading && (
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${uploadProgress}%` }}
        ></div>
      </div>
    )}
    {previewUrl && (
      <div className={styles.previewContainer}>
        <video controls>
          <source src={previewUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    )}
  </div>
  );
};

export default VideoUploader;