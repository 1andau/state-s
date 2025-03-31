"use client";
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './videoPlayer.module.css';

const VideoPlayer = ({ videoUrl, isProcessing }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const [showProcessing, setShowProcessing] = useState(true);
  const retryCountRef = useRef(0);
  const hlsInstances = useRef({ preview: null, main: null });
  const loopTimeoutRef = useRef(null);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (hlsInstances.current.preview) {
        hlsInstances.current.preview.destroy();
      }
      if (hlsInstances.current.main) {
        hlsInstances.current.main.destroy();
      }
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  // Эффект для превью видео (оптимизированная версия)
  useEffect(() => {
    if (!previewRef.current || !videoUrl) return;

    const video = previewRef.current;
    let hls;

    const startLoop = () => {
      if (video.readyState >= 2) { // Проверяем, что видео загружено
        video.currentTime = 0;
        video.play().catch(e => console.log('⚠️ Ошибка воспроизведения:', e));
      }
      loopTimeoutRef.current = setTimeout(startLoop, 3000);
    };

    const handleSuccess = () => {
      setShowProcessing(false);
      startLoop();
    };

    const handleError = () => {
      console.log('🔄 Попытка перезагрузки превью...');
      retryCountRef.current += 1;
      if (retryCountRef.current < 5) { // Лимит попыток
        setTimeout(() => {
          if (hls) hls.destroy();
          initPlayer();
        }, 2000);
      }
    };

    const initPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxMaxBufferLength: 1,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, handleSuccess);
        hls.on(Hls.Events.ERROR, handleError);

        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hlsInstances.current.preview = hls;
      } else {
        video.src = videoUrl;
        video.addEventListener('loadeddata', handleSuccess);
        video.addEventListener('error', handleError);
      }
    };

    initPlayer();

    return () => {
      if (hls) hls.destroy();
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
      video.removeEventListener('loadeddata', handleSuccess);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl]); // Убрал retryCount из зависимостей

  // Эффект для основного плеера (без изменений)
  useEffect(() => {
    if (!isPlaying || !videoRef.current) return;
    
    const video = videoRef.current;
    let hls;

    const handlePlay = () => {
      video.play().catch(e => console.log('Ошибка воспроизведения:', e));
    };

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.on(Hls.Events.MANIFEST_PARSED, handlePlay);
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hlsInstances.current.main = hls;
    } else {
      video.src = videoUrl;
      video.addEventListener('loadeddata', handlePlay);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [isPlaying, videoUrl]);

  return (
    <div className={styles.videoContainer}>
      {showProcessing && isProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingSpinner}></div>
          <p>Video is processing...</p>
        </div>
      )}

      <div className={styles.preview} onClick={() => setIsPlaying(true)}>
        <video
          ref={previewRef}
          muted
          playsInline
          className={styles.previewVideo}
        />
      </div>

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