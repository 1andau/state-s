"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Header from "./components/header/header";
// import PhoneImage from "../public/iPhone.svg"

import { Montserrat } from 'next/font/google'
import { montserrat, montserrat_regular, roboto_mono } from "./fonts";
import VideoUpload from "./components/videoUpload/videoUpload";
import { useEffect, useState } from "react";
import VideoPreview from "./components/videoUpload/videoPrewiev";
import Link from "next/link";

import { FormEvent } from 'react'
import { useRouter } from 'next/router'



export default function Home() {
  const [videos, setVideos] = useState(() => {
    const savedVideos = localStorage.getItem('videos');
    return savedVideos ? JSON.parse(savedVideos) : [];
  });


  const handleLogout = () => {               
    signOut(auth).then(() => {
    // Sign-out successful.
        <Link href="/">qwe</Link>

        console.log("Signed out successfully")
    }).catch((error) => {
    // An error happened.
    });
}



  useEffect(() => {
    localStorage.setItem('videos', JSON.stringify(videos));
  }, [videos]);

  const handleUpload = (file) => {
    const videoSrc = URL.createObjectURL(file);
    setVideos([...videos, videoSrc]);
  };


  return (
<div className={styles.page}>
      {/* <div className={styles.headerText}>
        <div className={styles.mainTitle}>
          <Image
          className={styles.mainStates}
            aria-hidden
            src="/STATE!S.svg"
            alt="home icon"
            width={900}
            height={150}
          />
        </div>
        <h2 className={styles.subTitle}>
          мы <span className={styles.together}>ВМЕСТЕ</span> делаем музыку только лучше
        </h2>
        <div className={styles.boxDescription}>
          <p className={styles.description}>
            Загружай свою видео-реакцию, делитесь своими эмоциями на твою любимую музыку и смотри как от нее также открываются другие
          </p>
        </div>
      </div>
      <div className={styles.phoneContainer}>
        <Image
          className={styles.phoneImage}
          aria-hidden
          src="/iphone.svg"
          alt="phone icon"
          width={400}
          height={600}
        />
      </div>
      <div className={styles.exclamation}>
        <Image
          className={styles.exclamationImage}
          aria-hidden
          src="/!.svg"
          alt="exclamation icon"
          width={100}
          height={100}
        />
      </div>


<div className={styles.secondTitle}>

<h2>
Мы верим, что музыка объединяет людей. 
И когда разделяешь ее с кем то 
— она становится только лучше. 
</h2>

<span className={styles.secondTitleSpan}> 
словно мы одна энергия, 
словно мы на одном концерте, 
словно мы собрались с друзьями, 
словно мы не одни...
  </span>



</div> */}

     <VideoUpload onUpload={handleUpload} />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {videos.map((src, index) => (
          <VideoPreview key={index} videoSrc={src} />
        ))}
      </div>




      <>
            <nav>
                <p>
                    Welcome Home
                </p>

                <div>
                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>
        </>

    </div>



  );
}




