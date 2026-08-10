import { useEffect, useRef, useState } from "react";
import "./Flashlight.css";

export default function Flashlight() {
    const [isMobile, setIsMobile] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const trackRef = useRef(null);

    /*
     * Определяем мобильное устройство / планшет.
     *
     * Используем комбинацию:
     * - coarse pointer;
     * - touch;
     * - User-Agent;
     *
     * Отдельно учитываем iPadOS,
     * который может представляться как Macintosh.
     */
    function isMobileOrTablet() {
        const hasCoarsePointer =
            window.matchMedia("(pointer: coarse)").matches;

        const hasTouch =
            navigator.maxTouchPoints > 0;

        const mobileUserAgent =
            /Android|iPhone|iPad|iPod|Mobile/i.test(
                navigator.userAgent
            );

        /*
         * iPadOS в режиме "Запросить веб-сайт
         * для компьютера" может представляться
         * как Macintosh.
         */
        const iPadOS =
            /Macintosh/i.test(navigator.userAgent) &&
            navigator.maxTouchPoints > 1;

        return (
            hasCoarsePointer &&
            hasTouch &&
            (mobileUserAgent || iPadOS)
        );
    }

    useEffect(() => {
        setIsMobile(isMobileOrTablet());

        return () => {
            stopCamera();
        };
    }, []);

    /*
     * Полностью освобождаем камеру.
     */
    function stopCamera() {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        try {
            track.stop();
        } catch (error) {
            console.error(
                "Не удалось освободить камеру:",
                error
            );
        }

        trackRef.current = null;
    }

    /*
     * Основной обработчик кнопки.
     */
    async function handleButtonClick() {
        if (loading) {
            return;
        }

        if (enabled) {
            await turnOff();
            return;
        }

        await turnOn();
    }

    /*
     * Включение фонарика.
     *
     * getUserMedia() вызывается непосредственно
     * после пользовательского нажатия.
     */
    async function turnOn() {
        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            return;
        }

        setLoading(true);

        let stream = null;

        try {
            /*
             * Запрашиваем заднюю камеру.
             *
             * Используем ideal, чтобы браузер мог
             * выбрать подходящую камеру самостоятельно.
             */
            stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment",
                        },
                    },
                    audio: false,
                });

            const track = stream.getVideoTracks()[0];

            if (!track) {
                throw new Error(
                    "Не удалось получить видеотрек камеры."
                );
            }

            /*
             * Проверяем поддержку torch,
             * если браузер предоставляет capabilities.
             */
            const capabilities =
                typeof track.getCapabilities === "function"
                    ? track.getCapabilities()
                    : null;

            if (
                capabilities &&
                capabilities.torch !== true
            ) {
                throw new Error(
                    "Фонарик не поддерживается."
                );
            }

            /*
             * Сохраняем track перед управлением
             * фонариком.
             */
            trackRef.current = track;

            /*
             * Включаем вспышку.
             */
            await track.applyConstraints({
                advanced: [
                    {
                        torch: true,
                    },
                ],
            });

            /*
             * Только после успешного включения
             * считаем фонарик активным.
             */
            setEnabled(true);
        } catch (error) {
            console.error(
                "Не удалось включить фонарик:",
                error
            );

            /*
             * Если камера была открыта, но torch
             * включить не удалось — освобождаем
             * камеру.
             */
            if (stream) {
                stream
                    .getTracks()
                    .forEach((track) => {
                        try {
                            track.stop();
                        } catch {
                            // Ничего не делаем.
                        }
                    });
            }

            trackRef.current = null;
            setEnabled(false);
        } finally {
            setLoading(false);
        }
    }

    /*
     * Выключение фонарика.
     */
    async function turnOff() {
        if (loading) {
            return;
        }

        setLoading(true);

        const track = trackRef.current;

        if (!track) {
            setEnabled(false);
            setLoading(false);
            return;
        }

        try {
            /*
             * Сначала выключаем torch.
             */
            await track.applyConstraints({
                advanced: [
                    {
                        torch: false,
                    },
                ],
            });
        } catch (error) {
            console.error(
                "Не удалось выключить фонарик:",
                error
            );
        } finally {
            /*
             * После выключения torch полностью
             * освобождаем камеру.
             */
            stopCamera();

            setEnabled(false);
            setLoading(false);
        }
    }

    /*
     * При уходе со страницы освобождаем камеру.
     *
     * Особенно важно для мобильных браузеров.
     */
    useEffect(() => {
        function handlePageHide() {
            const track = trackRef.current;

            if (!track) {
                return;
            }

            try {
                track.stop();
            } catch {
                // Ничего не делаем.
            }

            trackRef.current = null;
        }

        window.addEventListener(
            "pagehide",
            handlePageHide
        );

        return () => {
            window.removeEventListener(
                "pagehide",
                handlePageHide
            );
        };
    }, []);

    /*
     * На компьютере кнопку не показываем.
     */
    if (!isMobile) {
        return null;
    }

    return (
        <button
            type="button"
            className={`flashlight-button ${
                enabled ? "active" : ""
            }`}
            onClick={handleButtonClick}
            disabled={loading}
            aria-label={
                enabled
                    ? "Выключить фонарик"
                    : "Включить фонарик"
            }
            title={
                enabled
                    ? "Выключить фонарик"
                    : "Включить фонарик"
            }
        >
            <span className="flashlight-icon">
                {enabled ? "☀" : "☼"}
            </span>
        </button>
    );
}