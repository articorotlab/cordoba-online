"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import styles from "@/app/loading.module.css";

const MINIMUM_VISIBLE_TIME_MS = 450;
const SAFETY_TIMEOUT_MS = 10_000;

export function GlobalNavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] =
    useState(false);

  const loadingStartedAt =
    useRef(0);

  const loadingActive =
    useRef(false);

  const previousRoute =
    useRef<string | null>(null);

  const searchParamsKey =
    searchParams.toString();

  /*
   * Detecta clics en enlaces internos antes de que
   * Next.js comience la navegación.
   */
  useEffect(() => {
    function handleDocumentClick(
      event: MouseEvent,
    ) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor =
        target.closest<HTMLAnchorElement>(
          "a[href]",
        );

      if (!anchor) {
        return;
      }

      if (
        anchor.target &&
        anchor.target !== "_self"
      ) {
        return;
      }

      if (
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const rawHref =
        anchor.getAttribute("href");

      if (
        !rawHref ||
        rawHref.startsWith("#")
      ) {
        return;
      }

      const destination =
        new URL(
          anchor.href,
          window.location.href,
        );

      /*
       * No mostrar el cargador para enlaces externos.
       */
      if (
        destination.origin !==
        window.location.origin
      ) {
        return;
      }

      /*
       * No mostrarlo cuando el usuario pulsa un enlace
       * que conduce exactamente a la página actual.
       */
      if (
        destination.pathname ===
          window.location.pathname &&
        destination.search ===
          window.location.search &&
        destination.hash ===
          window.location.hash
      ) {
        return;
      }

      /*
       * No mostrarlo para navegación exclusivamente
       * hacia una sección de la misma página.
       */
      if (
        destination.pathname ===
          window.location.pathname &&
        destination.search ===
          window.location.search &&
        destination.hash
      ) {
        return;
      }

      loadingStartedAt.current =
        performance.now();

      loadingActive.current = true;
      setIsLoading(true);
    }

    document.addEventListener(
      "click",
      handleDocumentClick,
      true,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleDocumentClick,
        true,
      );
    };
  }, []);

  /*
   * usePathname y useSearchParams permiten detectar
   * cuándo Next.js terminó de cambiar la URL.
   */
  useEffect(() => {
    const currentRoute =
      `${pathname}?${searchParamsKey}`;

    if (
      previousRoute.current === null
    ) {
      previousRoute.current =
        currentRoute;

      return;
    }

    if (
      previousRoute.current ===
      currentRoute
    ) {
      return;
    }

    previousRoute.current =
      currentRoute;

    if (!loadingActive.current) {
      return;
    }

    const elapsed =
      performance.now() -
      loadingStartedAt.current;

    const remainingTime =
      Math.max(
        0,
        MINIMUM_VISIBLE_TIME_MS -
          elapsed,
      );

    const timeout =
      window.setTimeout(() => {
        loadingActive.current =
          false;

        setIsLoading(false);
      }, remainingTime);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    pathname,
    searchParamsKey,
  ]);

  /*
   * Protección para evitar que el overlay quede
   * visible si una navegación falla inesperadamente.
   */
  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        loadingActive.current =
          false;

        setIsLoading(false);
      }, SAFETY_TIMEOUT_MS);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [isLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Cargando página"
      aria-live="polite"
      className={styles.overlay}
    >
      <div
        aria-hidden="true"
        className={
          styles.brandWrapper
        }
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