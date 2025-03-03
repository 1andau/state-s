


"use client";
import React, { useState } from 'react'
import styles from './signUp.module.css'
import Image from 'next/image'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../components/configs/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFirestore, collection, addDoc, doc , getDoc, setDoc} from 'firebase/firestore';
import Logout from '../components/logout/logout';


const Page = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, loading] = useAuthState(auth);
  const [nickname, setNickname] = useState('')
  const [userData, setUserData] = useState(null);

  const db = getFirestore(auth.app); // Инициализация Firestore

  console.log(user, 'userData');


  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            console.log("User data:", userDocSnap.data());
            setUserData(userDocSnap.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [user]);


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
      console.error("Error registering user:", error);
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
<>

<h1>{userData ? userData.displayName : 'Loading...'}</h1>


<h1>HELLO</h1>
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