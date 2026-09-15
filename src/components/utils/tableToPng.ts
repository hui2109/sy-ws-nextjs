"use server";

import puppeteer, {type Browser} from "puppeteer";

const PIXEL_RATIO = 10;
const MAX_OUTPUT_PIXELS = 1_500_000_000;

export async function tableToPng(svgDataUrl: string, width: number, height: number): Promise<Uint8Array> {
    if (!svgDataUrl.startsWith("data:image/svg+xml")) throw new Error("SVG 数据无效");

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        throw new Error("图片尺寸无效");
    }

    const outputWidth = Math.ceil(width * PIXEL_RATIO);
    const outputHeight = Math.ceil(height * PIXEL_RATIO);

    if (outputWidth * outputHeight > MAX_OUTPUT_PIXELS) {
        throw new Error(`导出图片尺寸过大: ${outputWidth} × ${outputHeight}`);
    }

    let browser: Browser | undefined;

    try {
        browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();

        await page.setViewport({
            width: Math.ceil(width),
            height: Math.ceil(height),
            deviceScaleFactor: PIXEL_RATIO,
        });

        await page.setContent(`
            <!DOCTYPE html>
            <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        html, body { margin: 0; padding: 0; background: #fff; }
                        #target { display: block; }
                    </style>
                </head>
                <body><img id="target" alt="" src=""></body>
            </html>
        `);

        await page.evaluate(async ({src, imageWidth, imageHeight}) => {
            const image = document.querySelector<HTMLImageElement>("#target");
            if (!image) throw new Error("找不到图片元素");

            image.style.width = `${imageWidth}px`;
            image.style.height = `${imageHeight}px`;

            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () => reject(new Error("SVG 加载失败"));
                image.src = src;

                if (image.complete && image.naturalWidth > 0) resolve();
            });
        }, {
            src: svgDataUrl,
            imageWidth: width,
            imageHeight: height,
        });

        const target = await page.$("#target");
        if (!target) throw new Error("找不到截图目标");

        const png = await target.screenshot({type: "png"});
        if (!png.byteLength) throw new Error("生成的 PNG 文件为空");

        console.log(
            "排班表生成成功:",
            `${outputWidth} × ${outputHeight}`,
            `${(png.byteLength / 1024 / 1024).toFixed(2)} MB`
        );

        return png;
    } catch (error) {
        console.error("生成排班表 PNG 失败:", error);
        throw error;
    } finally {
        await browser?.close();
    }
}
