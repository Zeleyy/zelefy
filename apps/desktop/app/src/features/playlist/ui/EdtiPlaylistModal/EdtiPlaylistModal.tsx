import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Flex, InputLabel, Modal, SpinnerLoader } from "@zelefy/ui";
import type { ModalComponentProps } from "@/shared/lib/stores";
import { useLocalPlaylist, useUpdateLocalPlaylist } from "../../hooks";
import type { UpdatePlaylistRequest } from "@/entities/playlist";
import { CoverEditor, type CoverDraft } from "@/shared/ui/cover-editor";

type EditableField = "title" | "description";

const fields: {
    name: EditableField;
    i18nKey: string;
    required?: boolean;
}[] = [
    { name: "title", i18nKey: "title", required: true },
    { name: "description", i18nKey: "description" },
];

export const EdtiPlaylistModal = ({ playlistId, onClose }: ModalComponentProps<"editPlaylist">) => {
    const { t } = useTranslation();
    const numericId = typeof playlistId === "number" ? playlistId : null;
    const { data: playlist, isLoading } = useLocalPlaylist(numericId);

    const { mutate: updateLocalPlaylist } = useUpdateLocalPlaylist();

    const [coverDraft, setCoverDraft] = useState<CoverDraft>(undefined);

    const [draft, setDraft] = useState<UpdatePlaylistRequest>({
        title: undefined,
        description: undefined,
    });

    const [prevPlaylist, setPrevPlaylist] = useState<typeof playlist>(undefined);

    if (playlist !== prevPlaylist) {
        setPrevPlaylist(playlist);
        if (playlist) {
            setDraft({
                title: playlist.title ?? "",
                description: playlist.description ?? undefined,
            });
        }
    }

    const update = (name: EditableField) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setDraft((d) => ({ ...d, [name]: e.target.value }));

    const handleSave = () => {
        if (!playlist) return;

        updateLocalPlaylist(
            {
                playlistId: playlist.playlistId,
                update: {
                    title: draft.title || undefined,
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
            title={t("modal.edit_playlist.title")}
            actions={
                <Flex justify="flex-end" gap="sm">
                    <Button variant="secondary" onClick={() => onClose()}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={handleSave}>{t("common.save")}</Button>
                </Flex>
            }
        >
            {isLoading || !playlist ? (
                <SpinnerLoader isLoading />
            ) : (
                <Flex as="form" gap="lg">
                    <CoverEditor
                        imageSrc={playlist.coverPath}
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
                                label={t(`modal.edit_playlist.field.${field.i18nKey}.label`)}
                                placeholder={t(
                                    `modal.edit_playlist.field.${field.i18nKey}.placeholder`,
                                )}
                                value={draft[field.name] ?? undefined}
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
