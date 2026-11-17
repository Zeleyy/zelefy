import { useTranslation } from "react-i18next";
import { Modal, SpinnerLoader, Tabs, type TabItem } from "@zelefy/ui";
import type { ModalComponentProps } from "@/shared/lib/stores";
import { useLocalTrackDetails } from "@/features/player";
import { useMemo, useState } from "react";
import { CreatePlaylistTab } from "../CreatePlaylistTab";
import { AddToPlaylistTab } from "../AddToPlaylistTab";

type AddToPlaylistTab = "add" | "create";

export const AddToPlaylistModal = ({ trackId, onClose }: ModalComponentProps<"addToPlaylist">) => {
    const { t } = useTranslation();
    const [tab, setTab] = useState<AddToPlaylistTab>("add");

    const tabs: TabItem<AddToPlaylistTab>[] = useMemo(
        () => [
            { label: t("modal.add_to_playlist.tab.add.title"), value: "add" },
            { label: t("modal.add_to_playlist.tab.create.title"), value: "create" },
        ],
        [t],
    );

    const numericId = typeof trackId === "number" ? trackId : null;
    const { data: track, isLoading } = useLocalTrackDetails(numericId);

    return (
        <Modal open onOpenChange={(open) => !open && onClose()}>
            {isLoading || !track ? (
                <SpinnerLoader isLoading />
            ) : (
                <>
                    <Tabs<AddToPlaylistTab>
                        active={tab}
                        tabs={tabs}
                        onTabClick={(value) => {
                            setTab(value);
                        }}
                    />

                    {tab === "add" ? (
                        <AddToPlaylistTab track={track} />
                    ) : (
                        <CreatePlaylistTab track={track} />
                    )}
                </>
            )}
        </Modal>
    );
};
