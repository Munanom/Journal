import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
      <h1 className="custom-title">Welcome to your journal</h1>
      </div>
      <div className={styles.description}>
        <h2>
          This is a simple journaling app that allows you to write and save your
          thoughts.
        </h2>
      </div>
      <Link href="/add-entry" passHref>
        <div style={{
          backgroundColor: '#777ae8', 
          color: 'white',
          borderRadius: '170px', 
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          margin: '20px auto',
          width: '200px', 
          display: 'inline-block'
        }}>
          Add a New Entry
        </div>
      </Link>


      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/journalpng.svg"
          alt="Journal Logo"
          width={600}
          height={200}
          priority
        />
      </div>
        
    </main>
  );
}
