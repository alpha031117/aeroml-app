"use client";

import Image from "next/image";
import styles from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.blinking}>
        <Image
          src="/images/aeroml-icon.png"
          alt="Loading..."
          width={96}
          height={96}
          priority
        />
      </div>
    </div>
  );
}
