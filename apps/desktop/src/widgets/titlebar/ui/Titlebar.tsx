import styles from "./Titlebar.module.scss";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
    Button,
    ChevronLeftIcon,
    ChevronRightIcon,
    CloseIcon,
    Flex,
    Input,
    MaximizeIcon,
    MinimizeIcon,
    MoonIcon,
    SearchIcon,
    SunIcon,
    ZelefyLogo,
} from "@zelefy/ui";
import { useThemeStore } from "@/shared/lib/hooks";
import { useBlurOnOutsideClick } from "../hooks";

export const Titlebar = () => {
    const appWindow = getCurrentWindow();
    const currentTheme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);

    const handleTitlebarMouseDown = useBlurOnOutsideClick();

    return (
        <header
            className={styles.titlebar}
            data-tauri-drag-region
            onMouseDown={handleTitlebarMouseDown}
        >
            <Flex gap="xs" data-tauri-drag-region>
                <div className={styles.logo} data-tauri-drag-region>
                    <div className={styles.logo__} data-tauri-drag-region />
                    <ZelefyLogo width={22} height={22} data-tauri-drag-region />
                    <span data-tauri-drag-region>Zelefy Desktop</span>
                </div>

                <Flex gap="2xs" data-tauri-drag-region>
                    <Button variant="ghost" aria-label="Back" square>
                        <ChevronLeftIcon width={17} height={17} />
                    </Button>

                    <Button variant="ghost" aria-label="Forward" square>
                        <ChevronRightIcon width={17} height={17} />
                    </Button>
                </Flex>
            </Flex>

            <div className={styles.searchWrapper} data-tauri-drag-region>
                <Input placeholder="Поиск..." leftIcon={<SearchIcon width={17} height={17} />} />
            </div>

            <Flex gap="2xs" align="center" className={styles.controls} data-tauri-drag-region>
                <Button
                    variant="ghost"
                    square
                    onClick={toggleTheme}
                    aria-label={
                        currentTheme === "dark"
                            ? "Переключить на светлую тему"
                            : "Переключить на тёмную тему"
                    }
                >
                    {currentTheme === "dark" ? (
                        <SunIcon width={16} height={16} />
                    ) : (
                        <MoonIcon width={16} height={16} />
                    )}
                </Button>

                <div className={styles.divider} data-tauri-drag-region />

                <Button
                    variant="ghost"
                    onClick={() => appWindow.minimize()}
                    aria-label="Minimize"
                    square
                >
                    <MinimizeIcon width={15} height={15} />
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => appWindow.toggleMaximize()}
                    aria-label="Maximize"
                    square
                >
                    <MaximizeIcon width={12} height={12} />
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => appWindow.close()}
                    colorScheme={{
                        colorHover: "white",
                        bgColorHover: "var(--error-500)",
                    }}
                    aria-label="Close"
                    square
                >
                    <CloseIcon width={15} height={15} />
                </Button>
            </Flex>
        </header>
    );
};
