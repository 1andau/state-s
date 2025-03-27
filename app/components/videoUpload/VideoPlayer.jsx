"use client";
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './videoPlayer.module.css';

const VideoPlayer = ({ videoUrl, isProcessing }) => {
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
      {/* Состояние обработки - показываем ТОЛЬКО если видео действительно обрабатывается */}
      {isProcessing && !previewReady && (
        <div className={styles.processingOverlay}>
          <div className={styles.processingSpinner}></div>
          <p>Video is processing...</p>
        </div>
      )}

      {/* Превью - показываем всегда, даже если видео в обработке */}
      {showPreview && (
        <div className={styles.preview} onClick={handleOpenModal}>
          <video
            ref={previewRef}
            muted
            playsInline
            className={styles.previewVideo}
            style={{ opacity: previewReady ? 1 : 0 }}
          />
        </div>
      )}

      {/* Модальное окно с плеером */}
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