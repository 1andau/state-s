"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import VideoUploader from "./components/videoUpload/videoUploader";
import VideoPlayer from "./components/videoUpload/VideoPlayer";
import { fetchVideos } from "./components/utls/showPreview";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from "./components/toasts/toasts";
import Header from "./components/header/header";

export default function Home() {
  // const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [newVideoAdded, setNewVideoAdded] = useState(false); // Флаг нового видео

  const {videos, isConnected, socket} = useSocket()

  useEffect(() => {
    console.log("Current videos:", videos);
  }, [videos]);

    // Убираем лоадер когда данные загружены
    useEffect(() => {
      if (videos.length > 0) {
        console.log("Videos loaded:", videos);
      }
    }, [videos]);

    const handleNewVideoUploaded = (newVideo) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          type: "NEW_VIDEO", 
          video: newVideo 
        }));
      }
    };

  const getVideoOrientation = (width, height) => {
    return width > height ? 'landscape' : 'portrait';
  };




  return (
    <div className={styles.mainContainer}>
      <ToastContainer /> {/* Контейнер для toast-уведомлений */}
      <Header onNewVideoUploaded={handleNewVideoUploaded} />

      <div className={styles.container}>

        {!isConnected ? ( // Отображение лоадера, если идет загрузка
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>Connecting to server...</p>
                      </div>
        ) : (
          <div className={styles.videoGrid}>
            {videos.map((video, index) => {
              const orientation = getVideoOrientation(video.input.width, video.input.height);

              return (
                <div
                  key={video.uid}
                  className={`${styles.videoItem} ${
                    orientation === 'landscape' ? styles.landscape : styles.portrait
                  }`}
                >
                  <VideoPlayer
                    videoUrl={video.playback.hls}
                    thumbnailUrl={video.thumbnail}
                    widthVideo={video.input.width}
                    heightVideo={video.input.height}
  isProcessing={!video.readyToStream}
  
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}





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

"use client";
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './videoPlayer.module.css';

const VideoPlayer = ({ videoUrl, isProcessing }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const [showProcessing, setShowProcessing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const loopTimeoutRef = useRef(null); // Реф для таймера цикла

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  // Магия загрузки превью с бесконечным циклом
  useEffect(() => {
    if (!previewRef.current || !videoUrl) return;

    const video = previewRef.current;
    let hls;

    const startLoop = () => {
      video.currentTime = 0;
      video.play()
        .then(() => {
          loopTimeoutRef.current = setTimeout(() => {
            startLoop(); // Рекурсивный вызов для бесконечного цикла
          }, 3000);
        })
        .catch(e => console.log('⚠️ Ошибка воспроизведения:', e));
    };

    const handleSuccess = () => {
      console.log('✅ Превью успешно загружено');
      setShowProcessing(false);
      startLoop(); // Запускаем цикл после успешной загрузки
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 1,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, handleSuccess);
      hls.on(Hls.Events.ERROR, () => {
        console.log('🔄 Попытка перезагрузки превью...');
        setRetryCount(prev => prev + 1);
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
      video.addEventListener('loadeddata', handleSuccess);
      video.addEventListener('error', () => {
        console.log('🔄 Ошибка видео, пробуем снова...');
        setRetryCount(prev => prev + 1);
      });
    }

    return () => {
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
      if (hls) hls.destroy();
    };
  }, [videoUrl, retryCount]);

  // Основной плеер (без изменений)
  useEffect(() => {
    if (!isPlaying || !videoRef.current) return;
    const video = videoRef.current;
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
      video.src = videoUrl;
      video.addEventListener('loadeddata', () => video.play());
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [isPlaying, videoUrl]);

  return (
    <div className={styles.videoContainer}>
      {/* Оверлей обработки */}
{isProcessing ? (
        <div className={styles.videoProcessing}>
          <div className={styles.loader}></div>
          <span className={styles.videoProcessingText}>Video is processing...</span>
        </div>
      ) : null}

      {/* Кликабельное превью */}
      <div className={styles.preview} onClick={() => setIsPlaying(true)}>
        <video
          ref={previewRef}
          muted
          playsInline
          className={styles.previewVideo}
        />
      </div>

      {/* Модальное окно плеера */}
      {isPlaying && (
        <div className={styles.modalOverlay} onClick={() => setIsPlaying(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsPlaying(false)}>
              &times;
            </button>
            <video
              ref={videoRef}
              controls
              autoPlay
              className={styles.videoPlayer}
            />
            <div className={styles.descriptionContainer}>
              <span className={styles.nickname}>ASSET HOLD</span>
              <p className={styles.videoDescription}>
                This is a sample video description.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;










"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import VideoPlayer from "./components/videoUpload/VideoPlayer";
import { checkVideoStatus, fetchVideos } from "./components/utls/utls";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/header/header";
import { useSocket } from "./providers/SocketProvider";

export default function Home() {
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const {videos} = useSocket()
  return (
    <div className={styles.mainContainer}>
      <ToastContainer /> {/* Контейнер для toast-уведомлений */}
      {/* <Header onNewVideoUploaded={handleNewVideoUploaded} /> */}

      <div className={styles.previewBanner}>
        <Image
          className={styles.mainBanner}
          aria-hidden
          src="/banner.svg"
          alt="home icon"
          width={800}
          height={400}
        />
        <p className={styles.date}>03.07.2025</p>
      </div>

      <div className={styles.artistContainer}>
        <div className={styles.artistText}>
          <h2 className={styles.albumTitle}>Playboi Carti</h2>
          <p className={styles.reactionsCount}>
            <span className={styles.countSpan}>1137 </span>
            reactions
          </p>
        </div>

        <div className={styles.imageContainer}>
          <Image
            className={styles.avatar}
            aria-hidden
            src="/carti.svg"
            alt="home icon"
            width={100}
            height={100}
          />
        </div>
      </div>

      <h2 className={styles.secondTitle}>Reactions to the album</h2>

      <div className={styles.container}>

        {loading ? ( // Отображение лоадера, если идет загрузка
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>Loading videos...</p>
          </div>
        ) : (
          <div className={styles.videoGrid}>
{videos.map((video) => (
        <VideoPlayer
          key={video.uid}
          videoUrl={video.playback?.hls}
          thumbnailUrl={video.thumbnail}
          isProcessing={!video.readyToStream}
        />
      ))}
          </div>
        )}
      </div>


    </div>
  );
}








import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from './progressBar.module.css';
import { showToast } from '../toasts/toasts';

const ProgressBar = ({ onUploadSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  
  const videoRef = useRef(null);
  const localVideoUrlRef = useRef(null);

  // Очистка Blob URL при размонтировании
  useEffect(() => {
    return () => {
      if (localVideoUrlRef.current) {
        URL.revokeObjectURL(localVideoUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Освобождаем предыдущий URL если есть
    if (localVideoUrlRef.current) {
      URL.revokeObjectURL(localVideoUrlRef.current);
    }

    const url = URL.createObjectURL(selectedFile);
    localVideoUrlRef.current = url;

    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      if (video.duration > 60) {
        showToast('Video must be ≤60 seconds', 'Видео не должно превышать 60 секунд');
        e.target.value = '';
        URL.revokeObjectURL(url);
        return;
      }
      
      setFile(selectedFile);
      setUploadComplete(false);
    };
    
    video.onerror = () => {
      showToast('Error', 'Failed to read video');
      URL.revokeObjectURL(url);
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
      setUploadComplete(true);
    } catch (error) {
      console.error('Upload error:', error);
      showToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    setShareStatus('Processing...');
    
    try {
      await new Promise(resolve => {
        const checkInterval = setInterval(async () => {
          try {
            const status = await axios.get(
              `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoData.uid}`,
              { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}` } }
            );
            
            if (status.data.result.readyToStream) {
              clearInterval(checkInterval);
              onUploadSuccess(status.data.result);
              onClose();
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

        {/* Превью выбранного видео */}
        <div className={styles.previewContainer}>
          {file ? (
            <video
              ref={videoRef}
              src={localVideoUrlRef.current}
              controls
              className={styles.previewVideo}
              key={localVideoUrlRef.current} // Форсируем пересоздание элемента при изменении
            />
          ) : (
            <div className={styles.previewPlaceholder}>
              <span className={styles.previewText}>Preview</span>
            </div>
          )}
        </div>

        {/* Thumbnail после загрузки */}
        {uploadComplete && (
          <div className={styles.thumbnailContainer}>
            <img
              src={`https://customer-b7p449dj2tzggbg3.cloudflarestream.com/${videoData.uid}/thumbnails/thumbnail.jpg`}
              alt="Video thumbnail"
              className={styles.thumbnailImage}
              onError={(e) => {
                e.target.src = '/fallback-thumbnail.jpg'; // Fallback если thumbnail не загрузится
              }}
            />
          </div>
        )}

        {/* Остальной код без изменений */}
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