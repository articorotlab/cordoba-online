import {
  BrandTypingLoader,
} from "@/components/layout/BrandTypingLoader";

import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Cargando página"
      aria-live="polite"
      className={styles.overlay}
    >
      <div
        className={
          styles.brandWrapper
        }
      >
        <BrandTypingLoader />
      </div>

      <span
        className={
          styles.screenReaderText
        }
      >
        Cargando página
      </span>
    </div>
  );
}