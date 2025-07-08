import { getThemedColorsModule, MOD_DATA } from "./index";

type Anchor = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface CreateButtonArgs {
    text?: string
    x?: number
    y?: number
    fontSize?: number | "auto"
    width?: number
    height?: number
    padding?: number
    style?: "default" | "green" | "inverted"
    anchor?: Anchor
    place?: boolean
    icon?: string
    iconAbsolutePosition?: boolean
    iconWidth?: string
    tooltip?: {
        text: string
        position: "left" | "right"
    }
    onClick?: () => void
    isDisabled?: () => boolean
}

interface CreateTextArgs {
    text?: string
    color?: string
    x?: number
    y?: number
    fontSize?: number | "auto"
    withBackground?: boolean
    width?: number
    height?: number
    padding?: number
    anchor?: Anchor
    place?: boolean
}

interface CreateInputArgs {
    value?: string
    placeholder?: string
    x?: number
    y?: number
    width: number
    height?: number
    textArea?: boolean
    fontSize?: number | "auto"
    anchor?: Anchor
    padding?: number
    place?: boolean
    onChange?: () => void
    onInput?: () => void
    isDisabled?: () => boolean
}

interface CreateCheckboxArgs {
    isChecked: boolean
    x?: number
    y?: number
    width?: number
    text: string
    anchor?: Anchor
    place?: boolean
    onChange?: () => void
    isDisabled?: () => boolean
}

interface CreateScrollViewArgs {
    scroll: "x" | "y" | "all"
    x: number
    y: number
    width: number,
    height?: number
    anchor?: Anchor
}

interface CreateInputListArgs {
    value?: string[] | number[]
    title?: string
    x?: number
    y?: number
    width: number
    height?: number
    fontSize?: number | "auto"
    anchor?: Anchor
    padding?: number
    place?: boolean
    numbersOnly?: boolean
    onChange?: (value: string[] | number[]) => void
    isDisabled?: () => boolean
}

interface CreateImageArgs {
    src: string
    x: number
    y: number
    width: number
    anchor?: Anchor
    place?: boolean
}

interface CreateBackNextButtonArgs {
    x: number
    y: number
    width: number
    height: number
    items: [string, any?][]
    currentIndex: number
    isBold?: boolean
    anchor?: Anchor
    place?: boolean
    onChange?: (value: any) => void
    isDisabled?: (value: any) => boolean
}

interface CreateTabArgs {
    x: number
    y: number
    width: number
    tabs: {
        name: string
        load?: () => void
        unload?: () => void
        run?: () => void
        exit?: () => void
    }[]
    currentTabName: string
    anchor?: Anchor
}

interface DrawPolylineArrowArgs {
    points: {
        x: number
        y: number
    }[]
    strokeColor?: string
    lineWidth?: number
    circleRadius?: number
    circleColor?: string
}

export function getRelativeHeight(height: number) {
    return height * (MainCanvas.canvas.clientHeight / 1000);
}

export function getRelativeWidth(width: number) {
    return width * (MainCanvas.canvas.clientWidth / 2000);
}

export function getRelativeY(yPos: number, anchorPosition: 'top' | 'bottom' = 'top') {
    const scaleY = MainCanvas.canvas.clientHeight / 1000;
    return anchorPosition === 'top'
        ? MainCanvas.canvas.offsetTop + yPos * scaleY
        : window.innerHeight - (MainCanvas.canvas.offsetTop + MainCanvas.canvas.clientHeight) + yPos * scaleY;
}

export function getRelativeX(xPos: number, anchorPosition: 'left' | 'right' = 'left') {
    const scaleX = MainCanvas.canvas.clientWidth / 2000;
    return anchorPosition === 'left'
        ? MainCanvas.canvas.offsetLeft + xPos * scaleX
        : window.innerWidth - (MainCanvas.canvas.offsetLeft + MainCanvas.canvas.clientWidth) + xPos * scaleX;
}


export function setPosition(element: HTMLElement, xPos: number, yPos: number, anchor: Anchor = "top-left") {
    const yAnchor = anchor === 'top-left' || anchor === 'top-right' ? 'top' : 'bottom';
    const xAnchor = anchor === 'top-left' || anchor === 'bottom-left' ? 'left' : 'right';

    const y = getRelativeY(yPos, yAnchor);
    const x = getRelativeX(xPos, xAnchor);

    Object.assign(element.style, {
        position: 'fixed',
        [xAnchor]: x + 'px',
        [yAnchor]: y + 'px',
    });
}

export function setSize(element: HTMLElement, width: number, height: number) {
    Object.assign(element.style, {
        width: getRelativeWidth(width) + 'px',
        height: getRelativeHeight(height) + 'px',
    });
}

export function setFontSize(element: HTMLElement, targetFontSize: number) {
    const canvasWidth = MainCanvas.canvas.clientWidth;
    const canvasHeight = MainCanvas.canvas.clientHeight;

    const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;

    const fontSize = targetFontSize * scaleFactor;

    Object.assign(element.style, {
        fontSize: fontSize + 'px'
    });
}

export function setFontFamily(element: HTMLElement, fontFamily?: string) {
    element.style.fontFamily = fontFamily ?? "sans-serif";
}

export function setPadding(element: HTMLElement, targetPadding: number) {
    const canvasWidth = MainCanvas.canvas.clientWidth;
    const canvasHeight = MainCanvas.canvas.clientHeight;

    const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;

    const paddingValue = targetPadding * scaleFactor;

    Object.assign(element.style, {
        padding: paddingValue + 'px',
    });
}

export function autosetFontSize(element: HTMLElement) {
    const Font = MainCanvas.canvas.clientWidth <= MainCanvas.canvas.clientHeight * 2 ? MainCanvas.canvas.clientWidth / 50 : MainCanvas.canvas.clientHeight / 25;

    Object.assign(element.style, {
        fontSize: Font + 'px'
    });
}

export function setPreviousSubscreen(): void {
    setSubscreen(previousSubscreen);
}

export function setSubscreen(subscreen: BaseSubscreen | null): void {
    previousSubscreen = currentSubscreen;
    currentSubscreen = subscreen;
    if (currentSubscreen) currentSubscreen.load();
    if (previousSubscreen) previousSubscreen.unload();
}

export function getCurrentSubscreen(): BaseSubscreen {
    return currentSubscreen;
}

let currentSubscreen: BaseSubscreen | null;
let previousSubscreen: BaseSubscreen | null = null;


export abstract class BaseSubscreen {
    private htmlElements: HTMLElement[] = [];
    private resizeEventListeners: EventListener[] = [];
    private tabHandlers: Omit<CreateTabArgs["tabs"][0], "name"> = {};

    get currentSubscreen(): BaseSubscreen | null {
        return currentSubscreen;
    }

    get previousSubscreen(): BaseSubscreen | null {
        return previousSubscreen;
    }

    get name(): string {
        return "";
    }

    run?() {
        this.tabHandlers.run?.();
    }
    load?() {
        this.createButton({
            x: 1815,
            y: 75,
            width: 90,
            height: 90,
            icon: "Icons/Exit.png"
        }).addEventListener("click", () => this.exit());
        if (this.name) {
            this.createText({
                text: this.name,
                x: 100,
                y: 60,
                fontSize: 10
            }).style.cssText += "max-width: 85%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
        }
        if (subscreenHooks[this.name]) {
            subscreenHooks[this.name].forEach((hook) => hook(this));
        }
    }
    unload?() {
        this.tabHandlers.unload?.();
        this.htmlElements.forEach((e) => {
            e.remove();
        });
        this.resizeEventListeners.forEach((e) => {
            removeEventListener("resize", e);
        });
    }
    click?() { }
    exit?() {
        this.tabHandlers.exit?.();
        this.setSubscreen(this.previousSubscreen);
    }
    update?() { }
    setPreviousSubscreen() {
        setPreviousSubscreen();
    }
    setSubscreen(subscreen: BaseSubscreen | null) {
        setSubscreen(subscreen);
    }

    createButton({
        text, x, y, width, height, fontSize = "auto",
        anchor = "top-left", padding, style = "default",
        place = true, icon, iconAbsolutePosition = true,
        iconWidth, tooltip, onClick, isDisabled
    }: CreateButtonArgs): HTMLButtonElement {
        const btn = document.createElement("button");
        btn.classList.add("zcButton");
        btn.setAttribute("data-zc-style", style);
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.columnGap = "1.25vw";
        setFontFamily(btn, MOD_DATA.fontFamily);

        if (icon) {
            const img = document.createElement("img");
            img.src = icon;
            if (iconWidth) img.style.width = iconWidth;
            else img.style.height = "80%";
            if (text && iconAbsolutePosition) {
                img.style.position = "absolute";
                img.style.left = "1vw";
            }
            if (text && !iconAbsolutePosition) btn.style.justifyContent = "";
            btn.append(img);
        }

        if (text) {
            const span = document.createElement("span");
            span.textContent = text;
            if (icon && !iconAbsolutePosition && iconWidth) {
                span.style.width = "100%";
                span.style.marginRight = iconWidth;
            }
            btn.append(span);
        }

        if (tooltip) {
            const tooltipEl = document.createElement("span");
            tooltipEl.classList.add("tooltip");
            tooltipEl.setAttribute("position", tooltip.position);
            tooltipEl.textContent = tooltip.text;
            btn.append(tooltipEl);
        }

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(btn, x, y, anchor);
            setSize(btn, width, height);
            if (padding) setPadding(btn, padding);
            if (fontSize === "auto") autosetFontSize(btn);
            else setFontSize(btn, fontSize);
        }

        setProperties();
        if (typeof isDisabled === "function" && isDisabled()) btn.classList.add("zcDisabled");
        btn.addEventListener("click", () => {
            if (typeof isDisabled === "function" && isDisabled()) return btn.classList.add("zcDisabled");
            if (typeof onClick === "function") onClick();
        });
        window.addEventListener("resize", setProperties);
        if (place) document.body.append(btn);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(btn);
        return btn;
    }

    createText({
        text, color, x, y, width, height, withBackground = false,
        fontSize = "auto", anchor = "top-left", padding, place = true
    }: CreateTextArgs): HTMLParagraphElement {
        const p = document.createElement("p");
        p.innerHTML = text;
        p.style.color = color ?? "var(--tmd-text, black)";
        if (withBackground) p.style.background = "var(--tmd-element,rgb(239, 239, 239))";
        setFontFamily(p, MOD_DATA.fontFamily);

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(p, x, y, anchor);
            setSize(p, width, height);
            if (padding) setPadding(p, padding);
            if (fontSize === "auto") autosetFontSize(p);
            else setFontSize(p, fontSize);
        }

        setProperties();
        window.addEventListener("resize", setProperties);
        if (place) document.body.append(p);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(p);
        return p;
    }

    createInput({
        value, placeholder, x, y, width, height, textArea = false,
        fontSize = "auto", anchor = "top-left", padding, place = true,
        onChange, onInput, isDisabled
    }: CreateInputArgs): HTMLInputElement | HTMLTextAreaElement {
        const input = document.createElement(textArea ? "textarea" : "input");
        input.classList.add("zcInput");
        if (placeholder) input.placeholder = placeholder;
        if (value) input.value = value;
        setFontFamily(input, MOD_DATA.fontFamily);

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(input, x, y, anchor);
            setSize(input, width, height);
            if (padding) setPadding(input, padding);
            if (fontSize === "auto") autosetFontSize(input);
            else setFontSize(input, fontSize);
        }

        setProperties();
        if (typeof isDisabled === "function" && isDisabled()) input.classList.add("zcDisabled");
        input.addEventListener("change", () => {
            if (typeof isDisabled === "function" && isDisabled()) return input.classList.add("zcDisabled");
            if (typeof onChange === "function") onChange();
        });
        input.addEventListener("input", () => {
            if (typeof isDisabled === "function" && isDisabled()) return input.classList.add("zcDisabled");
            if (typeof onInput === "function") onInput();
        });
        window.addEventListener("resize", setProperties);
        if (place) document.body.append(input);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(input);
        return input;
    }

    createCheckbox({
        text, x, y, isChecked, width,
        anchor = "top-left", place = true,
        isDisabled, onChange
    }: CreateCheckboxArgs): HTMLDivElement {
        const checkbox = document.createElement("div");
        checkbox.style.display = "flex";
        checkbox.style.alignItems = "center";
        checkbox.style.columnGap = "1vw";

        const input = document.createElement("input");
        input.type = "checkbox"
        input.checked = isChecked;
        input.style.borderRadius = "min(0.8dvh, 0.3dvw)";
        input.classList.add("zcCheckbox", "checkbox");

        const p = document.createElement("p");
        p.textContent = text;
        p.style.color = "var(--tmd-text, black)";
        setFontFamily(p, MOD_DATA.fontFamily);

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(checkbox, x, y, anchor);
            if (width) checkbox.style.width = getRelativeWidth(width) + "px";
            setFontSize(p, 5);
        }

        setProperties();
        if (typeof isDisabled === "function" && isDisabled()) checkbox.classList.add("zcDisabled");
        checkbox.addEventListener("change", () => {
            if (typeof isDisabled === "function" && isDisabled()) return checkbox.classList.add("zcDisabled");
            if (typeof onChange === "function") onChange();
        });
        window.addEventListener("resize", setProperties);
        checkbox.append(input, p);
        if (place) document.body.append(checkbox);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(checkbox, p);
        return checkbox;
    }

    createScrollView({
        scroll, x, y, width, height,
        anchor = "top-left"
    }: CreateScrollViewArgs): HTMLDivElement {
        const div = document.createElement("div");
        if (scroll === "all") div.style.overflow = "scroll";
        if (scroll === "x") div.style.overflowX = "scroll";
        if (scroll === "y") div.style.overflowY = "scroll";

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(div, x, y, anchor);
            setSize(div, width, height);
        }

        setProperties();
        window.addEventListener("resize", setProperties);
        document.body.append(div);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(div);
        return div;
    }

    createInputList({
        x, y, width, height, title, value,
        anchor = "top-left", place = true, numbersOnly = false,
        isDisabled, onChange
    }: CreateInputListArgs): HTMLDivElement {
        const items = [];
        const div = document.createElement("div");
        div.style.cssText = `
        display: flex; flex-direction: column; gap: 1vw; border: 2px solid var(--tmd-accent, black);
        border-radius: 4px; padding: 0.75vw; background: var(--tmd-element, none);
        `;
        setFontFamily(div, MOD_DATA.fontFamily);

        const buttonsElement = document.createElement("div");
        buttonsElement.style.cssText = "display: flex; justify-content: center; column-gap: 1vw; width: 100%;";

        const titleElement = document.createElement("b");
        titleElement.textContent = title + ":";
        titleElement.style.cssText = "width: 100%; font-size: clamp(10px, 2.4vw, 24px); color: var(--tmd-text, black);";

        const itemsElement = document.createElement("div");
        itemsElement.style.cssText = `display: flex; gap: 1vw; flex-wrap: wrap; align-content: flex-start;
        overflow-y: scroll;`;

        const input = document.createElement("input");
        input.style.cssText = "border: none; outline: none; background: none; height: fit-content; flex-grow: 1; padding: 0.8vw; width: 6vw; font-size: clamp(8px, 2vw, 20px);";

        const addButton = (icon: string, onClick: () => void) => {
            const b = document.createElement("button");
            b.style.cssText = "cursor: pointer; display: grid; place-items: center; background: var(--tmd-element-hover, #e0e0e0); width: 10%; max-width: 40px; aspect-ratio: 1/1; border-radius: 8px; border: none;";
            const img = DrawGetImage(icon);
            img.style.cssText = "width: 90%;";
            b.append(img);
            buttonsElement.append(b);
            b.addEventListener("click", onClick);
        }

        const addItem = (text: string) => {
            const item = document.createElement("div");
            item.style.cssText = "cursor: pointer; background: var(--tmd-element-hover, rgb(206, 206, 206)); color: var(--tmd-text, black); height: fit-content; padding: 0.8vw; border-radius: 0.8vw; font-size: clamp(8px, 2vw, 20px);";
            item.textContent = text;
            itemsElement.insertBefore(item, input);
            item.addEventListener("click", (e) => {
                if (item.style.border === "") item.style.border = "2px solid red";
                else item.style.border = "";
                e.stopPropagation();
            });
            items.push(text);
        }

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(div, x, y, anchor);
            setSize(div, width, height);
        }

        addButton("Icons/Cancel.png", () => {
            if (typeof isDisabled === "function" && isDisabled()) return div.classList.add("zcDisabled");
            itemsElement.innerHTML = "";
            items.splice(0, items.length);
            itemsElement.append(input);
            value.forEach((v) => addItem(String(v)));
            if (typeof onChange === "function") onChange(numbersOnly ? items.map((i) => parseInt(i)) : items);
        });
        addButton("Icons/Trash.png", () => {
            if (typeof isDisabled === "function" && isDisabled()) return div.classList.add("zcDisabled");
            for (const c of [...itemsElement.children]) {
                if (c.getAttribute("style").includes("border: 2px solid red;")) {
                    items.splice(items.indexOf(c.textContent), 1);
                    c.remove();
                }
            }
            if (typeof onChange === "function") onChange(numbersOnly ? items.map((i) => parseInt(i)) : items);
        });
        setProperties();
        if (typeof isDisabled === "function" && isDisabled()) div.classList.add("zcDisabled");
        window.addEventListener("resize", setProperties);
        input.addEventListener("keypress", (e) => {
            if (document.activeElement === input) {
                switch (e.key) {
                    case "Enter":
                        if (numbersOnly && Number.isNaN(parseInt(input.value))) return;
                        if (input.value.trim() === "") return;
                        if (
                            typeof isDisabled === "function" &&
                            isDisabled()
                        ) return div.classList.add("zcDisabled");
                        addItem(input.value);
                        input.value = "";
                        if (typeof onChange === "function") onChange(numbersOnly ? items.map((i) => parseInt(i)) : items);
                        break;
                }
            }
        });
        div.addEventListener("click", (e) => { if (e.currentTarget == div) input.focus() });
        itemsElement.append(input);
        div.append(buttonsElement, titleElement, itemsElement);
        if (place) document.body.append(div);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(div);
        value.forEach((v) => addItem(String(v)));
        return div;
    }

    createImage({
        x, y, width, src, place = true, anchor = "top-left"
    }: CreateImageArgs): HTMLImageElement {
        const img = document.createElement("img");
        img.src = src;

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(img, x, y, anchor);
            setSize(img, width, 0);
            img.style.height = "auto";
        }

        setProperties();
        window.addEventListener("resize", setProperties);
        if (place) document.body.append(img);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(img);
        return img;
    }

    createBackNextButton({
        x, y, width, height, items, currentIndex,
        isBold = false, anchor = "top-left", place = true,
        onChange, isDisabled
    }: CreateBackNextButtonArgs): HTMLDivElement {
        const div = document.createElement("div");
        div.classList.add("zcBackNextButton");
        setFontFamily(div, MOD_DATA.fontFamily);

        const updateClasses = () => {
            if (
                currentIndex === 0 ||
                (
                    typeof isDisabled === "function" && isDisabled(items[currentIndex - 1][1])
                )
            ) backBtn.classList.add("zcBackNextButton-btnDisabled");
            else backBtn.classList.remove("zcBackNextButton-btnDisabled");
            if (
                currentIndex === items.length - 1 ||
                (
                    typeof isDisabled === "function" && isDisabled(items[currentIndex + 1][1])
                )
            ) nextBtn.classList.add("zcBackNextButton-btnDisabled");
            else nextBtn.classList.remove("zcBackNextButton-btnDisabled");
        }

        const backBtn = document.createElement("button");
        backBtn.style.cssText = `
        position: absolute; left: 1vw; font-size: 3.5vw; aspect-ratio: 1/1;
        height: 140%; background-image: url("Icons/Prev.png"); background-size: 100%;
        `;
        backBtn.classList.add("zcButton");
        backBtn.addEventListener("click", () => {
            if (currentIndex === 0) return backBtn.classList.add("zcDisabled");
            if (typeof isDisabled === "function" && isDisabled(items[currentIndex - 1][1])) return backBtn.classList.add("zcDisabled");
            currentIndex--;
            text.textContent = items[currentIndex][0];
            if (typeof onChange === "function") onChange(items[currentIndex][1]);
            updateClasses();
        });

        const nextBtn = document.createElement("button");
        nextBtn.style.cssText = `
        position: absolute; right: 1vw; font-size: 3.5vw; aspect-ratio: 1/1;
        height: 140%; background-image: url("Icons/Next.png"); background-size: 100%;
        `;
        nextBtn.classList.add("zcButton");
        nextBtn.addEventListener("click", () => {
            if (currentIndex === items.length - 1) return nextBtn.classList.add("zcDisabled");
            if (typeof isDisabled === "function" && isDisabled(items[currentIndex + 1][1])) return nextBtn.classList.add("zcDisabled");
            currentIndex++;
            text.textContent = items[currentIndex][0];
            if (typeof onChange === "function") onChange(items[currentIndex][1]);
            updateClasses();
        });

        updateClasses();

        const text = document.createElement("p");
        if (isBold) text.style.fontWeight = "bold";
        text.textContent = items[currentIndex][0];

        div.append(backBtn, text, nextBtn);

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(div, x, y, anchor);
            setSize(div, width, height);
            autosetFontSize(text);
        }

        setProperties();
        window.addEventListener("resize", setProperties);
        if (place) document.body.append(div);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(div);
        return div;
    }

    createTabs({
        x, y, width, tabs, anchor = "top-left", currentTabName
    }: CreateTabArgs): HTMLDivElement {
        let tabElements: (Node | string)[] = [];

        const tabsEl = document.createElement("div");
        tabsEl.classList.add("zcTabs");
        setFontFamily(tabsEl, MOD_DATA.fontFamily);

        tabs.forEach((tab) => {
            const switchTab = () => {
                for (const c of tabsEl.children) {
                    c.removeAttribute("data-opened");
                }
                for (const c of tabElements) {
                    if (c instanceof Node) document.body.removeChild(c);
                }
                tabElements = [];
                tabEl.setAttribute("data-opened", "true");
                const originalAppend = document.body.append.bind(document.body);
                document.body.append = (...nodes: (Node | string)[]) => {
                    tabElements.push(...nodes);
                    originalAppend(...nodes);
                };
                this.tabHandlers.unload?.();
                this.tabHandlers.exit?.();
                tab.load();
                this.tabHandlers = {
                    run: tab.run,
                    load: tab.load,
                    unload: tab.unload,
                    exit: tab.exit
                };
                document.body.append = originalAppend;
            };
            const tabEl = document.createElement("button");
            tabEl.textContent = tab.name;
            if (tab.name === currentTabName) switchTab();
            tabEl.addEventListener("click", switchTab);
            tabsEl.append(tabEl);
        });

        const setProperties = () => {
            if (typeof x === "number" && typeof y === "number") setPosition(tabsEl, x, y, anchor);
            if (width) tabsEl.style.width = getRelativeWidth(width) + "px";
            autosetFontSize(tabsEl);
        }

        setProperties();
        window.addEventListener("resize", setProperties);
        document.body.append(tabsEl);
        this.resizeEventListeners.push(setProperties);
        this.htmlElements.push(tabsEl);
        return tabsEl;
    }

    drawPolylineArrow({
        points, strokeColor = getThemedColorsModule()?.base?.text ?? "black", lineWidth = 2,
        circleRadius = 5, circleColor = getThemedColorsModule()?.base?.text ?? "black"
    }: DrawPolylineArrowArgs): void {
        if (points.length < 2) return;

        const ctx = MainCanvas.canvas.getContext("2d");
        ctx.save();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.fillStyle = circleColor;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, circleRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(points[points.length - 1].x, points[points.length - 1].y, circleRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

const subscreenHooks: Record<string, ((subscreen: BaseSubscreen) => void)[]> = {};

export function hookSubscreen(subscreenName: string, hook: (subscreen: BaseSubscreen) => void) {
    if (!subscreenHooks[subscreenName]) subscreenHooks[subscreenName] = [];
    subscreenHooks[subscreenName].push(hook);
}