import React, { useState, useRef, useEffect, useContext } from "react";
import { Rnd } from "react-rnd";
import SelectBaseColor from "./SelectBaseColor";
import "../styles/customizator-redactor.css";
import Header from "../../../layouts/MainLayout/components/Header";
import { toPng } from "html-to-image";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppStateContext } from "../../../App";

function CustomizatorRedactor() {
    const { appState } = useContext(AppStateContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const baseId = searchParams.get("baseId");

    const [baseProduct, setBaseProduct] = useState(null);
    const [baseColor, setBaseColor] = useState("#ffffff");
    const [side, setSide] = useState("front");
    const [images, setImages] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const exportRef = useRef(null);

    // Я проверяю, выбрала ли ты основу. Если нет — пошла вон обратно в каталог.
    useEffect(() => {
        if (!baseId) {
            navigate("/customizator/select-base");
            return;
        }

        fetch(`/api/products/${baseId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.product) {
                    setBaseProduct(data.product);
                }
            })
            .catch((err) => console.error("Ошибка загрузки основы:", err));
    }, [baseId, navigate]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Мой сервер задыхается от мусора. Больше 10 картинок я не пропущу.
        if (images.length >= 10) {
            alert("не больше 10 изображений на один кастом.");
            return;
        }

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
                    file, // Я сохраняю оригинальный файл для FormData
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
        if (!appState.isAuthenticated) {
            navigate("/login");
            return;
        }

        if (!baseId) {
            alert("Отсутствует ID основы.");
            return;
        }

        if (exportRef.current === null) return;

        setIsSaving(true);
        try {
            console.log("Захватываю твой дизайн...");
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

            // Превращаем dataURL скриншота в бинарный Blob
            const resScreenshot = await fetch(dataUrl);
            const blobScreenshot = await resScreenshot.blob();

            // Формируем FormData в точности так, как ждет мой бэкенд
            const formData = new FormData();
            formData.append("baseProductId", baseId);
            formData.append(
                "name",
                `Кастом: ${baseProduct?.name || "Уникальный дизайн"}`,
            );
            formData.append(
                "description",
                `Цвет основы: ${baseColor}. Моё творение.`,
            );
            formData.append("screenshot", blobScreenshot, "screenshot.png");

            // Собираем детали и сами файлы принтов
            const customImagesData = [];
            images.forEach((img) => {
                formData.append("customImages", img.file);
                customImagesData.push({
                    side: img.side,
                    x: img.x,
                    y: img.y,
                    scale: img.scale,
                    rotation: img.rotation,
                });
            });

            // Строго в формате JSON, как я и задумал на сервере
            formData.append(
                "customImagesData",
                JSON.stringify(customImagesData),
            );

            const token = localStorage.getItem("token");
            const response = await fetch("/api/me/customs", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {

                navigate("/profile/customs");
            } else {
                throw new Error(result.message || "Ошибка при сохранении.");
            }
        } catch (err) {
            console.error("Ошибка при создании кастома:", err);
            alert(err.message || "ошиба");
        } finally {
            setIsSaving(false);
        }
    };

    const visibleImages = images.filter((img) => img.side === side);

    const renderClothCanvas = (renderSide, isExport = false) => {
        // Подтягиваем фото основы с бэкенда, если они есть. Иначе берем заглушки.
        let clothImg =
            renderSide === "front" ? "/cloth-front.png" : "/cloth-back.png";
        if (baseProduct) {
            if (renderSide === "front" && baseProduct.frontPhotoUrl)
                clothImg = `/${baseProduct.frontPhotoUrl.replace(/\\/g, "/")}`;
            if (renderSide === "back" && baseProduct.backPhotoUrl)
                clothImg = `/${baseProduct.backPhotoUrl.replace(/\\/g, "/")}`;
        }

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

                    {/* Скрытый холст для правильного захвата скриншота сразу двух сторон */}
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
                    {baseProduct ? (
                        <SelectBaseColor
                            color={baseColor}
                            setColor={setBaseColor}
                            product={baseProduct}
                        />
                    ) : (
                        <p style={{ color: "var(--color-dark-brown)" }}>
                            Загружаю основу. Жди.
                        </p>
                    )}
                    <button
                        className="redactor-save-button"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Сохраняю..." : "Сохранить"}
                    </button>
                </aside>
            </div>
        </>
    );
}

export default CustomizatorRedactor;
