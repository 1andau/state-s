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
      {showProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingSpinner}></div>
          <p>Video is processing...</p>
        </div>
      )}

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