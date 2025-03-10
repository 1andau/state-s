"use client";
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js'; 
import styles from './VideoPlayer.module.css';

const VideoPlayer = ({ videoUrl, thumbnailUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);

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

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        // Используем hls.js для браузеров, которые не поддерживают HLS нативно
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
        // Для браузеров, которые поддерживают HLS нативно (например, Safari)
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
      <div
        className={styles.preview}
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
        onClick={handleOpenModal}
      ></div>
      {isPlaying && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.videoContent} onClick={e => e.stopPropagation()}>
            <video
              ref={videoRef}
              width="640"
              height="360"
              controls
              autoPlay
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