import { useRef } from "react";
import { continueRender, delayRender, Img } from "remotion";

function containRect(
  containerW: number,
  containerH: number,
  imgW: number,
  imgH: number
) {
    const containerRatio = containerW / containerH;
    const imgRatio = imgW / imgH;

    let width: number;
    let height: number;
    if (imgRatio > containerRatio) {
        width = containerW;
        height = width / imgRatio;
    } else {
        height = containerH;
        width = height * imgRatio;
    }

    const left = (containerW - width) / 2;
    const top = (containerH - height) / 2;
    return { width, height, left, top };
}

// Position the red box to the rendered image box (no hooks).
function syncBgToImageBox(
  imgEl: HTMLImageElement,
  wrapperEl: HTMLDivElement | null,
  bgEl: HTMLDivElement | null
) {
    if (!wrapperEl || !bgEl) return;
    const cw = wrapperEl.clientWidth;
    const ch = wrapperEl.clientHeight;
    const iw = imgEl.naturalWidth;
    const ih = imgEl.naturalHeight;
    if (!cw || !ch || !iw || !ih) return;

    const { width, height, left, top } = containRect(cw, ch, iw, ih);
    Object.assign(bgEl.style, {
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        display: "block",
    });
}


export const ImageWithBackground: React.FC<{ src: string }> = ({ src }) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const bgRef = useRef<HTMLDivElement | null>(null);
    const delayedRender = delayRender('image-with-background')

    return (
        <div
            className="relative w-full h-full"
            ref={wrapperRef}
        >
            <div
                className="bg-slate-50 rounded-2xl"
                style={{ display: "none" }}
                ref={bgRef}
            />

            <Img
                src={src}
                className="absolute inset-0 w-full h-full object-contain rounded-2xl"
                decoding="async"
                onLoad={(e) => {
                    syncBgToImageBox(e.currentTarget, wrapperRef.current, bgRef.current);
                    continueRender(delayedRender)
                }}
            />
        </div>
    );
};
