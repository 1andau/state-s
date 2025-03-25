import React, { useState } from 'react';
import axios from 'axios';
import styles from './inputDesign.module.css';
import Image from 'next/image';

const ProgressBar = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Создаем превью для видео
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
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
    <div className={styles.containerProgress}>
      <section className={styles.uploadSection}>
        <header className={styles.header}>
          <h1 className={styles.title}>Share your reaction</h1>
          <p className={styles.subtitle}>emotion!s</p>
        </header>
        
        <section className={styles.previewContainer} aria-label="Preview area">
          {previewUrl ? (
            <video 
              controls 
              src={previewUrl} 
              className={styles.previewVideo}
            />
          ) : (
            <div className={styles.preview}>Preview</div>
          )}
        </section>
        
        <div className={styles.progressContainer} role="progressbar">
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
        
        <div className={styles.controls}>
          <div className={styles.logoContainer}>
            <Image
              aria-hidden
              className={styles.statesLogo}
              src="/logo.svg"
              alt="home"
              width={120}
              height={24}
            />
          </div>
          
          <div className={styles.uploadActions}>
            <input
              type="file"
              id="video-upload"
              accept="video/*"
              onChange={handleFileChange}
              className={styles.hiddenInput}
              disabled={isUploading}
            />
            <label 
              htmlFor="video-upload" 
              className={styles.fileInputLabel}
            >
              сhoose file
            </label>
            
            <button 
              className={styles.uploadButton} 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              aria-label="Upload file"
            >
              {isUploading ? 
               <p className={styles.uploading}>uploading</p> : 
            <p className={styles.uploading}>upload</p> 
              }
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgressBar;