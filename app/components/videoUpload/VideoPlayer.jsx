"use client";
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import styles from './videoPlayer.module.css';

const VideoPlayer = ({ videoUrl, isProcessing, thumbnailUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const [showProcessing, setShowProcessing] = useState(true);
  const hlsInstance = useRef(null);
  const playbackTimeout = useRef(null);

  // Однократное 4-секундное воспроизведение превью
  useEffect(() => {
    if (!previewRef.current || !videoUrl || isProcessing) return;

    const video = previewRef.current;
    let hls;

    const handleSuccess = () => {
      setShowProcessing(false);
      video.currentTime = 0;
      
      const playPreview = () => {
        video.play()
          .then(() => {
            // Останавливаем после 4 секунд
            playbackTimeout.current = setTimeout(() => {
              video.pause();
              video.currentTime = 0;
            }, 3000);
          })
          .catch(e => console.log('Autoplay blocked:', e));
      };

      if (Hls.isSupported()) {
        hls = new Hls({
          maxMaxBufferLength: 1,
          xhrSetup: (xhr) => xhr.withCredentials = false
        });

        hls.on(Hls.Events.MANIFEST_PARSED, playPreview);
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hlsInstance.current = hls;
      } else {
        video.src = videoUrl;
        video.addEventListener('loadeddata', playPreview);
      }
    };

    handleSuccess();

    return () => {
      clearTimeout(playbackTimeout.current);
      if (hlsInstance.current) {
        hlsInstance.current.destroy();
        hlsInstance.current = null;
      }
    };
  }, [videoUrl, isProcessing]);

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
      {isProcessing ? (
        <div className={styles.videoProcessing}>
          <div className={styles.loader}></div>
          <span className={styles.videoProcessingText}>Video is processing...</span>
        </div>
      ) : null}

      <div className={styles.preview} onClick={() => setIsPlaying(true)}>
        <video
          ref={previewRef}
          muted
          playsInline
          className={styles.previewVideo}
          poster={thumbnailUrl} // Показываем thumbnail после остановки
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