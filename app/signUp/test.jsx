

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
<div className={styles.mainPage}>
<div className={styles.previewBanner} >
<Image
          className={styles.mainBanner}
            aria-hidden
            src="/arch.jpeg"
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








.mainContainer{
  width: 70%;
}

.previewBanner {
  text-align: center;
  position: relative;
  padding: 20px;
  color: #fff;
  width: 100%;

}
.mainBanner{
  width: 100%;

}
.title {
  font-size: 3rem;
  margin: 0;
}

.date {
  font-size: 1.2rem;
  color: rgb(255, 0, 0);
  position: absolute;
  bottom: 48px;
  right: 140px;
}

.artistContainer{
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.album {
  text-align: center;
  padding: 20px;
  background-color: #111;
  color: #fff;
}


.albumTitle {
  font-size: 60px;
  margin: 0;
  color: #FF0000;
}

.reactionsCount {
  font-size: 1rem;
  color: #aaa;
}

.countSpan{
  font-weight: bold;
  color: white;
}

.avatar{
  float:left; 
}


.secondTitle{
  
padding: 30px 0 30px 0;
}




.container {
  padding: 20px;
  text-align: center;
}

.videoGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.videoItem {
  flex: 1 1 calc(50% - 10px); /* Базовый размер для горизонтальных видео */
  max-width: calc(50% - 10px);
  box-sizing: border-box;
  border-radius: 15px; /* Закругленные углы */
  overflow: hidden; /* Чтобы закругленные углы работали */
}

.landscape {
  flex: 1 1 calc(50% - 10px); /* Горизонтальные видео занимают 50% ширины */
  max-width: calc(50% - 10px);
}

.portrait {
  flex: 1 1 calc(25% - 10px); /* Вертикальные видео занимают 25% ширины */
  max-width: calc(25% - 10px);
}