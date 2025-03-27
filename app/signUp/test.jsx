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
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [processingVideos, setProcessingVideos] = useState([]);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videosData = await fetchVideos();
        setVideos(videosData);
      } catch (error) {
        showToast("Failed to load videos.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const handleNewVideoUploaded = (newVideo) => {
    // Добавляем видео без пометки о обработке
    setVideos(prev => [newVideo, ...prev]);
    showToast("Video uploaded successfully!", "success");
  };

  const getVideoOrientation = (width, height) => {
    return width > height ? 'landscape' : 'portrait';
  };

  return (
    <div className={styles.mainContainer}>
      <ToastContainer /> {/* Контейнер для toast-уведомлений */}
      <Header onNewVideoUploaded={handleNewVideoUploaded} />

      <div className={styles.container}>

      {loading ? ( // Отображение лоадера, если идет загрузка
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>Loading videos...</p>
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
                    isProcessing={processingVideos.includes(video.uid)}

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


"use client";
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './videoPlayer.module.css';

const VideoPlayer = ({ videoUrl, widthVideo }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null); // Ссылка на элемент <video> для превью
  const hlsPreviewRef = useRef(null); // Ссылка на экземпляр Hls для превью
  const [currentUrl, setCurrentUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const hls = new Hls({
    maxBufferLength: 30, // Увеличиваем размер буфера
    maxMaxBufferLength: 60, // Максимальный размер буфера
    enableWorker: true, // Используем Web Worker для улучшения производительности
  });


// console.log(widthVideo, 'widthVideo');

  const handleOpenModal = () => {
    setIsPlaying(true);
    setIsLoading(true);
  };

  const handleCloseModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Error attempting to play', error);
      });
    }
  };


  hls.on(Hls.Events.ERROR, (event, data) => {
    console.log('HLS error:', data);
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.log('Fatal network error encountered, try to recover');
          hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.log('Fatal media error encountered, try to recover');
          hls.recoverMediaError();
          break;
        default:
          hls.destroy();
          break;
      }
    }
  });

  // для превью
  useEffect(() => {
    const previewVideo = previewVideoRef.current;

    if (previewVideo) {
      if (Hls.isSupported()) {
        // Используем hls для браузеров, которые не поддерживают HLS нативно
        const hls = new Hls();
        hlsPreviewRef.current = hls; // Сохраняем экземпляр Hls
        hls.loadSource(videoUrl);
        hls.attachMedia(previewVideo);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          previewVideo.currentTime = 0; // Начинаем с 0 секунд
          previewVideo.play();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.log('HLS error:', data);
        });
      } else if (previewVideo.canPlayType('application/vnd.apple.mpegurl')) {
        // Для браузеров, которые поддерживают HLS нативно (типа Safari)
        previewVideo.src = videoUrl;
        previewVideo.currentTime = 0; // Начинаем с 0 секунд
        previewVideo.play();
      } else {
        console.log('HLS is not supported in this browser');
      }

      // Обработчик для остановки видео после 3 секунд
      const handleTimeUpdate = () => {
        if (previewVideo.currentTime >= 3) {
          previewVideo.pause();
          previewVideo.currentTime = 0; // Сбрасываем время для повторного воспроизведения
          previewVideo.play(); // Зацикливаем 
        }
      };

      previewVideo.addEventListener('timeupdate', handleTimeUpdate);

      // Очистка
      return () => {
        if (hlsPreviewRef.current) {
          hlsPreviewRef.current.destroy(); // Уничтожаем экземпляр Hls
        }
        previewVideo.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [videoUrl]);


  useEffect(() => {
    if (isPlaying && videoRef.current) {
      const video = videoRef.current;
  
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          enableWorker: true,
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          handlePlayVideo();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.log('HLS error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Fatal network error encountered, try to recover');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Fatal media error encountered, try to recover');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
          setIsLoading(false);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadeddata', () => {
          setIsLoading(false);
          handlePlayVideo();
        });
        video.addEventListener('error', () => {
          console.log('Failed to load video');
          setIsLoading(false);
        });
      } else {
        console.log('HLS is not supported in this browser');
        setIsLoading(false);
      }
    }
  }, [isPlaying, videoUrl]);


  useEffect(() => {
    // Если есть временный URL (blob), используем его сначала
    if (videoUrl.startsWith('blob:')) {
      setCurrentUrl(videoUrl);
      setIsProcessing(true);
      
      // Пытаемся загрузить оригинальный URL в фоне
      const checkOriginal = async () => {
        try {
          const video = document.createElement('video');
          video.src = videoUrl.replace('blob:', '');
          
          await new Promise((resolve, reject) => {
            video.addEventListener('loadeddata', resolve);
            video.addEventListener('error', reject);
          });
          
          setCurrentUrl(videoUrl.replace('blob:', ''));
          setIsProcessing(false);
        } catch {
          // Оставляем blob URL если оригинальный не загрузился
        }
      };
      
      checkOriginal();
    } else {
      setCurrentUrl(videoUrl);
    }
  }, [videoUrl]);


  return (
    <div className={styles.videoContainer}>

      {isProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingSpinner}></div>
          <p>Video is processing...</p>
        </div>
      )}
      
      <div className={styles.preview} onClick={handleOpenModal}>
        <video
          ref={previewVideoRef}
          muted
          loop
          autoPlay
          playsInline
          className={styles.previewVideo}
        />
      </div>
      {isPlaying && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              &times;
            </button>
            <video
              ref={videoRef}
              controls
              autoPlay
              className={styles.videoPlayer}
            >
              Your browser does not support the video tag.
            </video>
            <div className={styles.descriptionContainer}>
              <span className={styles.nickname}>ASSET HOLD</span>
              <p className={styles.videoDescription}>
                This is a sample video description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;


const ProgressBar = ({ onUploadSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [isSharing, setIsSharing] = useState(false); // Добавляем состояние для лоадера
  const [shareStatus, setShareStatus] = useState('');

  const checkVideoStatus = async (videoUid) => {
    try {
      const response = await axios.get(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoUid}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
          },
        }
      );
      return response.data.result.readyToStream;
    } catch (error) {
      console.error('Error checking video status:', error);
      return false;
    }
  };

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
    setShareStatus('Processing video...');

    try {
      let isReady = await checkVideoStatus(videoData.uid);
      
      if (!isReady) {
        setShareStatus('Waiting for video processing...');
        const interval = setInterval(async () => {
          isReady = await checkVideoStatus(videoData.uid);
          if (isReady) {
            clearInterval(interval);
            onUploadSuccess(videoData);
            onClose();
          }
        }, 5000);
      } else {
        onUploadSuccess(videoData);
        onClose();
      }
    } catch (error) {
      console.error('Share error:', error);
      setShareStatus('Error sharing video');
    } finally {
      setIsSharing(false);
    }
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


// это апи запрос 
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
















"use client";
import { useEffect, useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import { fetchVideos, checkVideoStatus } from './api/streamApi'; // Предполагается, что у вас есть такой метод
import styles from './styles.module.css';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка видео и проверка статуса
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videosData = await fetchVideos();
        setVideos(videosData);
        
        // Для каждого видео, которое еще обрабатывается, запускаем проверку статуса
        videosData.forEach(video => {
          if (!video.readyToStream) {
            startVideoStatusCheck(video.uid);
          }
        });
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };

    const startVideoStatusCheck = (videoUid) => {
      const interval = setInterval(async () => {
        try {
          const updatedVideo = await checkVideoStatus(videoUid);
          if (updatedVideo.readyToStream) {
            clearInterval(interval);
            setVideos(prev => prev.map(v => 
              v.uid === videoUid ? { ...v, readyToStream: true } : v
            ));
          }
        } catch (error) {
          console.error('Error checking video status:', error);
        }
      }, 5000); // Проверяем каждые 5 секунд

      return interval;
    };

    loadVideos();

    return () => {
      // Здесь можно очистить все интервалы при размонтировании
    };
  }, []);

  if (loading) {
    return <div className={styles.loader}>Loading...</div>;
  }

  return (
    <div className={styles.videoGrid}>
      {videos.map(video => (
        <div key={video.uid} className={styles.videoItem}>
          <VideoPlayer 
            videoUrl={video.playback.hls} 
            isProcessing={!video.readyToStream}
          />
        </div>
      ))}
    </div>
  );
}