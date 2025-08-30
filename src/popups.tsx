import { getRelativeWidth, getRelativeX, getRelativeY } from "./ui";
import { MOD_DATA, ModData } from "./index";
import React, { JSX, ReactNode, useState, useEffect, CSSProperties, FC } from "react";
import ReactDOM from "react-dom/client";
import { create } from "zustand";
import WarningIcon from "./assets/warningIcon.svg";
import ErrorIcon from "./assets/errorIcon.svg";
import InfoIcon from "./assets/infoIcon.svg";
import SuccessIcon from "./assets/successIcon.svg";
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";


interface ToastProps {
    id: string
    title?: string
    message: string
    type: "info" | "warning" | "error" | "success" | "spinner"
    duration: number
    theme?: ModData["singleToastsTheme"]
}

interface DialogProps {
    width: number
    type: "choice_one" | "choice_multiple"
    title?: string
    body: string
    buttons: {
        direction: "row" | "column"
        list: {
            text: string
            value?: unknown
        }[],
    }
    promise: {
        resolve: (data) => void
        reject: (data) => void
    }
}

function ToastsContainer({ children }: { children: ReactNode }): JSX.Element {
    const [toastsContainerStyle, setToastsContainerStyle] = useState<React.CSSProperties>({});
    const clearToasts = window.ZOISCORE.useToastsStore((state) => state.clearToasts);

    useEffect(() => {
        const update = () => {
            setToastsContainerStyle({
                fontFamily: CommonGetFontName(),
                bottom: getRelativeY(5) + "px",
                left: getRelativeX(5) + "px"
            });
        };

        window.addEventListener("resize", update);
        update();

        return () => {
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <div
            className="zcToastsContainer"
            style={toastsContainerStyle}
            onClick={() => {
                document.querySelectorAll('.zcToast').forEach((toast) => {
                    toast.classList.add('exiting');
                });
                setTimeout(clearToasts, 300);
            }}
        >
            {children}
        </div>
    );
}

const ToastIcon: FC<{ type: ToastProps["type"], theme: ToastProps["theme"] }> = ({ type, theme }) => {
    switch (type) {
        case "info":
            return (
                <Info
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        fill: theme ? theme.iconFillColor : "#addbff",
                        stroke: theme ? theme.iconStrokeColor : "#385073"
                    }}
                />
            );
        case "success":
            return (
                <CircleCheck
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        fill: theme ? theme.iconFillColor : "#c3ffc3",
                        stroke: theme ? theme.iconStrokeColor : "#028f74"
                    }}
                />
            );
        case "warning":
            return (
                <CircleAlert
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        fill: theme ? theme.iconFillColor : "#ffdfaf",
                        stroke: theme ? theme.iconStrokeColor : "#9c7633"
                    }}
                />
            );
        case "error":
            return (
                <CircleX
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        fill: theme ? theme.iconFillColor : "#ffb2b2",
                        stroke: theme ? theme.iconStrokeColor : "#7f2828"
                    }}
                />
            );
        case "spinner":
            return (
                <div
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        boxSizing: "border-box",
                        border: "2px solid",
                        borderRadius: "100%",
                        borderColor: `transparent ${theme ? theme.iconFillColor : "rgb(154 154 255)"}`,
                        animation: "zcSpin 0.65s linear infinite"
                    }}
                />
            );
    }
}


function Toast({
    title, message, type, duration, id, theme
}: ToastProps): JSX.Element {
    const [toastStyle, setToastStyle] = useState<React.CSSProperties>({});
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const update = () => {
            const canvasWidth = MainCanvas.canvas.clientWidth;
            const canvasHeight = MainCanvas.canvas.clientHeight;
            const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;

            setToastStyle({
                position: "relative",
                width: "100%",
                borderRadius: "0.1em",
                fontSize: (3 * scaleFactor) + "px",
                padding: (1.5 * scaleFactor) + "px",
                background: theme ? theme.backgroundColor : type === "success" ? "#3ece7e" : type === "warning" ? "#debf72" : type === "error" ? "rgb(212, 46, 107)" : "rgb(80, 80, 223)"
            });
        };

        window.addEventListener("resize", update);
        update();
        const exitingTimer = setTimeout(() => setIsExiting(true), duration);

        return () => {
            clearTimeout(exitingTimer);
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <div className={`zcToast ${isExiting && "exiting"}`} data-zc-toast-type={type} style={toastStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw", position: "relative", zIndex: 5 }}>
                <ToastIcon type={type} theme={theme} />
                <div>
                    {
                        title && message &&
                        <>
                            <p style={{ color: theme ? theme.titleColor : "white" }}>{title}</p>
                            <p
                                style={{
                                    color: theme ? theme.messageColor : (type === "info" || type === "spinner") ? "#b8b8ff" : type === "success" ? "#c7f9c7" : type === "error" ? "#f8bcbc" : "#ffeec5",
                                    fontSize: "70%",
                                    overflowWrap: "anywhere",
                                    marginTop: "0.25em"
                                }}
                            >
                                {message}
                            </p>
                        </>
                    }
                    {
                        ((!title && message) || (title && !message)) &&
                        <p
                            style={{
                                position: "relative",
                                zIndex: 5
                            }}
                        >
                            {title ? title : message}
                        </p>
                    }
                </div>
            </div>
            {
                type !== "spinner" &&
                <div
                    className="zcToast-ProgressBar"
                    style={{
                        animation: `zcToast-progress ${duration}ms linear 0s 1 alternate none`,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        background: theme ? theme.progressBarColor : type === "info" ? "rgb(103, 103, 234)" : type === "success" ? "#34bc71" : type === "warning" ? "#d0af5e" : "rgb(183, 40, 92)"
                    }}
                />
            }
        </div>
    );
}

function Dialog({ dialog }: { dialog: DialogProps }): JSX.Element {
    const clearDialog = window.ZOISCORE.useDialogStore((state) => state.clearDialog);
    const [dialogStyle, setDialogStyle] = useState<CSSProperties>({});
    const [pickedBtns, setPickedBtns] = useState([]);

    useEffect(() => {
        const update = () => {
            const canvasWidth = MainCanvas.canvas.clientWidth;
            const canvasHeight = MainCanvas.canvas.clientHeight;
            const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;

            setDialogStyle({
                width: getRelativeWidth(dialog.width),
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(36, 36, 36, 0.96)",
                zIndex: 20,
                fontFamily: CommonGetFontName(),
                border: "none",
                padding: 2 * scaleFactor
            });
        };

        window.addEventListener("resize", update);
        update();

        return () => {
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <dialog
            open={Object.keys(dialogStyle).length > 0}
            data-zc-dialog-type={dialog.type}
            style={dialogStyle}
        >
            {
                dialog.title &&
                <p
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        fontWeight: "bold",
                        color: "white",
                        fontSize: "clamp(6px, 2vw, 24px)",
                        padding: "0.25em",
                        background: "#2d2d2d",
                        width: "100%"
                    }}
                >
                    {dialog.title}
                </p>
            }
            <p style={{ padding: "1em", marginTop: "2vw", fontSize: "clamp(6px, 2vw, 24px)", color: "white" }}>{dialog.body}</p>
            {
                <div style={{ display: "flex", flexDirection: dialog.buttons.direction, justifyContent: "center", gap: "0.5vw" }}>
                    {
                        dialog.buttons?.list?.map((b, i) => {
                            return (
                                <button
                                    className="zcDialogBtn"
                                    data-zc-picked={pickedBtns.includes(i)}
                                    style={{ width: "100%", position: "relative" }}
                                    onClick={() => {
                                        if (dialog.type === "choice_one") {
                                            clearDialog();
                                            dialog.promise.resolve(b.value);
                                        } else {
                                            if (pickedBtns.includes(i)) setPickedBtns(pickedBtns.filter((a) => a !== i));
                                            else setPickedBtns([...pickedBtns, i]);
                                        }
                                    }}
                                >
                                    {b.text}
                                </button>
                            );
                        })
                    }
                </div>
            }
            {
                dialog.type === "choice_multiple" &&
                <button
                    style={{
                        cursor: "pointer",
                        color: "white",
                        background: "#4d4d4d",
                        border: "none",
                        marginTop: "1vw",
                        fontSize: "clamp(8px,2.5vw,28px)",
                        padding: "0.2em",
                        borderRadius: "4px"
                    }}
                    onClick={() => {
                        clearDialog();
                        dialog.promise.resolve(dialog.buttons.list.filter((b, i) => pickedBtns.includes(i)).map((b) => b.value));
                    }}
                >
                    Confirm
                </button>
            }
        </dialog>
    );
}

class ToastsManager {
    private generateToastId(): string {
        return crypto.randomUUID();;
    }

    private process({ title, message, duration, type, id, theme }: ToastProps): void {
        const { addToast, removeToast } = window.ZOISCORE.useToastsStore.getState();
        addToast({
            id,
            title,
            message,
            duration,
            type,
            theme
        });
        setTimeout(() => removeToast(id), duration + 300);
    }

    info({ title, message, duration }: Omit<ToastProps, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "info", id, theme });
    }

    success({ title, message, duration }: Omit<ToastProps, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "success", id, theme });
    }

    warn({ title, message, duration }: Omit<ToastProps, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "warning", id, theme });
    }

    error({ title, message, duration }: Omit<ToastProps, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "error", id, theme });
    }

    spinner({ title, message }: Omit<ToastProps, "type" | "id" | "duration" | "theme">): string {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration: 1000000, type: "spinner", id, theme });
        return id;
    }

    removeSpinner(id: string): void {
        const { removeToast } = window.ZOISCORE.useToastsStore.getState();
        removeToast(id);
    }
}

class DialogsManager {
    showDialog({ type, title, body, buttons, width }: Omit<DialogProps, "promise">): Promise<unknown> {
        const { setDialog } = window.ZOISCORE.useDialogStore.getState();
        return new Promise((resolve, reject) => {
            setDialog({
                width, type, title, body, buttons, promise: { resolve, reject }
            });
        });
    }
}

function App(): JSX.Element {
    const toasts = window.ZOISCORE.useToastsStore((state) => state.toasts);
    const dialog = window.ZOISCORE.useDialogStore((state) => state.dialog);

    return (
        <>
            <ToastsContainer>
                {
                    toasts.map(({ title, message, type, duration, id, theme }) => {
                        return <Toast id={id} key={id} title={title} message={message} type={type} duration={duration} theme={theme} />;
                    })
                }
            </ToastsContainer>
            {
                dialog && <Dialog dialog={dialog} />
            }
        </>
    );
}

class VirtualDOM extends HTMLElement {
    disconnectedCallback() {
        ServerShowBeep("VirtualDOM was removed, chaos is coming...", 5000, {});
    }
}

export interface ToastsStore {
    toasts: ToastProps[]
    addToast: (toast: ToastProps) => void
    removeToast: (id: string) => void
    clearToasts: () => void
}

export interface DialogStore {
    dialog: DialogProps | null
    setDialog: (props: DialogProps) => void
    clearDialog: () => void
}

export const useToastsStore = create<ToastsStore>((set) => ({
    toasts: [],
    addToast: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
    removeToast: (id) => {
        return set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
    clearToasts: () => set({ toasts: [] })
}));

export const useDialogStore = create<DialogStore>((set) => ({
    dialog: null,
    setDialog: (props: DialogProps) => set({ dialog: props }),
    clearDialog: () => set({ dialog: null })
}));

export function initVirtualDOM(): void {
    customElements.define("zc-virtual-dom", VirtualDOM);
    const virtualDOM = document.createElement("zc-virtual-dom");
    document.body.append(virtualDOM);
    ReactDOM.createRoot(document.getElementsByTagName("zc-virtual-dom")[0]).render(<App />);
}

export const toastsManager = new ToastsManager();
export const dialogsManager = new DialogsManager();
