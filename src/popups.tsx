import { getRelativeWidth, getRelativeX, getRelativeY } from "./ui";
import { MOD_DATA } from "./index";
import React, { JSX, ReactNode, useState, useEffect, CSSProperties } from "react";
import ReactDOM from "react-dom/client";
import { create } from "zustand";
import errorWarningIcon from "./assets/errorWarningIcon.svg";
import infoIcon from "@/assets/infoIcon.svg";
import successIcon from "@/assets/successIcon.svg";


interface ToastsStore {
    toasts: ToastProps[]
    addToast: (toast: ToastProps) => void
    removeToast: (id: string) => void
    clearToasts: () => void
}

interface DialogStore {
    dialog: DialogProps | null
    setDialog: (props: DialogProps) => void
    clearDialog: () => void
}

const useToastsStore = create<ToastsStore>((set) => ({
    toasts: [],
    addToast: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
    removeToast: (id) => {
        return set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
    clearToasts: () => set({ toasts: [] })
}));

const useDialogStore = create<DialogStore>((set) => ({
    dialog: null,
    setDialog: (props: DialogProps) => set({ dialog: props }),
    clearDialog: () => set({ dialog: null })
}));


interface ToastProps {
    id: string
    title?: string
    message: string
    type: "info" | "warning" | "error" | "success"
    duration: number
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
    const clearToasts = useToastsStore((state) => state.clearToasts);

    useEffect(() => {
        const update = () => {
            setToastsContainerStyle({
                fontFamily: MOD_DATA.fontFamily ?? "sans-serif",
                top: getRelativeY(5) + "px",
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

function Toast({
    title, message, type, duration, id
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
            <div style={{ display: "flex", gap: "1vw", position: "relative", zIndex: 5 }}>
                <img src={type === "info" ? infoIcon : type === "success" ? successIcon : errorWarningIcon} style={{ width: "2vw", gap: "0.5em" }} />
                <div>
                    {
                        title && message &&
                        <>
                            <p>{title}</p>
                            <p
                                style={
                                    {
                                        color: type === "info" ? "#b8b8ff" : type === "success" ? "#c7f9c7" : type === "error" ? "#f8bcbc" : "#ffeec5",
                                        fontSize: "70%"
                                    }
                                }
                            >
                                {message}
                            </p>
                        </>
                    }
                    {
                        ((!title && message) || (title && !message)) &&
                        <p
                            style={
                                {
                                    position: "relative",
                                    zIndex: 5
                                }
                            }
                        >
                            {title ? title : message}
                        </p>
                    }
                </div>
            </div>
            <div
                className="zcToast-ProgressBar"
                style={
                    {
                        animation: `zcToast-progress ${duration}ms linear 0s 1 alternate none`,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%"
                    }
                }
            />
        </div>
    );
}

function Dialog({ dialog }: { dialog: DialogProps }): JSX.Element {
    const clearDialog = useDialogStore((state) => state.clearDialog);
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
                fontFamily: MOD_DATA.fontFamily ?? "sans-serif",
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
    generateToastId(): string {
        const { toasts } = useToastsStore.getState();
        return `${Date.now()}:${toasts.length + 1}`;
    }

    process({ title, message, duration, type, id }: ToastProps): void {
        const { addToast, removeToast } = useToastsStore.getState();
        addToast({
            id,
            title,
            message,
            duration,
            type
        });
        setTimeout(() => removeToast(id), duration + 300);
    }

    info({ title, message, duration }: Omit<ToastProps, "type" | "id">): void {
        const id = this.generateToastId();
        this.process({ title, message, duration, type: "info", id });
    }

    success({ title, message, duration }: Omit<ToastProps, "type" | "id">): void {
        const id = this.generateToastId();
        this.process({ title, message, duration, type: "success", id });
    }

    warn({ title, message, duration }: Omit<ToastProps, "type" | "id">): void {
        const id = this.generateToastId();
        this.process({ title, message, duration, type: "warning", id });
    }

    error({ title, message, duration }: Omit<ToastProps, "type" | "id">): void {
        const id = this.generateToastId();
        this.process({ title, message, duration, type: "error", id });
    }
}

class DialogsManager {
    showDialog({ type, title, body, buttons, width }: Omit<DialogProps, "promise">): Promise<unknown> {
        const { setDialog } = useDialogStore.getState();
        return new Promise((resolve, reject) => {
            setDialog({
                width, type, title, body, buttons, promise: { resolve, reject }
            });
        });
    }
}

function App(): JSX.Element {
    const toasts = useToastsStore((state) => state.toasts);
    const dialog = useDialogStore((state) => state.dialog);

    return (
        <>
            <ToastsContainer>
                {
                    toasts.map(({ title, message, type, duration, id }) => {
                        return <Toast id={id} key={id} title={title} message={message} type={type} duration={duration} />;
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
        ServerShowBeep("VirtualDOM was removed, chaos is coming...", 4000);
    }
}

export function initVirtualDOM(): void {
    customElements.define("zc-virtual-dom", VirtualDOM);
    const virtualDOM = document.createElement("zc-virtual-dom");
    document.body.append(virtualDOM);
    ReactDOM.createRoot(document.getElementsByTagName("zc-virtual-dom")[0]).render(<App />);
}

export const toastsManager = new ToastsManager();
export const dialogsManager = new DialogsManager();
