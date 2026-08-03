"use client";

import {
  useEffect,
  useState,
} from "react";

import styles from "@/app/loading.module.css";

const ONLINE_TEXT = "online";

const TYPING_DELAY_MS = 110;
const CURSOR_BLINK_DELAY_MS = 220;
const RESTART_DELAY_MS = 140;

/*
 * Etapas:
 *
 * 0–5:
 * Se escriben las seis letras de "online".
 *
 * 6–11:
 * El cursor cambia de visibilidad seis veces,
 * equivalentes a tres parpadeos completos.
 *
 * 12:
 * Pausa breve y reinicio.
 */
const TYPING_STEPS =
  ONLINE_TEXT.length;

const CURSOR_BLINK_STEPS = 6;

const FINAL_STEP =
  TYPING_STEPS +
  CURSOR_BLINK_STEPS;

export function BrandTypingLoader() {
  const [
    animationStep,
    setAnimationStep,
  ] = useState(0);

  useEffect(() => {
    const isTyping =
      animationStep <
      TYPING_STEPS;

    const isBlinking =
      animationStep >=
        TYPING_STEPS &&
      animationStep <
        FINAL_STEP;

    const delay = isTyping
      ? TYPING_DELAY_MS
      : isBlinking
        ? CURSOR_BLINK_DELAY_MS
        : RESTART_DELAY_MS;

    const timeout =
      window.setTimeout(() => {
        setAnimationStep(
          (currentStep) => {
            if (
              currentStep >=
              FINAL_STEP
            ) {
              return 0;
            }

            return (
              currentStep + 1
            );
          },
        );
      }, delay);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [animationStep]);

  const visibleCharacterCount =
    Math.min(
      animationStep,
      TYPING_STEPS,
    );

  const visibleOnlineText =
    ONLINE_TEXT.slice(
      0,
      visibleCharacterCount,
    );

  const isTyping =
    animationStep <
    TYPING_STEPS;

  const blinkStep =
    animationStep -
    TYPING_STEPS;

  /*
   * Durante la escritura el cursor siempre está visible.
   *
   * Cuando termina "online", alterna:
   * visible → oculto → visible...
   */
  const cursorVisible =
    isTyping ||
    blinkStep < 0 ||
    blinkStep % 2 === 0;

  return (
    <div
      aria-hidden="true"
      className={
        styles.brandTyping
      }
    >
      <span
        className={
          styles.cordoba
        }
      >
        cordoba.
      </span>

      <span
        className={styles.onlineText}
        style={{
            color: "rgb(37 99 235)",
        }}
        >
        {visibleOnlineText}
      </span>

      <span
        className={[
          styles.typingCursor,
          cursorVisible
            ? styles.typingCursorVisible
            : styles.typingCursorHidden,
        ].join(" ")}
      />
    </div>
  );
}