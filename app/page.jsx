"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import VideoUploader from "./components/videoUpload/videoUploader";
import VideoPlayer from "./components/videoUpload/VideoPlayer";
import { checkVideoStatus, fetchVideos } from "./components/utls/showPreview";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from "./components/toasts/toasts";
import ProgressBar from "./components/progressBar/progressBar";
import Header from "./components/header/header";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); // Состояние загрузки

  // Загрузка видео и проверка статуса
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videosData = await fetchVideos();
        setVideos(videosData);
        
        // Для каждого видео, которое еще обрабатывается, запускаем проверку статуса
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

    const startVideoStatusCheck = (videoUid) => {
      const interval = setInterval(async () => {
        try {
          const updatedVideo = await checkVideoStatus(videoUid);
          if (updatedVideo.readyToStream) {
            clearInterval(interval);
            setVideos(prev => prev.map(v => 
              v.uid === videoUid ? { ...v, readyToStream: true } : v
            ));
          }
        } catch (error) {
          console.error('Error checking video status:', error);
        }
      }, 5000); // Проверяем каждые 5 секунд

      return interval;
    };

    loadVideos();

    return () => {
      // Здесь можно очистить все интервалы при размонтировании
    };
  }, []);



  
  const handleNewVideoUploaded = (newVideo) => {
    // Добавляем видео без пометки о обработке
    setVideos(prev => [newVideo, ...prev]);
    showToast("Video uploaded successfully!", "success");
  };

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