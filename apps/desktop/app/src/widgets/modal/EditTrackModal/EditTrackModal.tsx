import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, EditableCover, Flex, InputLabel, Modal } from "@zelefy/ui";
import { selectImage } from "@/shared/lib/utils";
import { toSrc, trackFileSrc, type LocalTrackResponse } from "@/entities/track";
import { useUpdateLocalTrack } from "@/features/player";

interface EditTrackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    track: LocalTrackResponse | null;
}

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

export const EditTrackModal = ({ open, onOpenChange, track }: EditTrackModalProps) => {
    const { t } = useTranslation();
    const { mutate: updateLocalTrack } = useUpdateLocalTrack();
    const [draftImagePath, setDraftImagePath] = useState<string | null>(null);

    const [draft, setDraft] = useState(() => ({
        title: track?.title ?? "",
        metadataArtist: track?.metadataArtist ?? "",
        genre: track?.genre ?? "",
        bpm: track?.bpm != null ? String(track.bpm) : "",
        keySignature: track?.keySignature ?? "",
        description: track?.description ?? "",
    }));

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
                    newCoverPath: draftImagePath || undefined,
                },
            },
            {
                onSuccess: () => onOpenChange(false),
            },
        );
    };

    const displayImage = toSrc(draftImagePath) ?? trackFileSrc(track?.cover);

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={t("offline.edit.title")}
            actions={
                <Flex justify="flex-end" gap="sm">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSave}>{t("common.save")}</Button>
                </Flex>
            }
        >
            <Flex as="form" gap="lg">
                <EditableCover
                    src={displayImage ?? undefined}
                    alt={draft?.title}
                    size="xl"
                    action={t("offline.edit.cover.action")}
                    onEditClick={() => handleBrowseImage()}
                />

                <Flex direction="column" gap="md" fullWidth>
                    {fields.map((field) => (
                        <InputLabel
                            key={field.name}
                            label={t(`offline.edit.field.${field.i18nKey}.label`)}
                            placeholder={t(`offline.edit.field.${field.i18nKey}.placeholder`)}
                            value={draft[field.name]}
                            onChange={update(field.name)}
                            required={field.required}
                        />
                    ))}
                </Flex>
            </Flex>
        </Modal>
    );
};
