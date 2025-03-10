"use client";
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './VideoPlayer.module.css';

const VideoPlayer = ({ videoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null); // Ссылка на элемент <video> для превью
  const hlsPreviewRef = useRef(null); // Ссылка на экземпляр Hls для превью

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
        console.error('Error attempting to play', error);
      });
    }
  };

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
          console.error('HLS error:', data);
        });
      } else if (previewVideo.canPlayType('application/vnd.apple.mpegurl')) {
        // Для браузеров, которые поддерживают HLS нативно (типа Safari)
        previewVideo.src = videoUrl;
        previewVideo.currentTime = 0; // Начинаем с 0 секунд
        previewVideo.play();
      } else {
        console.error('HLS is not supported in this browser');
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

  // Эффект для основного видео
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          handlePlayVideo();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          setIsLoading(false);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadeddata', () => {
          setIsLoading(false);
          handlePlayVideo();
        });
        video.addEventListener('error', () => {
          console.error('Failed to load video');
          setIsLoading(false);
        });
      } else {
        console.error('HLS is not supported in this browser');
        setIsLoading(false);
      }
    }
  }, [isPlaying, videoUrl]);

  return (
    <div className={styles.videoContainer}>
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
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.videoContent} onClick={e => e.stopPropagation()}>
            <video
              ref={videoRef}
              width="640"
              height="360"
              controls
              autoPlay
              className={styles.video}
            >
              Your browser does not support the video tag.
            </video>
            {isLoading && <p>Loading video...</p>}
            <button onClick={handlePlayVideo}>Play</button>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;