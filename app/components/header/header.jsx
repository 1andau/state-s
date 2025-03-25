'use client'
import styles from './Header.module.css';
import Image from "next/image";
import Link from 'next/link'
import { useState } from 'react';
import ProgressBar from '../progressBar/progressBar';

const Header = () => {
  const [showModal, setShowModal] = useState(false)

  const handleShareClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
<>
<div className={styles.headerWrapper}>
  <header className={styles.header}>
      <div className={styles.headerBox}>
        {/* Логотип и текст */}
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <Link href='/'>
              <Image
                aria-hidden
                className={styles.statesLogo}
                src="/logo.svg"
                alt="home"
                width={120}
                height={25}
              />
            </Link>
          </div>
          <p className={styles.share}>shar!e together...</p>
        </div>

        {/* Элементы справа */}
        <div className={styles.rightSection}>
        <button className={styles.loginButton}>
{/* {userName && <span className={styles.userName}>{userName}</span>} */}
<span className={styles.userName}>Sarah </span>
        <Image
            aria-hidden
            className={styles.loginLogo}
            src="/login.svg"
            alt="login"
            width={40}
            height={25}
          />

</button>
  
          <button 
          onClick={handleShareClick}
          className={styles.shareButton}>+ share your reaction</button>
        </div>
      </div>




      {/* <div className={styles.placeholder}></div>

      <Link href="/signIn">
              <button type="button" className={styles.signIn}>
                Sign in
              </button>
            </Link>


            <Link href="/signUp">
              <button type="button" className={styles.signIn}>
                Sign Up
              </button>
            </Link> */}


    </header>
    <div className={styles.gradientStripes}>
        <div className={styles.gradientStripe} style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}></div>
        <div className={styles.gradientStripe} style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}></div>
        <div className={styles.gradientStripe} style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}></div>
      </div>
  
    </div>
    {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton}
              onClick={handleCloseModal}
            >
     X
            </button>
            <ProgressBar 
              onUploadSuccess={(data) => {
                console.log('Upload successful:', data);
                handleCloseModal();
              }}
            />
          </div>
        </div>
      )}
</>
  );
};

export default Header;