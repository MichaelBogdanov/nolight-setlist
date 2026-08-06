import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

import { useWind } from "../wind/WindContext";

import "./Particles.css";

const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];

const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((c) => c + c)
            .join("");
    }

    const int = parseInt(hex.slice(0, 6), 16);

    return [
        ((int >> 16) & 255) / 255,
        ((int >> 8) & 255) / 255,
        (int & 255) / 255,
    ];
};

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec4 random;
attribute vec3 color;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;
uniform float uWind;
uniform float uSpread;
uniform float uBaseSize;
uniform float uSizeRandomness;

varying vec4 vRandom;
varying vec3 vColor;

void main() {

    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);

    float t = uTime;

    // Лёгкий общий сдвиг облака
    mPos.x += uWind * 0.25;

    // Индивидуальные колебания частиц
    mPos.x +=
        sin(t * random.z + 6.28 * random.w)
        *
        mix(0.1, 1.5, random.x)
        *
        (1.0 + uWind * 1.8);

    mPos.y +=
        sin(t * random.y + 6.28 * random.x)
        *
        mix(0.1, 1.5, random.w)
        *
        (1.0 + uWind * 1.8);

    mPos.z +=
        sin(t * random.w + 6.28 * random.y)
        *
        mix(0.1, 1.5, random.z)
        *
        (1.0 + uWind * 1.8);

    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
        gl_PointSize = uBaseSize;
    } else {
        gl_PointSize =
            (
                uBaseSize
                *
                (1.0 + uSizeRandomness * (random.x - 0.5))
            )
            /
            length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
}
`;

const fragment = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uAlphaParticles;

varying vec4 vRandom;
varying vec3 vColor;

void main() {

    vec2 uv = gl_PointCoord.xy;

    float d = length(uv - vec2(0.5));

    if (uAlphaParticles < 0.5) {

        if (d > 0.5) {
            discard;
        }

        gl_FragColor = vec4(
            vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28),
            1.0
        );

    } else {

        float circle = smoothstep(0.5, 0.4, d) * 0.8;

        gl_FragColor = vec4(
            vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28),
            circle
        );
    }
}
`;

const Particles = ({
    particleCount = 200,
    particleSpread = 10,
    speed = 0.1,
    particleColors,
    moveParticlesOnHover = false,
    particleHoverFactor = 1,
    alphaParticles = false,
    particleBaseSize = 100,
    sizeRandomness = 1,
    cameraDistance = 20,
    disableRotation = false,
    pixelRatio = window.devicePixelRatio,
    className,
}) => {
    const wind = useWind();

    const windRef = useRef(wind);
    const containerRef = useRef(null);

    useEffect(() => {
        windRef.current = wind;
    }, [wind]);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const renderer = new Renderer({
            dpr: pixelRatio,
            depth: false,
            alpha: true,
        });

        const gl = renderer.gl;

        container.appendChild(gl.canvas);

        gl.clearColor(0, 0, 0, 0);

        const camera = new Camera(gl, {
            fov: 15,
        });

        camera.position.set(0, 0, cameraDistance);

        const resize = () => {
            renderer.setSize(
                container.clientWidth,
                container.clientHeight
            );

            camera.perspective({
                aspect:
                    gl.canvas.width /
                    gl.canvas.height,
            });
        };

        window.addEventListener("resize", resize);

        resize();

        const positions = new Float32Array(
            particleCount * 3
        );

        const randoms = new Float32Array(
            particleCount * 4
        );

        const colors = new Float32Array(
            particleCount * 3
        );

        const palette =
            particleColors?.length
                ? particleColors
                : defaultColors;

        for (let i = 0; i < particleCount; i++) {
            let x, y, z, len;

            do {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                z = Math.random() * 2 - 1;

                len = x * x + y * y + z * z;
            } while (len > 1 || len === 0);

            const r = Math.cbrt(Math.random());

            positions.set(
                [x * r, y * r, z * r],
                i * 3
            );

            randoms.set(
                [
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random(),
                ],
                i * 4
            );

            colors.set(
                hexToRgb(
                    palette[
                        Math.floor(
                            Math.random() *
                                palette.length
                        )
                    ]
                ),
                i * 3
            );
        }

        const geometry = new Geometry(gl, {
            position: {
                size: 3,
                data: positions,
            },
            random: {
                size: 4,
                data: randoms,
            },
            color: {
                size: 3,
                data: colors,
            },
        });

        const program = new Program(gl, {
            vertex,
            fragment,

            uniforms: {
                uTime: {
                    value: 0,
                },

                uWind: {
                    value: 0,
                },

                uSpread: {
                    value: particleSpread,
                },

                uBaseSize: {
                    value:
                        particleBaseSize *
                        pixelRatio,
                },

                uSizeRandomness: {
                    value: sizeRandomness,
                },

                uAlphaParticles: {
                    value:
                        alphaParticles ? 1 : 0,
                },
            },

            transparent: true,
            depthTest: false,
        });

        const particles = new Mesh(gl, {
            mode: gl.POINTS,
            geometry,
            program,
        });

        let animationFrameId;

        const update = () => {
            const wind = windRef.current;

            program.uniforms.uTime.value =
                wind.time * speed;

            program.uniforms.uWind.value =
                wind.strength;

            if (moveParticlesOnHover) {
                const mouseX =
                    (wind.mouseX /
                        window.innerWidth) *
                        2 -
                    1;

                const mouseY =
                    -(
                        (wind.mouseY /
                            window.innerHeight) *
                            2 -
                        1
                    );

                particles.position.x =
                    -mouseX *
                    particleHoverFactor;

                particles.position.y =
                    -mouseY *
                    particleHoverFactor;
            } else {
                particles.position.x = 0;
                particles.position.y = 0;
            }

            if (!disableRotation) {
                const breeze = Math.sin(
                    wind.time * 0.7
                );

                particles.rotation.x =
                    breeze *
                    (0.08 +
                        wind.strength * 0.02);

                particles.rotation.y =
                    Math.cos(wind.time * 0.4) *
                    (0.12 +
                        wind.strength * 0.03);

                particles.rotation.z =
                    Math.sin(
                        wind.time * 0.18
                    ) *
                        0.05 +
                    wind.strength * 0.03;
            }

            renderer.render({
                scene: particles,
                camera,
            });

            animationFrameId =
                requestAnimationFrame(update);
        };

        animationFrameId =
            requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(
                animationFrameId
            );

            window.removeEventListener(
                "resize",
                resize
            );

            if (container.contains(gl.canvas)) {
                container.removeChild(
                    gl.canvas
                );
            }
        };
    }, [
        particleCount,
        particleSpread,
        speed,
        particleColors,
        moveParticlesOnHover,
        particleHoverFactor,
        alphaParticles,
        particleBaseSize,
        sizeRandomness,
        cameraDistance,
        disableRotation,
        pixelRatio,
    ]);

    return (
        <div
            ref={containerRef}
            className={`particles-container ${className ?? ""}`}
        />
    );
};

export default Particles;