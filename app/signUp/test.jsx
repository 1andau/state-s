
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header/header";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="content">
          {children}
        </div>
      </body>
    </html>
  );
}

//"./globals.css";

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}
body {
  margin: 0;
  padding: 0;
  background-color: #ff00a6;
  overflow-x: hidden;
}

.content {
  width: 70%;
  margin: 0 auto;
  padding-top: 100px; /* Высота хедера */
}


import styles from './Header.module.css';
import Image from "next/image";
import Link from 'next/link'



const Header = () => {
  return (
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
<span className={styles.userName}>sarah dsdsd</span>
        <Image
            aria-hidden
            className={styles.loginLogo}
            src="/login.svg"
            alt="login"
            width={40}
            height={25}
          />

</button>
  
          <button className={styles.shareButton}>+ share your reaction</button>
        </div>
      </div>


    </header>
    <div className={styles.gradientStripes}>
        <div className={styles.gradientStripe} style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}></div>
        <div className={styles.gradientStripe} style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}></div>
        <div className={styles.gradientStripe} style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}></div>
      </div>
  
    </div>
  );
};

export default Header;



.headerWrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 1000;
}

.header {
  margin: 0 auto;
  width: 70%;
    display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #000000;
}

.headerBox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logoContainer {
  display: flex;
  align-items: center;
  gap: 10px; 
}

.logo {
  font-size: 24px;
  color: #ffffff;
  font-weight: bold;
}

.statesLogo{
  width: 176px;
  height:30px;
}


.share {
  color: #979797;
  font-size: 20px;
  font-weight: 400;
  margin: 0; /* Убираем отступы у параграфа */
}

.rightSection {
  display: flex;
  align-items: center;
  gap: 20px; /* Расстояние между элементами справа */
}

.shareButton {
  background-color: #3370FF;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 20px;
  width: 250px;
  cursor: pointer;
}


.loginButton {
  background-color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px; /* Расстояние между иконкой и именем пользователя */
  padding: 8px;
  border-radius: 25px;

}
.userName {
  color: #000000;
  font-size: 19px;

}
.gradientStripes {
  position: fixed;
  top: 80px; /* Высота хэдера */
  width: 100%;
  z-index: 999;
}

.gradientStripe {
  height: 15px;
  margin: 0 auto;
  width: 70%;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .header {
    width: 100%;
    padding: 10px;
  }

  .shareButton {
    padding: 6px 6px;
    font-size: 6px;
  }

  .share {
    display: none;
  }

  .gradientStripes {
    width: 100%;
  }
}



