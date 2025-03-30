import React, { useState } from 'react';
import axios from 'axios';
import styles from './inputDesign.module.css';
import Image from 'next/image';
import { showToast } from '../toasts/toasts';

const ProgressBar = ({ onUploadSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [isSharing, setIsSharing] = useState(false); // Добавляем состояние для лоадера
  const [shareStatus, setShareStatus] = useState('');



  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadComplete(false);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
  
    setIsUploading(true);
    setUploadProgress(0);
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

      setVideoData(response.data.result);
      setPreviewUrl(response.data.result.playback.hls);
      setUploadComplete(true);
    } catch (error) {
      console.error('Error uploading video:', error);
      showToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleShare = async () => {
    setIsSharing(true);
    
    // Просто ждем 5 секунд перед закрытием
    await new Promise(resolve => setTimeout(resolve, 5000));
    onUploadSuccess(videoData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <h2 className={styles.title}>Share your reaction</h2>
        <p className={styles.subtitle}>emotion!s</p>
        
        <div className={styles.previewContainer}>
          {previewUrl ? (
            <video controls src={previewUrl} className={styles.previewVideo} />
          ) : (
            <div className={styles.previewPlaceholder}>Preview</div>
          )}
        </div>
        
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
        
        <div className={styles.controls}>
          <input
            type="file"
            id="video-upload"
            accept="video/*"
            onChange={handleFileChange}
            className={styles.hiddenInput}
            disabled={isUploading}
          />
          
          {!uploadComplete ? (
            <>
              <label htmlFor="video-upload" className={styles.fileInputLabel}>
                Choose File
              </label>
              <button 
                className={styles.uploadButton} 
                onClick={handleUpload} 
                disabled={!file || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </>
          ) : (
            <button 
              className={styles.shareButton}
              onClick={handleShare}
              disabled={isSharing}
            >
                      {isSharing ? (
        <>
          <div className={styles.buttonSpinner}></div>
          {shareStatus}
                  </>
      ) : 'Share'}

            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;