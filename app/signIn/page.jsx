"use client";
import React, { useState } from 'react'
import styles from './signIn.module.css'
import Image from 'next/image'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../components/configs/config';
import { useAuthState } from 'react-firebase-hooks/auth';

const Page = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, loading] = useAuthState(auth);

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

  return (
 <>
    <div className={styles.container}>
      {user? (
        <h1>hello {user.email}</h1>
      ) : (
        <h1>can u authorize plz?</h1>

      )}
      <h1 className={styles.title}>Join to state!s</h1>
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

        <button onClick={loginWithGoogle}>Login with Google</button>


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

    <div className={styles.LoginContainer}>
<p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta, officiis.</p>
    </div>
 
 </>

  )
}

export default Page