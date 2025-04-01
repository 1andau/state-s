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
  const [newVideoAdded, setNewVideoAdded] = useState(false); // Флаг нового видео

  // Загрузка видео с принудительным обновлением
  const loadVideos = async (force = false) => {
    try {
      console.log("Fetching videos...");
      const videosData = await fetchVideos();
      
      // Принудительное обновление если есть новые видео
      if (force || newVideoAdded) {
        console.log("Force updating videos list");
        setVideos(videosData);
        setNewVideoAdded(false);
      } 
      // Или обычное обновление если список пустой
      else if (videos.length === 0) {
        setVideos(videosData);
      }

      // Запускаем проверку статуса для всех видео в обработке
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

  // Проверка статуса видео
  const startVideoStatusCheck = (videoUid) => {
    const interval = setInterval(async () => {
      try {
        const updatedVideo = await checkVideoStatus(videoUid);
        console.log("Video status check:", updatedVideo.uid, updatedVideo.readyToStream);
        
        if (updatedVideo.readyToStream) {
          clearInterval(interval);
          setVideos(prev => prev.map(v => 
            v.uid === videoUid ? { 
              ...v, 
              readyToStream: true,
              // Важно обновить URL, так как после обработки он может измениться!
              playback: {
                ...v.playback,
                hls: `https://customer-b7p449dj2tzggbg3.cloudflarestream.com/${videoUid}/manifest/video.m3u8`
              }
            } : v
          ));
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 5000); // Проверяем каждые 5 секунд

    return interval;
  };

  // Первоначальная загрузка
  useEffect(() => {
    loadVideos();
  }, []);

  // Обработчик нового видео
  const handleNewVideoUploaded = (newVideo) => {
    console.log("New video uploaded:", newVideo.uid);
    setVideos(prev => [newVideo, ...prev]);
    setNewVideoAdded(true); // Устанавливаем флаг нового видео
    startVideoStatusCheck(newVideo.uid); // Начинаем проверку статуса
    
    // Принудительно обновляем список через 10 секунд
    setTimeout(() => loadVideos(true), 10000);
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


"use client";
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './videoPlayer.module.css';

const VideoPlayer = ({ videoUrl, widthVideo, isProcessing }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewReady, setPreviewReady] = useState(false);

  // Превью видео (3 секунды)
  useEffect(() => {
    if (!showPreview || !previewRef.current) return;

    const video = previewRef.current;
    let hls;
    let timeout;

    const playPreview = () => {
      video.currentTime = 0;
      video.play()
        .then(() => {
          setPreviewReady(true);
          console.log("Preview started playing");
          timeout = setTimeout(() => {
            video.pause();
            video.currentTime = 0;
          }, 3000);
        })
        .catch(e => {
          console.log('Preview play error:', e);
          setPreviewReady(false);
        });
    };

    const initPreview = () => {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, playPreview);
        hls.on(Hls.Events.ERROR, () => setPreviewReady(false));
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', playPreview);
        video.addEventListener('error', () => setPreviewReady(false));
      }
    };

    // Если видео не в обработке - сразу инициализируем превью
    if (!isProcessing) {
      initPreview();
    }

    return () => {
      clearTimeout(timeout);
      if (hls) hls.destroy();
      video.pause();
      video.currentTime = 0;
    };
  }, [videoUrl, showPreview, isProcessing]);

   // Основной плеер
  useEffect(() => {
    if (!isPlaying || !videoRef.current) return;

    const video = videoRef.current;
    let hls;

    const setupPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', () => video.play());
      }
    };

    setupPlayer();

    return () => {
      if (hls) hls.destroy();
      video.pause();
      video.currentTime = 0;
    };
  }, [isPlaying, videoUrl]);

  const handleOpenModal = () => {
    setIsPlaying(true);
    setShowPreview(false);
  };

  const handleCloseModal = () => {
    setIsPlaying(false);
    setShowPreview(true);
  };

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
          ref={previewRef}
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
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoUid}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
      },
    }
  );
  const data = await response.json();
  return data.result;
};










"use client";
import { useEffect, useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import styles from './page.module.css';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Функция для загрузки видео
  const fetchVideos = async () => {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
          },
        }
      );
      const data = await response.json();
      return data.result || []; // Всегда возвращаем массив
    } catch (error) {
      console.error('Error fetching videos:', error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  };

  // Загрузка видео при монтировании
  useEffect(() => {
    const loadVideos = async () => {
      const videosData = await fetchVideos();
      setVideos(videosData);
      setLoading(false);
    };

    loadVideos();
  }, []);

  // Проверка статуса видео с интервалом
  useEffect(() => {
    const checkVideoStatus = async (videoUid) => {
      try {
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream/${videoUid}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
            },
          }
        );
        const data = await response.json();
        return data.result?.readyToStream || false;
      } catch (error) {
        return false;
      }
    };

    const interval = setInterval(async () => {
      setVideos(prevVideos => {
        // Проверяем что prevVideos - массив
        if (!Array.isArray(prevVideos)) return [];
        
        // Обновляем только видео которые еще обрабатываются
        return Promise.all(prevVideos.map(async video => {
          if (!video.readyToStream) {
            const isReady = await checkVideoStatus(video.uid);
            return isReady ? { ...video, readyToStream: true } : video;
          }
          return video;
        }));
      });
    }, 10000); // Проверяем каждые 10 секунд

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.loader}></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  // Добавляем проверку что videos - массив
  if (!Array.isArray(videos) {
    return <div className={styles.error}>Error loading videos</div>;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <div className={styles.videoGrid}>
          {videos.map(video => (
            <div 
              key={video.uid} 
              className={styles.videoItem}
            >
              <VideoPlayer
                videoUrl={video.playback?.hls}
                isProcessing={!video.readyToStream}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}