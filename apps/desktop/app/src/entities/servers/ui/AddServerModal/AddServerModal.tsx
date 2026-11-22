import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Flex, InputLabel, Modal } from "@zelefy/ui";
import type { ModalComponentProps } from "@/shared/lib/stores";
import { useAddServer } from "../../hooks/useAddServer";

export const AddServerModal = ({ onClose }: ModalComponentProps<"addServer">) => {
    const { t } = useTranslation();

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [touched, setTouched] = useState({ name: false, url: false });

    const { mutateAsync, isPending, reset } = useAddServer();

    const trimmedName = name.trim();
    const trimmedUrl = url
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "");

    const nameIsValid = trimmedName.length > 0;
    const urlIsValid = trimmedUrl.length > 0 && /^[^\s/]+\.[^\s/]+/.test(trimmedUrl);
    const isValid = nameIsValid && urlIsValid;

    const showNameError = touched.name && !nameIsValid;
    const showUrlError = touched.url && !urlIsValid;

    const handleSave = useCallback(async () => {
        setTouched({ name: true, url: true });
        if (!nameIsValid || !urlIsValid) return;

        await mutateAsync({ serverName: trimmedName, serverUrl: trimmedUrl });
        onClose();
    }, [nameIsValid, urlIsValid, trimmedName, trimmedUrl, mutateAsync, onClose]);

    return (
        <Modal
            open
            onOpenChange={(open) => {
                if (!open) {
                    reset();
                    onClose();
                }
            }}
            title={t("modal.add_server.title")}
            actions={
                <Flex justify="flex-end" gap="sm">
                    <Button variant="secondary" onClick={() => onClose()} disabled={isPending}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={() => void handleSave()} disabled={isPending || !isValid}>
                        {t("common.save")}
                    </Button>
                </Flex>
            }
        >
            <InputLabel
                label={t("modal.add_server.field.name.label")}
                placeholder={t("modal.add_server.field.name.placeholder")}
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    setTouched((prev) => (prev.name ? prev : { ...prev, name: true }));
                }}
                error={showNameError ? t("modal.add_server.field.name.error") : undefined}
                disabled={isPending}
                required
            />

            <InputLabel
                label={t("modal.add_server.field.url.label")}
                placeholder={t("modal.add_server.field.url.placeholder")}
                value={url}
                onChange={(e) => {
                    setUrl(e.target.value);
                    setTouched((prev) => (prev.url ? prev : { ...prev, url: true }));
                }}
                error={showUrlError ? t("modal.add_server.field.url.error") : undefined}
                disabled={isPending}
                required
            />
        </Modal>
    );
};
