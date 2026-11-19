import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, EditableCover, Flex, InputLabel, Modal, SpinnerLoader } from "@zelefy/ui";
import type { ModalComponentProps } from "@/shared/lib/stores";
import { selectImage } from "@/shared/lib/utils";
import { toSrc, trackFileSrc } from "@/entities/track";
import { useLocalTrackDetails, useUpdateLocalTrack } from "../../hooks";

type EditableField = "title" | "metadataArtist" | "genre" | "bpm" | "keySignature" | "description";
type CoverAction = "clear" | "delete" | "restore";

const fields: {
    name: EditableField;
    i18nKey: string;
    required?: boolean;
}[] = [
    { name: "title", i18nKey: "title", required: true },
    { name: "metadataArtist", i18nKey: "metadata_artist" },
    { name: "genre", i18nKey: "genre" },
    { name: "bpm", i18nKey: "bpm" },
    { name: "keySignature", i18nKey: "key_signature" },
    { name: "description", i18nKey: "description" },
];

export const EditTrackModal = ({ trackId, onClose }: ModalComponentProps<"editTrack">) => {
    const { t } = useTranslation();
    const numericId = typeof trackId === "number" ? trackId : null;

    const { data: track, isLoading } = useLocalTrackDetails(numericId);

    const { mutate: updateLocalTrack } = useUpdateLocalTrack();
    const [draftImagePath, setDraftImagePath] = useState<string | null | undefined>(undefined);

    const [draft, setDraft] = useState({
        title: "",
        metadataArtist: "",
        genre: "",
        bpm: "",
        keySignature: "",
        description: "",
    });

    const [prevTrack, setPrevTrack] = useState<typeof track>(undefined);

    if (track !== prevTrack) {
        setPrevTrack(track);
        if (track) {
            setDraft({
                title: track.title ?? "",
                metadataArtist: track.metadataArtist ?? "",
                genre: track.genre ?? "",
                bpm: track.bpm != null ? String(track.bpm) : "",
                keySignature: track.keySignature ?? "",
                description: track.description ?? "",
            });
        }
    }

    const update = (name: EditableField) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft((d) => ({ ...d, [name]: e.target.value }));

    const handleBrowseImage = async () => {
        const selected = await selectImage();
        if (selected) setDraftImagePath(selected);
    };

    const handleSave = () => {
        if (!track) return;

        updateLocalTrack(
            {
                trackId: track.trackId,
                update: {
                    title: draft.title || undefined,
                    metadataArtist: draft.metadataArtist || null,
                    genre: draft.genre || null,
                    bpm: draft.bpm ? Number(draft.bpm) : null,
                    keySignature: draft.keySignature || null,
                    description: draft.description || null,
                    newCoverPath: draftImagePath,
                },
            },
            {
                onSuccess: () => onClose(),
            },
        );
    };

    const coverAction: CoverAction = (() => {
        if (draftImagePath) return "clear";
        if (track?.cover) {
            return draftImagePath === null ? "restore" : "delete";
        }
        return "clear";
    })();

    const displayImage =
        draftImagePath === null
            ? null
            : draftImagePath === undefined
              ? trackFileSrc(track?.cover)
              : toSrc(draftImagePath);

    return (
        <Modal
            open
            onOpenChange={(open) => !open && onClose()}
            title={t("modal.edit_track.title")}
            actions={
                <Flex justify="flex-end" gap="sm">
                    <Button variant="secondary" onClick={() => onClose()}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSave}>{t("common.save")}</Button>
                </Flex>
            }
        >
            {isLoading || !track ? (
                <SpinnerLoader isLoading />
            ) : (
                <Flex as="form" gap="lg">
                    <Flex direction="column" gap="md">
                        <EditableCover
                            src={displayImage ?? undefined}
                            alt={draft?.title}
                            size="xl"
                            action={t("modal.edit_track.cover.action")}
                            onEditClick={() => void handleBrowseImage()}
                        />

                        <Button
                            variant="secondary"
                            type="button"
                            disabled={!track?.cover && !draftImagePath}
                            onClick={() => {
                                setDraftImagePath(coverAction === "delete" ? null : undefined);
                            }}
                        >
                            {t("modal.edit_track.cover." + coverAction)}
                        </Button>
                    </Flex>

                    <Flex direction="column" gap="md" fullWidth>
                        {fields.map((field) => (
                            <InputLabel
                                key={field.name}
                                label={t(`modal.edit_track.field.${field.i18nKey}.label`)}
                                placeholder={t(
                                    `modal.edit_track.field.${field.i18nKey}.placeholder`,
                                )}
                                value={draft[field.name]}
                                onChange={update(field.name)}
                                required={field.required}
                            />
                        ))}
                    </Flex>
                </Flex>
            )}
        </Modal>
    );
};
