import styles from "./ImportTracksModal.module.scss";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Flex, Modal, ProgressBar, Select } from "@zelefy/ui";
import type { ModalComponentProps } from "@/shared/lib/stores";
import { useImportTracks } from "@/features/player";
import { useLibraries } from "../../hooks";

export const ImportTracksModal = ({ paths, onClose }: ModalComponentProps<"importTracks">) => {
    const { t } = useTranslation();
    const { data: libraries = [] } = useLibraries();
    const { mutate: importTracks, progress, isSuccess, isError } = useImportTracks();

    const primaryLibrary = libraries.find((l) => l.isPrimary);
    const [selectedId, setSelectedId] = useState<string | undefined>();

    const activeLibraryId = selectedId ?? primaryLibrary?.libraryId;
    const options = libraries.map((l) => ({ value: l.libraryId, label: l.path }));

    const progressValue = isSuccess
        ? 100
        : progress && progress.total > 0
          ? (progress.done / progress.total) * 100
          : 0;

    return (
        <Modal
            open
            onOpenChange={(open) => !open && onClose()}
            title={t("modal.import_tracks.title")}
            actions={
                <>
                    <Flex justify="flex-end" align="center" gap="xs">
                        {isError || isSuccess ? (
                            <Button onClick={onClose}>{t("common.close")}</Button>
                        ) : (
                            <>
                                <Button variant="secondary" onClick={onClose}>
                                    {t("common.cancel")}
                                </Button>
                                <Button onClick={() => importTracks({ paths })}>
                                    {t("common.import")}
                                </Button>
                            </>
                        )}
                    </Flex>
                </>
            }
        >
            <Flex direction="column" gap="xs">
                <h4 className={styles.files__label}>{t("modal.import_tracks.select.label")}</h4>
                <Select
                    options={options}
                    value={activeLibraryId}
                    onChange={(value) => setSelectedId(value)}
                    disabled={isSuccess || !!progress}
                />
            </Flex>

            <Flex direction="column" gap="xs">
                <h4 className={styles.files__label}>
                    {t("modal.import_tracks.files.label", { count: paths.length })}
                </h4>
                <Flex direction="column" className={styles.files__list}>
                    {paths.map((p) => (
                        <div key={p} title={p} className={styles.files__listItem}>
                            {p}
                        </div>
                    ))}
                </Flex>
            </Flex>

            {(progress || isSuccess) && (
                <ProgressBar
                    value={progressValue}
                    variant={isError ? "error" : "primary"}
                    showLabel
                />
            )}
        </Modal>
    );
};
