import styles from "./Titlebar.module.scss";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, Flex, Icon, Input } from "@zelefy/ui";
import { useSettingsStore } from "@/shared/lib/stores";
import { useBlurOnOutsideClick } from "../hooks";

export const Titlebar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const appWindow = getCurrentWindow();
    const currentTheme = useSettingsStore((state) => state.theme);
    const toggleTheme = useSettingsStore((state) => state.toggleTheme);
    const currentIdx = (window.history.state?.idx as number) ?? 0;
    const canGoBack = currentIdx > 0;
    const canGoForward = currentIdx < window.history.length - 1;

    const handleTitlebarMouseDown = useBlurOnOutsideClick();

    return (
        <header
            className={styles.titlebar}
            data-tauri-drag-region
            onMouseDown={handleTitlebarMouseDown}
        >
            <Flex gap="xs" data-tauri-drag-region>
                <div className={styles.brand} data-tauri-drag-region>
                    <Icon name="zelefy" width={22} height={22} />
                    <span>Zelefy Desktop</span>
                </div>

                <Flex gap="2xs" data-tauri-drag-region>
                    <Button
                        variant="ghost"
                        aria-label={t("titlebar.back")}
                        onClick={() => navigate(-1)}
                        disabled={!canGoBack}
                        square
                    >
                        <Icon name="navigation-chevron-left" width={17} height={17} />
                    </Button>

                    <Button
                        variant="ghost"
                        aria-label={t("titlebar.forward")}
                        onClick={() => navigate(1)}
                        disabled={!canGoForward}
                        square
                    >
                        <Icon name="navigation-chevron-right" width={17} height={17} />
                    </Button>
                </Flex>
            </Flex>

            <div className={styles.searchWrapper} data-tauri-drag-region>
                <Input
                    id="titlebar-search"
                    name="search"
                    placeholder={t("titlebar.searchPlaceholder")}
                    leftIcon={<Icon name="common-search" width={17} height={17} />}
                />
            </div>

            <Flex gap="2xs" justify="center" align="center" data-tauri-drag-region>
                <Button
                    variant="ghost"
                    square
                    onClick={toggleTheme}
                    aria-label={
                        currentTheme === "dark"
                            ? t("titlebar.theme.switchToLight")
                            : t("titlebar.theme.switchToDark")
                    }
                >
                    <Icon
                        name={currentTheme === "dark" ? "common-sun" : "common-moon"}
                        width={16}
                        height={16}
                    />
                </Button>

                <div className={styles.divider} data-tauri-drag-region />

                <Button
                    variant="ghost"
                    onClick={() => appWindow.minimize()}
                    aria-label={t("titlebar.minimize")}
                    square
                >
                    <Icon name="window-minimize" width={15} height={15} />
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => appWindow.toggleMaximize()}
                    aria-label={t("titlebar.maximize")}
                    square
                >
                    <Icon name="window-maximize" width={12} height={12} />
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => appWindow.close()}
                    colorScheme={{
                        colorHover: "white",
                        bgColorHover: "var(--danger)",
                    }}
                    aria-label={t("titlebar.close")}
                    square
                >
                    <Icon name="window-close" width={16} height={16} />
                </Button>
            </Flex>
        </header>
    );
};
