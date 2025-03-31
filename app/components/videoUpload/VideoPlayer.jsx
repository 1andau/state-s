"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import styles from './videoPlayer.module.css';

const VideoPlayer = ({ videoUrl, isProcessing }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const [showProcessing, setShowProcessing] = useState(true);
  const hlsRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Загрузка и воспроизведение превью
  useEffect(() => {
    if (!previewRef.current || !videoUrl) return;

    const video = previewRef.current;
    let hls;

    const startLoop = () => {
      video.currentTime = 0;
      video.play().catch(e => console.log('⚠️ Ошибка воспроизведения:', e));
    };

    const handleSuccess = () => {
      setShowProcessing(false);
      video.addEventListener('timeupdate', () => {
        if (video.currentTime > 2.9) {
          video.currentTime = 0;
        }
      });
      startLoop();
    };

    const loadVideo = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxMaxBufferLength: 1,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, handleSuccess);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            retryTimeoutRef.current = setTimeout(loadVideo, 3000);
          }
        });

        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else {
        video.src = videoUrl;
        video.addEventListener('loadeddata', handleSuccess);
        video.addEventListener('error', () => {
          retryTimeoutRef.current = setTimeout(loadVideo, 3000);
        });
      }
    };

    loadVideo();

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener('timeupdate', handleSuccess);
      video.removeEventListener('loadeddata', handleSuccess);
      video.removeEventListener('error', () => {});
    };
  }, [videoUrl]);

  // Основной плеер
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    if (!videoRef.current) return;

    const video = videoRef.current;
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      hlsRef.current = hls;
    } else {
      video.src = videoUrl;
      video.play();
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [videoUrl]);

  return (
    <div className={styles.videoContainer}>
      {showProcessing && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingSpinner}></div>
          <p>Video is processing...</p>
        </div>
      )}

      <div className={styles.preview} onClick={handlePlay}>
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