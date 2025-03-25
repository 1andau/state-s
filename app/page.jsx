"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import VideoUploader from "./components/videoUpload/videoUploader";
import VideoPlayer from "./components/videoUpload/VideoPlayer";
import { fetchVideos } from "./components/utls/showPreview";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from "./components/toasts/toasts";
import ProgressBar from "./components/progressBar/progressBar";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    console.log('Videos updated:', videos);
  }, [videos]);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videosData = await fetchVideos();
        console.log(videosData, 'this is video data');
        setVideos(videosData);
        // showToast("Videos loaded successfully!", "success") ; //успешно 
      } catch (error) {
        showToast("Failed to load videos.", "error");
      } finally {
        setLoading(false); // Загрузка завершена
      }
    };

    loadVideos();
  }, []);

  // const handleUploadSuccess = (videoData) => {
  //   if (videoData.playback && (videoData.playback.hls || videoData.playback.dash)) {
  //     // Добавляем новое видео в список
  //     setVideos(prevVideos => [...prevVideos, videoData]);
  //     showToast("Video uploaded successfully!", "success");
  //   } else {
  //     showToast("Failed to upload video.", "error");
  //   }
  // };
  const handleUploadSuccess = (videoData) => {
    if (videoData.playback && videoData.playback.hls) {
      setVideos(prevVideos => [...prevVideos, videoData]);
      showToast("Video uploaded successfully!", "success");
    } else {
      showToast("Failed to upload video.", "error");
    }
  };


  const getVideoOrientation = (width, height) => {
    return width > height ? 'landscape' : 'portrait';
  };

  return (
    <div className={styles.mainContainer}>
      <ToastContainer /> {/* Контейнер для toast-уведомлений */}

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
      {/* <ProgressBar /> */}

      <div className={styles.container}>
        <h1>Video Upload and Display</h1>
        {/* <VideoUploader onUploadSuccess={handleUploadSuccess} /> */}

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