import { useEffect, useRef } from "react";
import { useWind } from "../wind/WindContext";

import logo from "../assets/logo.png";

export default function Logo() {
    const wind = useWind();

    const ref = useRef(null);

    useEffect(() => {
        let frame;

        function animate() {
            frame = requestAnimationFrame(animate);

            if (!ref.current) return;

            const sway =
                Math.sin(wind.time * 0.8) * 1.2;

            const breeze =
                wind.breeze * 1.3;

            const mouse =
                wind.directionX *
                wind.strength *
                2.5;

            const rotate =
                sway +
                breeze +
                mouse;

            const lift =
                Math.sin(wind.time * 0.45) * 2;

            const breathing =
                1 +
                Math.sin(wind.time * 0.35) * 0.015;

            ref.current.style.transform = `
                translateY(${lift}px)
                rotate(${rotate}deg)
                scale(${breathing})
            `;
        }

        animate();

        return () => cancelAnimationFrame(frame);
    }, [wind]);

    return (
        <a
            className="logo-link"
            href="https://vk.ru/no_light_band"
            target="_blank"
            rel="noopener noreferrer"
        >
            <img
                ref={ref}
                src={logo}
                className="logo"
                alt="NoLight"
                draggable={false}
            />
        </a>
    );
}