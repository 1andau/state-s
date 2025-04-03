"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import VideoPlayer from "./components/videoUpload/VideoPlayer";
import { checkVideoStatus, fetchVideos } from "./components/utls/utls";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/header/header";
import { useSocket } from "./providers/SocketProvider";

export default function Home() {
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [visibleVideos, setVisibleVideos] = useState(8);
  const {videos, isConnected, socket} = useSocket()

  // Ленивая загрузка при скролле
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= 
        document.body.offsetHeight - 500 &&
        visibleVideos < videos.length
      ) {
        setVisibleVideos(prev => prev + 6);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleVideos, videos.length]);

  // Обновление состояния загрузки
  useEffect(() => {
    setLoading(!isConnected || videos.length === 0);
  }, [isConnected, videos]);

  const handleNewVideoUploaded = (newVideo) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ 
        type: "NEW_VIDEO", 
        video: newVideo 
      }));
    }
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
        {loading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>{!isConnected ? "Connecting to server..." : "Loading videos..."}</p>
          </div>
        ) : (
          <div className={styles.videoGrid}>
            {videos.slice(0, visibleVideos).map((video) => {
              const orientation = getVideoOrientation(video.input.width, video.input.height);
              
              return (
                <div
                  key={video.uid}
                  className={`${styles.videoItem} ${
                    orientation === 'landscape' ? styles.landscape : styles.portrait
                  }`}
                >
                  <VideoPlayer
                    videoUrl={video.playback?.hls}
                    thumbnailUrl={video.thumbnail}
                    widthVideo={video.input?.width}
                    heightVideo={video.input?.height}
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