import styles from './Header.module.css';
import Image from "next/image";


const Header = () => {
  return (
    <header className={styles.header}>
<div className={styles.logo}>
<Image
aria-hidden
src="/homeSweet.svg"
alt="Globe icon"
width={50}
height={25}
/>
</div>

      <div className={styles.placeholder}></div>
    </header>
  );
};

export default Header;