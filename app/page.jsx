"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import VideoPlayer from "./components/videoUpload/VideoPlayer";
import { checkVideoStatus, fetchVideos } from "./components/utls/showPreview";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/header/header";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [newVideoAdded, setNewVideoAdded] = useState(false); // Флаг нового видео

  const checkingStatusRef = useRef(new Set());

  // Загрузка видео с мемоизацией
  const loadVideos = useCallback(async () => {
    try {
      const videosData = await fetchVideos();
      setVideos(prevVideos => {
        // Обновляем только если данные изменились
        if (JSON.stringify(prevVideos) !== JSON.stringify(videosData)) {
          return videosData;
        }
        return prevVideos;
      });
      
      // Запускаем проверку статуса только для новых видео в обработке
      videosData.forEach(video => {
        if (!video.readyToStream && !checkingStatusRef.current.has(video.uid)) {
          startVideoStatusCheck(video.uid);
          checkingStatusRef.current.add(video.uid);
        }
      });
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Проверка статуса видео с мемоизацией
  const startVideoStatusCheck = useCallback((videoUid) => {
    const interval = setInterval(async () => {
      try {
        const updatedVideo = await checkVideoStatus(videoUid);
        
        if (updatedVideo.readyToStream) {
          clearInterval(interval);
          checkingStatusRef.current.delete(videoUid);
          
          setVideos(prev => prev.map(v => 
            v.uid === videoUid && !v.readyToStream ? { 
              ...v, 
              readyToStream: true,
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
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Обработчик нового видео
  const handleNewVideoUploaded = useCallback((newVideo) => {
    setVideos(prev => {
      // Проверяем, нет ли уже такого видео в списке
      if (!prev.some(v => v.uid === newVideo.uid)) {
        startVideoStatusCheck(newVideo.uid);
        checkingStatusRef.current.add(newVideo.uid);
        return [newVideo, ...prev];
      }
      return prev;
    });
  }, [startVideoStatusCheck]);

  // Первоначальная загрузка
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const getVideoOrientation = (width, height) => {
    return width > height ? 'landscape' : 'portrait';
  };
  

  return (
    <div className={styles.mainContainer}>
      <ToastContainer /> {/* Контейнер для toast-уведомлений */}
      <Header onNewVideoUploaded={handleNewVideoUploaded} />

      <div className={styles.previewBanner}>
        <Image
          className={styles.mainBanner}
          aria-hidden
          src="/banner.svg"
          alt="home icon"
          width={800}
          height={400}
        />
        <p className={styles.date}>03.07.2025</p>
      </div>

      <div className={styles.artistContainer}>
        <div className={styles.artistText}>
          <h2 className={styles.albumTitle}>Playboi Carti</h2>
          <p className={styles.reactionsCount}>
            <span className={styles.countSpan}>1137 </span>
            reactions
          </p>
        </div>

        <div className={styles.imageContainer}>
          <Image
            className={styles.avatar}
            aria-hidden
            src="/carti.svg"
            alt="home icon"
            width={100}
            height={100}
          />
        </div>
      </div>

      <h2 className={styles.secondTitle}>Reactions to the album</h2>

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