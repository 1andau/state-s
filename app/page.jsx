"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import VideoUploader from "./components/videoUpload/videoUploader";
import VideoPlayer from "./components/videoUpload/VideoPlayer";
import { fetchVideos } from "./components/utls/showPreview";


export default function Home() {
  const [videos, setVideos] = useState([]);


  useEffect(() => {
    const loadVideos = async () => {
      const videosData = await fetchVideos();
      console.log(videosData, 'this is video data');
      
      setVideos(videosData);
    };

    loadVideos();
  }, []);

  const handleUploadSuccess = (videoData) => {
    if (videoData.playback && (videoData.playback.hls || videoData.playback.dash)) {
      setVideos([...videos, videoData]);
    } else {
      console.log('Invalid video data:', videoData);
    }
  };

  const getVideoOrientation = (width, height) => {
    return width > height ? 'landscape' : 'portrait';
  };


  return (
<div className={styles.mainContainer}>
<div className={styles.previewBanner} >
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
   reactions</p>
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
    </div>


</div>



  );
}




