import { useEffect, useRef } from "react";

export default function useStrictTestMonitoring({
    testMode,
    onViolation,
    disabled
}) {
    const skipCheck = useRef(false);

    // Ignore strict checks temporarily during internal navigation
    const pauseChecking = () => {
        skipCheck.current = true;
        setTimeout(() => {
            skipCheck.current = false;
        }, 300);
    };

    useEffect(() => {
        if (testMode !== "Attempt") return;

        const safe = () => !skipCheck.current && !disabled;

        const onBlur = () => {
            if (safe()) onViolation("TAB_CHANGE");
        };

        const onHidden = () => {
            if (safe() && document.hidden) onViolation("TAB_HIDDEN");
        };

        const onResize = () => {
            if (safe() && (window.innerWidth < 900 || window.innerHeight < 600)) {
                onViolation("WINDOW_RESIZED");
            }
        };

        const onFS = () => safe() && onViolation("FULLSCREEN_EXIT");

        const onRightClick = (e) => {
            if (safe()) {
                e.preventDefault();
                onViolation("RIGHT_CLICK_BLOCKED");
            }
        };

        const onKeyInspect = (e) => {
            if (
                safe() &&
                (e.key === "F12" ||
                    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
                    (e.ctrlKey && e.key === "U"))
            ) {
                e.preventDefault();
                onViolation("INSPECT_BLOCKED");
            }
        };

        window.addEventListener("blur", onBlur);
        document.addEventListener("visibilitychange", onHidden);
        window.addEventListener("resize", onResize);
        document.addEventListener("fullscreenchange", onFS);
        document.addEventListener("contextmenu", onRightClick);
        window.addEventListener("keydown", onKeyInspect);

        return () => {
            window.removeEventListener("blur", onBlur);
            document.removeEventListener("visibilitychange", onHidden);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("fullscreenchange", onFS);
            document.removeEventListener("contextmenu", onRightClick);
            window.removeEventListener("keydown", onKeyInspect);
        };
    }, [testMode, disabled]);

    return { pauseChecking };
}
