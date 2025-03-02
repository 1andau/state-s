"use client";
import React, { useState } from 'react'
import styles from './signUp.module.css'
import Image from 'next/image'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../components/configs/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';


const Page = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, loading] = useAuthState(auth);
  const [nickname, setNickname] = useState('')


console.log(db, "firestore");  
  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Сохранение никнейма в Firestore
      await addDoc(collection(db, 'users'), {
        userId: userId,
        email: email,
        nickname: nickname,
      });
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



  return (
    <>
    <div className={styles.container}>
    {user? (
        <h1>hello {user.nickname}</h1>
      ) : (
        <h1>can u authorize plz?</h1>

      )}


{user? (
  ""

  
): (

  ""
)}




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
    </div>
 
 </>  )
}

export default Page