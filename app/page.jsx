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
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup,signOut } from 'firebase/auth';
import { auth } from "./components/configs/config";
// import Login from "./components/signUp/login";


export default function Home() {
  const [videos, setVideos] = useState(() => {
    const savedVideos = localStorage.getItem('videos');
    return savedVideos ? JSON.parse(savedVideos) : [];
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, loading] = useAuthState(auth);

  console.log(user, "user name");
  
  // Функция для регистрации нового пользователя
  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  // Функция для входа пользователя
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in user:", error);
    }
  };

    // Функция для входа через Google
    const loginWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error logging in with Google:", error);
      }
    };

      // Функция для выхода из системы
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };


  
    // if (loading) {
    //   return <div>Loading...</div>;
    // }
  
    // if (user) {
    //   return <div>Welcome, {user.email}</div>;
    // }

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

  <p>
    {
      user?.email
    }
  </p>


  <p>{
          user?.displayName

    }</p>

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


     {/* <VideoUpload onUpload={handleUpload} />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {videos.map((src, index) => (
          <VideoPreview key={index} videoSrc={src} />
        ))}
      </div> */}



{/* <Login/> */}



{user? (
          <div>
          <p>Welcome, {user.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
): (
  <div>
  <h2>Register/Login</h2>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Email"
  />
  <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Password"
  />
  <button onClick={register}>Register</button>
  <button onClick={login}>Login</button>
  <button onClick={loginWithGoogle}>Login with Google</button>
</div>
)}




    </div>



  );
}




