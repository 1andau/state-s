import Image from "next/image";
import styles from "./page.module.css";
import Header from "./components/header/header";

export default function Home() {
  return (
    <div className={styles.page}>
  <h1>MOVE BITCH</h1>

  <Header />
    </div>
  );
}
