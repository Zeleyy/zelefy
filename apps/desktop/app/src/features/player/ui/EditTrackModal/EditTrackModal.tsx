import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Flex, InputLabel, Modal, SpinnerLoader } from "@zelefy/ui";
import type { ModalComponentProps } from "@/shared/lib/stores";
import { useLocalTrackDetails, useUpdateLocalTrack } from "../../hooks";
import { CoverEditor, type CoverDraft } from "@/shared/ui";

type EditableField = "title" | "metadataArtist" | "genre" | "bpm" | "keySignature" | "description";

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
    const [coverDraft, setCoverDraft] = useState<CoverDraft>(undefined);

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
                    newCoverPath: coverDraft,
                },
            },
            {
                onSuccess: () => onClose(),
            },
        );
    };

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
                    <CoverEditor
                        imageSrc={track?.image?.fullPath}
                        value={coverDraft}
                        onSelect={setCoverDraft}
                        onClear={() => setCoverDraft(null)}
                        onRestore={() => setCoverDraft(undefined)}
                        alt={draft.title}
                    />

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
