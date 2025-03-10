"use client";
import Image from "next/image";
import styles from "./page.module.css";

import Header from "./components/header/header";
import { useEffect, useState } from "react";

// import { useAuthState } from 'react-firebase-hooks/auth';
// import {signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup,signOut } from 'firebase/auth';
// import {auth } from "./components/configs/config";
// import Logout from "./components/logout/logout";
// import VideoUpload from "./components/videoUpload/VideoPlayer";
// import VideoPreview from "./components/videoUpload/videoUploader";
import VideoUploader from "./components/videoUpload/videoUploader";
import VideoPlayer from "./components/videoUpload/VideoPlayer";
import { fetchVideos } from "./components/utls/showPreview";


const reactions = [
  // { id: 1, name: 'shaq', image: '/shaq.svg' },
  { id: 2, name: 'jk boys', image: '/shaq.svg'  },
  { id: 3, name: 'zack', image: '/shaq.svg' },
  { id: 4, name: 'still dontai', image: '/shaq.svg' },
  { id: 5, name: 'kai cenat', image: '/shaq.svg' },
  { id: 6, name: 'RT tv', image: '/shaq.svg' },
];


export default function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const loadVideos = async () => {
      const videosData = await fetchVideos();
      console.log('Fetched videos:', videosData); // Логирование данных
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



  return (
<div className={styles.mainPage}>
<div className={styles.header} >
<Image
          className={styles.mainBanner}
            aria-hidden
            src="/banner.svg"
            alt="home icon"
            width={800}
            height={400}
          />

<p className={styles.date}>03.07.2025</p>

     {/* <VideoUpload onUpload={handleUpload} />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {videos.map((src, index) => (
          <VideoPreview key={index} videoSrc={src} />
        ))}
      </div> */}

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
        {videos.map((video, index) => (
          <VideoPlayer
            key={index}
            videoUrl={video.playback.hls} // Используем HLS
            thumbnailUrl={video.thumbnail}
          />
        ))}
      </div>
    </div>




<div className={styles.reactions}>
      {reactions.map((react) => (
        <div key={react.id} className={styles.reactionItem}>
          <img src={react.image} alt={react.name} className={styles.reactionImage} />
          <p className={styles.reactionName}>{react.name}</p>
        </div>
      ))}
    </div>




{/* 
    <div className={styles.container}>
      <h1>Video Upload and Display</h1>
      <VideoUploader onUploadSuccess={handleUploadSuccess} />
      <div className={styles.videoGrid}>
        {videos.map((video, index) => (
          <VideoPlayer key={index} videoUrl={video.playback.url} />
        ))}
      </div>
    </div> */}





</div>



  );
}




