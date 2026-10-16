import { usePlayerStore } from "@/shared/lib/stores";
import { Button } from "@zelefy/ui";
import { useTranslation } from "react-i18next";

export const HomePage = () => {
    const { t } = useTranslation();
    const resetPlayer = usePlayerStore((state) => state.resetPlayer);
    const playTrack = usePlayerStore((state) => state.playTrack);

    return (
        <>
            <h1>{t("home.title")}</h1>

            <Button variant="primary" onClick={resetPlayer}>
                Hide player
            </Button>
            <br />
            <Button
                variant="primary"
                onClick={() =>
                    playTrack({
                        trackId: "",
                        userId: "",
                        permalink: "string",

                        title: "A-One - U.N. Owen Was Her? feat. HIKO",
                        audioUrl: "",
                        durationSeconds: 204,
                        coverUrl: null,
                        waveformUrl: "",

                        genre: null,
                        description: null,
                        bpm: null,
                        keySignature: null,
                        createdAt: "",

                        playsCount: 0,
                        likesCount: 0,
                        repostsCount: 0,
                        commentsCount: 0,
                    })
                }
            >
                Show player
            </Button>
        </>
    );
};
