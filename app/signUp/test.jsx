const VideoUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}/stream`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN}`,
          },
        }
      );
      onUploadSuccess(response.data);
    } catch (error) {
      console.log('Error uploading video:', error);
    }
  };


  return (
    <div>
    <input type="file" accept="video/*" onChange={handleFileChange} />
    <button onClick={handleUpload}>Upload Video</button>
  </div>
  );
};

export default VideoUploader;



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

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videosData = await fetchVideos();
        console.log(videosData, 'this is video data');
        setVideos(videosData);
        showToast("Videos loaded successfully!", "success") ; //успешно 
      } catch (error) {
        showToast("Failed to load videos.", "error");
      } finally {
        setLoading(false); // Загрузка завершена
      }
    };

    loadVideos();
  }, []);

  const handleUploadSuccess = (videoData) => {
    if (videoData.playback && (videoData.playback.hls || videoData.playback.dash)) {
      setVideos([...videos, videoData]);
      showToast("Videos loaded successfully!", "success") ; //успешно 
    } else {
      showToast("Failed to load videos.", "error");
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

      <div className={styles.container}>
        <h1>Video Upload and Display</h1>
        <VideoUploader onUploadSuccess={handleUploadSuccess} />

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