import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import SelectBaseColor from "./SelectBaseColor";
import "../styles/customizator-redactor.css";
import Header from "../../../layouts/MainLayout/components/Header";
import { toPng } from "html-to-image";

function CustomizatorRedactor() {
    const [baseColor, setBaseColor] = useState("#ffffff");
    const [side, setSide] = useState("front");
    const [images, setImages] = useState([]);

    const exportRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);

        const imgElement = new Image();
        imgElement.src = url;
        imgElement.onload = () => {
            const baseWidth = 150;
            const baseHeight =
                (imgElement.naturalHeight / imgElement.naturalWidth) *
                baseWidth;

            setImages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    url,
                    x: 100,
                    y: 150,
                    baseWidth,
                    baseHeight,
                    scale: 1,
                    rotation: 0,
                    side: side,
                },
            ]);
        };

        event.target.value = null;
    };

    const updateImage = (id, newProps) => {
        setImages(
            images.map((img) =>
                img.id === id ? { ...img, ...newProps } : img,
            ),
        );
    };

    const removeImage = (id) => {
        setImages(images.filter((img) => img.id !== id));
    };

    const handleSave = async () => {
        if (exportRef.current === null) {
            return;
        }

        try {
            console.log("Начинаем захват DOM-элемента...");

            const dataUrl = await toPng(exportRef.current, {
                pixelRatio: 2, 

                filter: (node) => {
                    if (
                        node.tagName === "LINK" &&
                        node.href &&
                        node.href.includes("fonts.googleapis.com")
                    ) {
                        return false;
                    }
                    return true;
                },
            });

            const link = document.createElement("a");
            link.download = "lunemier-design-perfect.png";
            link.href = dataUrl;
            link.click();

            console.log("Сохранение успешно завершено.");
        } catch (err) {
            console.error("Ошибка при создании скриншота:", err);
        }
    };
    const visibleImages = images.filter((img) => img.side === side);

    const renderClothCanvas = (renderSide, isExport = false) => {
        const clothImg =
            renderSide === "front" ? "/cloth-front.png" : "/cloth-back.png";
        const sideImages = images.filter((img) => img.side === renderSide);

        return (
            <div className="canvas-cloth-container">
                <img
                    src={clothImg}
                    className="canvas-cloth-base"
                    alt="cloth-base"
                />

                <div
                    className="canvas-color-tint"
                    style={{
                        backgroundColor: baseColor,
                        maskImage: `url(${clothImg})`,
                        WebkitMaskImage: `url(${clothImg})`,
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                    }}
                ></div>

                <div
                    className="canvas-mask-layer"
                    style={{
                        maskImage: `url(${clothImg})`,
                        WebkitMaskImage: `url(${clothImg})`,
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                    }}
                >
                    {sideImages.map((img) => {
                        const width = img.baseWidth * img.scale;
                        const height = img.baseHeight * img.scale;

                        if (isExport) {
                            return (
                                <div
                                    key={img.id}
                                    style={{
                                        position: "absolute",
                                        left: `${img.x}px`,
                                        top: `${img.y}px`,
                                        width: `${width}px`,
                                        height: `${height}px`,
                                        transform: `rotate(${img.rotation}deg)`,
                                        mixBlendMode: "multiply",
                                    }}
                                >
                                    <img
                                        src={img.url}
                                        alt="print"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                </div>
                            );
                        }

                        return (
                            <Rnd
                                key={img.id}
                                size={{ width, height }}
                                position={{ x: img.x, y: img.y }}
                                onDragStop={(e, d) =>
                                    updateImage(img.id, { x: d.x, y: d.y })
                                }
                                enableResizing={false}
                                bounds="parent"
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        transform: `rotate(${img.rotation}deg)`,
                                        pointerEvents: "none",
                                        mixBlendMode: "multiply",
                                    }}
                                >
                                    <img
                                        src={img.url}
                                        alt="user-print"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                </div>
                            </Rnd>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <Header />
            <div className="redactor-global-container">
                <aside className="redactor-left-panel">
                    <div className="redactor-tabs">
                        <button className="redactor-tab active">Файлы</button>
                    </div>

                    <div className="redactor-actions">
                        <label className="redactor-action-btn">
                            + Изображение
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>

                    <div className="redactor-files-list">
                        {visibleImages.map((img) => (
                            <div key={img.id} className="redactor-file-item">
                                <img
                                    src={img.url}
                                    alt="thumbnail"
                                    className="file-item-thumb"
                                />
                                <div className="file-item-controls">
                                    <span className="file-item-name">
                                        Изображение
                                    </span>

                                    <div className="file-item-sliders">
                                        <label>
                                            <span>Угол: {img.rotation}°</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="360"
                                                value={img.rotation}
                                                onChange={(e) =>
                                                    updateImage(img.id, {
                                                        rotation: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </label>
                                        <label>
                                            <span>
                                                Размер:{" "}
                                                {Math.round(img.scale * 100)}%
                                            </span>
                                            <input
                                                type="range"
                                                min="0.2"
                                                max="3"
                                                step="0.1"
                                                value={img.scale}
                                                onChange={(e) =>
                                                    updateImage(img.id, {
                                                        scale: Number(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </label>
                                    </div>
                                </div>
                                <button
                                    className="file-item-delete"
                                    onClick={() => removeImage(img.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                        {visibleImages.length === 0 && (
                            <p
                                style={{
                                    textAlign: "center",
                                    fontSize: "12px",
                                    color: "#888",
                                    marginTop: "20px",
                                }}
                            >
                                Нет загруженных файлов для этой стороны
                            </p>
                        )}
                    </div>
                </aside>

                <main className="redactor-center-canvas">
                    <div className="redactor-side-switch">
                        <button
                            className={`side-btn ${side === "front" ? "active" : ""}`}
                            onClick={() => setSide("front")}
                        >
                            Спереди
                        </button>
                        <button
                            className={`side-btn ${side === "back" ? "active" : ""}`}
                            onClick={() => setSide("back")}
                        >
                            Сзади
                        </button>
                    </div>

                    {renderClothCanvas(side, false)}

                    <div
                        style={{
                            position: "absolute",
                            left: "-9999px",
                            top: "-9999px",
                        }}
                    >
                        <div
                            ref={exportRef} 
                            style={{
                                width: "900px",
                                height: "600px",
                                backgroundColor: "#fff8ea",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                            }}
                        >
                            <p
                                style={{
                                    position: "absolute",
                                    top: "20px",
                                    left: "225px",
                                    transform: "translateX(-50%)",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    color: "#594545",
                                }}
                            >
                                Вид спереди
                            </p>
                            <p
                                style={{
                                    position: "absolute",
                                    top: "20px",
                                    left: "675px",
                                    transform: "translateX(-50%)",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    color: "#594545",
                                }}
                            >
                                Вид сзади
                            </p>

                            <div style={{ transform: "scale(0.9)" }}>
                                {renderClothCanvas("front", true)}
                            </div>
                            <div style={{ transform: "scale(0.9)" }}>
                                {renderClothCanvas("back", true)}
                            </div>
                        </div>
                    </div>
                </main>

                <aside className="redactor-right-panel">
                    <SelectBaseColor
                        color={baseColor}
                        setColor={setBaseColor}
                    />
                    <button
                        className="redactor-save-button"
                        onClick={handleSave}
                    >
                        Сохранить
                    </button>
                </aside>
            </div>
        </>
    );
}

export default CustomizatorRedactor;
