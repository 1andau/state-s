import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header/header";
import styles from './components/header/Header.module.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >

<div> 
<div className={styles.mainContainer}>
<Header />
</div>
        <div> 
          {children}

        </div>
</div>
      </body>
    </html>
  );
}