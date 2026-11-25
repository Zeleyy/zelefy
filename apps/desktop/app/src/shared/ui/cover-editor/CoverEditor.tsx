import { useTranslation } from "react-i18next";
import { Button, EditableCover, Flex } from "@zelefy/ui";
import { selectImage, toSrc } from "@/shared/lib/utils";

export type CoverDraft = string | null | undefined;
type CoverAction = "clear" | "delete" | "restore";

interface CoverEditorProps {
    imageSrc?: string | null;
    value: CoverDraft;
    onSelect: (path: string) => void;
    onClear: () => void;
    onRestore: () => void;
    alt?: string;
}

export const CoverEditor = ({
    imageSrc,
    value,
    onSelect,
    onClear,
    onRestore,
    alt,
}: CoverEditorProps) => {
    const { t } = useTranslation();

    const coverAction: CoverAction = (() => {
        if (value) return "clear";
        if (imageSrc) return value === null ? "restore" : "delete";
        return "clear";
    })();

    const handleEdit = async () => {
        const selected = await selectImage();
        if (selected) onSelect(selected);
    };

    const displayImage =
        value === null ? null : value === undefined ? toSrc(imageSrc) : toSrc(value);

    return (
        <Flex direction="column" gap="md">
            <EditableCover
                src={displayImage ?? undefined}
                alt={alt}
                size="xl"
                action={t("modal.edit_track.cover.action")}
                onEditClick={() => void handleEdit()}
            />

            <Button
                variant="secondary"
                type="button"
                disabled={!imageSrc && !value}
                onClick={() => {
                    if (value === undefined && imageSrc) onClear();
                    else onRestore();
                }}
            >
                {t("modal.edit_track.cover." + coverAction)}
            </Button>
        </Flex>
    );
};
