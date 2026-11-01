import { useState } from "react";
import { useTranslation } from "react-i18next";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Button, Cover, Flex, InputLabel, Modal } from "@zelefy/ui";
import type { LocalTrackResponse } from "@/shared/types";

interface EditTrackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    track: LocalTrackResponse | null;
}

type EditableField = "title" | "metadataArtist" | "genre" | "bpm" | "keySignature" | "description";

const fields: { name: EditableField; required?: boolean }[] = [
    { name: "title", required: true },
    { name: "metadataArtist" },
    { name: "genre" },
    { name: "bpm" },
    { name: "keySignature" },
    { name: "description" },
];

export const EditTrackModal = ({ open, onOpenChange, track }: EditTrackModalProps) => {
    const { t } = useTranslation();

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

    const coverPath = track?.cover
        ? convertFileSrc(track.cover.library.path + "/" + track.cover.path)
        : null;

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
                    <Button onClick={() => alert(t("common.in_development"))}>
                        {t("common.save")}
                    </Button>
                </Flex>
            }
        >
            <Flex as="form" gap="lg">
                <Cover src={coverPath ?? undefined} alt={draft?.title} size="xl" />

                <Flex direction="column" gap="md" fullWidth>
                    {fields.map((field) => (
                        <InputLabel
                            key={field.name}
                            label={t("offline.edit.field.label." + field.name)}
                            placeholder={t("offline.edit.field.placeholder." + field.name)}
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
