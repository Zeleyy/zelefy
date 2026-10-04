import { usePlayerStore } from "@/shared/lib/stores";
import { Button } from "@zelefy/ui";

export const HomePage = () => {
    const resetPlayer = usePlayerStore((state) => state.resetPlayer);
    const playTrack = usePlayerStore((state) => state.playTrack);

    return (
        <>
            <div>HomePage</div>
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
