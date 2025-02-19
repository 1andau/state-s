import Image from "next/image";
import styles from "./page.module.css";
import Header from "./components/header/header";
// import PhoneImage from "../public/iPhone.svg"

import { Montserrat } from 'next/font/google'
import { montserrat, montserrat_regular, roboto_mono } from "./fonts";


export default function Home() {
  return (
<div className={styles.page}>
      <div className={styles.headerText}>
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

{/* <h2 className={}>
словно мы одна энергия, 
словно мы на одном концерте, 
словно мы собрались с друзьями, 
словно мы не одни...
</h2> */}

</div>

    </div>



  );
}




