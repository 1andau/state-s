import styles from './Header.module.css';
import Image from "next/image";
import Link from 'next/link'


const Header = () => {
  return (
    <header className={styles.header}>
<div className={styles.logo}>
  <Link href='/'>
  
  <Image
aria-hidden
src="/r.svg"
alt="home"
width={50}
height={25}   
/>

  </Link>

</div>

      <div className={styles.placeholder}></div>

      <Link href="/signIn">
              <button type="button" className={styles.signIn}>
                Sign in
              </button>
            </Link>


            <Link href="/signUp">
              <button type="button" className={styles.signIn}>
                Sign Up
              </button>
            </Link>


    </header>
  );
};

export default Header;