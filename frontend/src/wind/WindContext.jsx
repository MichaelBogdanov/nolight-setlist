import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

const WindContext = createContext(null);

export function WindProvider({ children }) {
    const [wind, setWind] = useState({
        time: 0,

        mouseX: window.innerWidth / 2,
        mouseY: window.innerHeight / 2,

        velocityX: 0,
        velocityY: 0,

        strength: 0,

        directionX: 0,
        directionY: 0,

        breeze: 0,
    });

    const mouse = useRef({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    });

    const velocity = useRef({
        x: 0,
        y: 0,
    });

    const targetStrength = useRef(0);
    const currentStrength = useRef(0);

    const targetDirection = useRef({
        x: 0,
        y: 0,
    });

    const direction = useRef({
        x: 0,
        y: 0,
    });

    useEffect(() => {
        let frame;

        function onMouseMove(e) {
            velocity.current.x =
                e.clientX - mouse.current.x;

            velocity.current.y =
                e.clientY - mouse.current.y;

            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;

            const len = Math.hypot(
                velocity.current.x,
                velocity.current.y
            );

            if (len > 0.001) {
                targetDirection.current.x =
                    velocity.current.x / len;

                targetDirection.current.y =
                    velocity.current.y / len;
            }

            targetStrength.current = Math.min(
                1,
                len / 40
            );
        }

        window.addEventListener(
            "mousemove",
            onMouseMove
        );

        function update(now) {
            frame = requestAnimationFrame(update);

            targetStrength.current *= 0.985;

            currentStrength.current +=
                (targetStrength.current -
                    currentStrength.current) *
                0.06;

            direction.current.x +=
                (targetDirection.current.x -
                    direction.current.x) *
                0.05;

            direction.current.y +=
                (targetDirection.current.y -
                    direction.current.y) *
                0.05;

            const breeze =
                Math.sin(now * 0.00018) +
                Math.sin(now * 0.00007) * 0.5;

            setWind({
                time: now * 0.001,

                mouseX: mouse.current.x,
                mouseY: mouse.current.y,

                velocityX: velocity.current.x,
                velocityY: velocity.current.y,

                strength: currentStrength.current,

                directionX: direction.current.x,
                directionY: direction.current.y,

                breeze,
            });
        }

        frame = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(frame);

            window.removeEventListener(
                "mousemove",
                onMouseMove
            );
        };
    }, []);

    return (
        <WindContext.Provider value={wind}>
            {children}
        </WindContext.Provider>
    );
}

export function useWind() {
    return useContext(WindContext);
}