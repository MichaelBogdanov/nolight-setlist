import { useEffect, useState } from "react";
import axios from "axios";

import {
    Disclosure,
    DisclosureButton,
} from "@headlessui/react";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

import "./Setlist.css";

export default function Setlist() {
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        axios
            .get(
                "/api/concert/active/"
            )
            .then(response => {
                setSongs(response.data.songs);
            })
            .catch(error => {
                console.error(
                    "Ошибка загрузки сетлиста:",
                    error
                );
            });
    }, []);

    return (
        <section className="setlist-container">
            <section className="setlist">

                <div className="accordion">
                    {songs.map((song, index) => (
                        <Disclosure
                            key={index}
                            as="div"
                            className="accordion-item"
                        >
                            {({ open }) => (
                                <>
                                    <DisclosureButton className="accordion-button">
                                        <span>{song.title}</span>

                                        <ChevronDownIcon
                                            className={
                                                open
                                                    ? "chevron open"
                                                    : "chevron"
                                            }
                                        />
                                    </DisclosureButton>

                                    <AnimatePresence initial={false}>
                                        {open && (
                                            <motion.div
                                                initial={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    height: 0,
                                                    opacity: 0,
                                                }}
                                                transition={{
                                                    duration: 0.35,
                                                    ease: [0.4, 0, 0.2, 1],
                                                }}
                                                style={{
                                                    overflow: "hidden",
                                                    width: "100%",
                                                }}
                                            >
                                                <div className="accordion-panel">
                                                    {song.lyrics.split("\n").map((line, index) => (
                                                        <div key={index} className="lyrics-line">
                                                            {line || "\u00A0"}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </Disclosure>
                    ))}
                </div>
            </section>
        </section>
    );
}
