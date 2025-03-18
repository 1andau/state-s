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
  // // Эффект для основного видео
  // useEffect(() => {
  //   if (isPlaying && videoRef.current) {
  //     const video = videoRef.current;

  //     if (Hls.isSupported()) {
  //       const hls = new Hls();
  //       hls.loadSource(videoUrl);
  //       hls.attachMedia(video);
  //       hls.on(Hls.Events.MANIFEST_PARSED, () => {
  //         setIsLoading(false);
  //         handlePlayVideo();
  //       });
  //       hls.on(Hls.Events.ERROR, (event, data) => {
  //         console.log('HLS error:', data);
  //         setIsLoading(false);
  //       });
  //     } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  //       video.src = videoUrl;
  //       video.addEventListener('loadeddata', () => {
  //         setIsLoading(false);
  //         handlePlayVideo();
  //       });
  //       video.addEventListener('error', () => {
  //         console.log('Failed to load video');
  //         setIsLoading(false);
  //       });
  //     } else {
  //       console.log('HLS is not supported in this browser');
  //       setIsLoading(false);
  //     }
  //   }
  // }, [isPlaying, videoUrl]);

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
              <p className={styles.videoDescription}>
                This is a sample video description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                This is a sample video description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                This is a sample video description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;