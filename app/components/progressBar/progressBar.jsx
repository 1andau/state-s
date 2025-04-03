import React, { useState } from 'react';
import axios from 'axios';
import styles from './progressBar.module.css';
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
    if (!selectedFile) return;

    // Создаем временный URL для предпросмотра и проверки длительности
    const url = URL.createObjectURL(selectedFile);
    
    // Создаем видео элемент для проверки метаданных
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src); // Освобождаем память
      
      // Проверяем длительность видео
      if (video.duration > 60) {
        showToast('The video must be no longer than 60 seconds.', 'Видео должно быть не длиннее 60 секунд');
        e.target.value = ''; // Сбрасываем input file
        return;
      }
      
      // Если видео подходит по длине
      setFile(selectedFile);
      setUploadComplete(false);
      setPreviewUrl(url);
    };
    
    video.onerror = () => {
      showToast('error', 'Не удалось прочитать видео');
      window.URL.revokeObjectURL(video.src);
    };
    
    video.src = url;
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
    setShareStatus('Processing video...');
    
    try {
      // Ждем пока видео станет доступным
      await new Promise(resolve => {
        const checkInterval = setInterval(async () => {
          try {
            const status = await axios.get(
              `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoData.uid}`,
              { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}` } }
            );
            
            if (status.data.result.readyToStream) {
              clearInterval(checkInterval);
              setShareStatus('Video ready!');
              setTimeout(() => {
                onUploadSuccess(status.data.result);
                onClose();
              }, 1000);
            }
          } catch (error) {
            console.error('Status check failed:', error);
          }
        }, 3000);
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        
        <h2 className={styles.title}>Share your reaction</h2>
        <p className={styles.subtitle}>emotion!s</p>
        

        <div className={styles.previewContainer}>
          {previewUrl ? (
            <video controls src={previewUrl} className={styles.previewVideo} />
          ) : (
            <div className={styles.previewPlaceholder}>
              <span className={styles.previewText}>Preview</span>
            </div>
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