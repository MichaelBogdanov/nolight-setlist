import { useEffect, useRef } from "react";
import { useWind } from "../wind/WindContext";

import "./Flowers.css";

import flower1 from "../assets/flowers/romashka_A1.png";
import flower2 from "../assets/flowers/romashka_A2.png";
import flower3 from "../assets/flowers/romashka_A3.png";
import flower4 from "../assets/flowers/romashka_A4.png";
import flower5 from "../assets/flowers/romashka_A5.png";
import flower6 from "../assets/flowers/romashka_A6.png";
import flower7 from "../assets/flowers/romashka_A7.png";
import flower8 from "../assets/flowers/romashka_A8.png";

const flowers = [
    {
        image: flower1,
        left: "6%",
        top: "8%",
        size: 170,
    },
    {
        image: flower2,
        left: "82%",
        top: "6%",
        size: 140,
    },
    {
        image: flower3,
        left: "12%",
        top: "70%",
        size: 190,
    },
    {
        image: flower4,
        left: "86%",
        top: "63%",
        size: 180,
    },
    {
        image: flower5,
        left: "35%",
        top: "15%",
        size: 120,
    },
    {
        image: flower6,
        left: "70%",
        top: "42%",
        size: 150,
    },
    {
        image: flower7,
        left: "28%",
        top: "83%",
        size: 160,
    },
    {
        image: flower8,
        left: "56%",
        top: "78%",
        size: 130,
    },
];

const mobileFlowers = [
    {
        image: flower1,
        left: "-8%",
        top: "6%",
        size: 120,
    },
    {
        image: flower2,
        left: "76%",
        top: "12%",
        size: 100,
    },
    {
        image: flower3,
        left: "-10%",
        top: "34%",
        size: 140,
    },
    {
        image: flower4,
        left: "82%",
        top: "52%",
        size: 130,
    },
    {
        image: flower5,
        left: "-6%",
        top: "74%",
        size: 110,
    },
    {
        image: flower6,
        left: "80%",
        top: "88%",
        size: 120,
    },
    {
        image: flower7,
        left: "38%",
        top: "2%",
        size: 80,
    },
    {
        image: flower8,
        left: "40%",
        top: "96%",
        size: 90,
    },
];

const isMobile = window.innerWidth <= 768;

const currentFlowers = isMobile
    ? mobileFlowers
    : flowers;

export default function Flowers() {
    const wind = useWind();

    const refs = useRef([]);

    useEffect(() => {
        let frame;

        function animate() {
            frame = requestAnimationFrame(animate);

            refs.current.forEach((el, index) => {
                if (!el) return;

                const phase = index * 0.8;

                const windForce =
                    Math.sin(
                        wind.strength *
                            Math.PI /
                            2
                    );

                const baseRotation =
                    (index % 2 === 0
                        ? -1
                        : 1) *
                    (3 + index);

                const sway =
                    Math.sin(wind.time * 0.9 + phase) *
                    (isMobile ? 3 : 6);

                const breeze =
                    wind.breeze * 3;

                const mouse =
                    wind.directionX *
                    windForce *
                    (4 + index * 0.6);

                const rotate =
                    baseRotation +
                    sway +
                    breeze +
                    mouse;

                const parallaxMultiplier =
                    isMobile ? 0.45 : 1;

                const parallaxX =
                    (wind.mouseX / window.innerWidth - 0.5) *
                    (10 + index * 2) *
                    parallaxMultiplier;

                const parallaxY =
                    (wind.mouseY / window.innerHeight - 0.5) *
                    (6 + index) *
                    parallaxMultiplier;

                const drift =
                    Math.sin(
                        wind.time * 0.35 +
                            phase
                    ) * 3;

                const translateX =
                    parallaxX;

                const translateY =
                    drift + parallaxY;

                const depth =
                    0.82 +
                    index * 0.035;

                const breathing =
                    1 +
                    Math.sin(
                        wind.time * 0.25 +
                            phase
                    ) *
                        0.025;

                const centerX =
                    el.offsetLeft +
                    el.offsetWidth / 2;

                const centerY =
                    el.offsetTop +
                    el.offsetHeight / 2;

                const distance =
                    Math.hypot(
                        wind.mouseX -
                            centerX,
                        wind.mouseY -
                            centerY
                    );

                const glow =
                    Math.max(
                        0,
                        1 - distance / 450
                    );

                el.style.filter = `
                    drop-shadow(0 0 ${18 * glow}px rgba(255,255,255,.22))
                    drop-shadow(0 0 ${40 * glow}px rgba(255,255,255,.08))
                `;

                el.style.transform = `
                    translate3d(
                        ${translateX}px,
                        ${translateY}px,
                        0
                    )
                    rotate(${rotate}deg)
                    scale(${depth * breathing})
                `;
            });
        }

        animate();

        return () =>
            cancelAnimationFrame(frame);
    }, [wind]);

    return (
        <div className="flowers">
            {currentFlowers.map(
                (flower, index) => (
                    <img
                        key={index}
                        ref={(el) =>
                            (refs.current[index] =
                                el)
                        }
                        className="flower"
                        src={flower.image}
                        alt=""
                        draggable={false}
                        style={{
                            left: flower.left,
                            top: flower.top,
                            width: flower.size,
                            opacity: isMobile
                                ? 0.06 + Math.random() * 0.07
                                : 0.08 + Math.random() * 0.12,
                        }}
                    />
                )
            )}
        </div>
    );
}