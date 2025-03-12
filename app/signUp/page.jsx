"use client";
import React, { useEffect, useState } from 'react'
import styles from './signUp.module.css'
import Image from 'next/image'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../components/configs/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import {  doc , getDoc, setDoc} from 'firebase/firestore';
import Logout from '../components/logout/logout';

import {  toast } from 'react-toastify';


const Page = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, loading] = useAuthState(auth);
  const [nickname, setNickname] = useState('')
  const [userData, setUserData] = useState(null);

  console.log(user, "GoogleUser");
  
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, 'newUsers', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            console.log("User data:", userDocSnap.data());
            setUserData(userDocSnap.data());
          } else {

            toast.error('No such document', {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
              transition: Bounce,
              });
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // console.log(userData?.displayName,"userData");


  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Сохранение никнейма в Firestore
      await setDoc(doc(db, 'newUsers', userId), {
        userId: userId,
        email: email,
        displayName: nickname,
      });
      console.log("User registered with nickname:", nickname);
    } catch (error) {
      console.log("Error registering user:", error);
    }
  };
  

  
      // Функция для входа через Google
      const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            console.log(user, 'user'); // Проверьте, что пользователь не null
        } catch (error) {


            console.log("Error logging in with Google:", error);
        }
    }; 



  return (
    <>
    <div className={styles.container}>

{user? (
<>

<h1>HELLO</h1>

<h1>{userData ? userData.displayName : 'Loading...'}</h1>

  <h1>{user.displayName}</h1>


<h2>Lets change the world together!</h2>
<Logout />
</>
): (
  
<>
<h1 className={styles.title}>Sign up to state!s</h1>
      <div className={styles.gradientLine}></div>
      <p className={styles.subtitle}>share your reaction emotino!s shar!e together...</p>
      <div className={styles.steps}>
        <div className={`${styles.step} ${styles.active}`}>1</div>
        <div className={styles.step}>2</div>
        <div className={styles.step}>3</div>
      </div>
      <form className={styles.form}>
        <input 
        type="text" 
        placeholder="nickname"
         className={styles.input} 
         onChange={(e) => setNickname(e.target.value)}
         value={nickname}
         />
        <input type="email" 
        placeholder="you@mail.com"
         className={styles.input}
         value={email}
         onChange={(e) => setEmail(e.target.value)}
          />


        <input type="password"
         placeholder="password"
         className={styles.input}
         value={password}
         onChange={(e) => setPassword(e.target.value)}

          />

        <p>OR</p>

        <br />


        <button 
        className={styles.googleInput}
        onClick={loginWithGoogle}
        >
<Image
aria-hidden
src="/google.svg"
alt="google"
width={50}
height={25}
/>
        Auth with a Google
        </button>

        <button type="button" className={styles.button}
        onClick={register}
        >continue</button>
      </form>
</>





)}

 
    </div>
 
 </>  )
}

export default Page