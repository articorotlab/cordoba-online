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
        aria-hidden="true"
        className={styles.brandWrapper}
      >
        <div className={styles.brandTyping}>
          <span className={styles.cordoba}>
            cordoba.
          </span>

          <span className={styles.onlineTyping}>
            online...
          </span>
        </div>
      </div>

      <span className={styles.screenReaderText}>
        Cargando página
      </span>
    </div>
  );
}