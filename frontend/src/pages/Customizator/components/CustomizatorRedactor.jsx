import React, { useState, useRef, useEffect, useContext } from "react";
import { Rnd } from "react-rnd";
import SelectBaseColor from "./SelectBaseColor";
import "../styles/customizator-redactor.css";
import Header from "../../../layouts/MainLayout/components/Header";
import { toPng } from "html-to-image";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext"; // Добавили наш контекст!

function CustomizatorRedactor() {
    const { appState } = useContext(AppStateContext);
    const { products, setProducts } = useContext(GlobalContext); // Достаем базу продуктов
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const baseId = searchParams.get("baseId");

    const [baseProduct, setBaseProduct] = useState(null);
    const [baseColor, setBaseColor] = useState("#ffffff");
    const [side, setSide] = useState("front");
    const [images, setImages] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Стейты для временных ссылок на Blob-файлы одежды
    const [frontBgUrl, setFrontBgUrl] = useState("/cloth-front.png");
    const [backBgUrl, setBackBgUrl] = useState("/cloth-back.png");

    const exportRef = useRef(null);

    // === 1. ЗАГРУЗКА ОСНОВЫ ИЗ ИНДЕКСА ===
    useEffect(() => {
        if (!products) return; // Ждем, пока IndexedDB отдаст данные

        if (!baseId) {
            navigate("/customizator/select-base");
            return;
        }

        // Ищем основу в нашей локальной базе
        const foundBase = products.find((p) => p._id === Number(baseId));
        if (foundBase) {
            setBaseProduct(foundBase);
        } else {
            console.error("Основа не найдена в базе!");
            navigate("/customizator/select-base");
        }
    }, [baseId, products, navigate]);

    // === 2. ГЕНЕРАЦИЯ ССЫЛОК ДЛЯ ФАЙЛОВ ОДЕЖДЫ ===
    useEffect(() => {
        let fUrl = null;
        let bUrl = null;

        if (baseProduct) {
            if (baseProduct.front_photo_url) {
                fUrl = URL.createObjectURL(baseProduct.front_photo_url);
                setFrontBgUrl(fUrl);
            }
            if (baseProduct.back_photo_url) {
                bUrl = URL.createObjectURL(baseProduct.back_photo_url);
                setBackBgUrl(bUrl);
            }
        }

        // Жесткая очистка памяти при выходе
        return () => {
            if (fUrl) URL.revokeObjectURL(fUrl);
            if (bUrl) URL.revokeObjectURL(bUrl);
        };
    }, [baseProduct]);

    // === 3. ЗАГРУЗКА КАРТИНОК ПОЛЬЗОВАТЕЛЯ ===
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (images.length >= 10) {
            alert("Не больше 10 изображений на один кастом. Я не резиновый.");
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
                    file,
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
        // Очищаем память от удаленной картинки
        const imgToRemove = images.find((img) => img.id === id);
        if (imgToRemove) URL.revokeObjectURL(imgToRemove.url);

        setImages(images.filter((img) => img.id !== id));
    };

    // === 4. СОХРАНЕНИЕ КАСТОМА В БАЗУ ===
    const handleSave = async () => {
        const userId = Number(localStorage.getItem("user_id"));
        if (!userId) {
            navigate("/login");
            return;
        }

        if (!baseProduct) {
            alert("Отсутствует основа.");
            return;
        }

        if (exportRef.current === null) return;

        setIsSaving(true);
        try {
            console.log("Захватываю твой дизайн...");

            // 1. Делаем скриншот
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

            // 2. Превращаем скриншот (Base64) в настоящий файл (Blob)
            const resScreenshot = await fetch(dataUrl);
            const blobScreenshot = await resScreenshot.blob();

            // 3. Формируем новый объект продукта по нашей схеме
            const newCustomProduct = {
                _id: Date.now(), // Генерируем уникальный ID
                name: `Кастом: ${baseProduct.name}`,
                description: `Цвет основы: ${baseColor}. Моё творение.`,
                base_product_id: baseProduct._id,
                size_id: baseProduct.size_id,
                category_id: baseProduct.category_id,
                supplier_id: baseProduct.supplier_id,
                is_custom: true, // Это кастом!
                is_base: false, // Это больше не основа!
                user_id: userId, // Привязываем к текущему юзеру
                front_photo_url: null, // Главная картинка - это наш скриншот-Blob
                back_photo_url: null,
                created_at: new Date().toISOString(),
                updated_at: null,
                deleted_at: null,
                prices: baseProduct.prices, // Наследуем цену основы
                photos: [{ file_path: blobScreenshot }], // Обычных фоток нет

                // 4. Формируем массив кастомных фоток (в точности как ты описывала)
                custom_photos: images.map((img) => ({
                    file_path: img.file, // Настоящий Blob-файл, который загрузил юзер
                    details: {
                        side: img.side,
                        x: img.x,
                        y: img.y,
                        scale: img.scale,
                        rotation: img.rotation,
                    },
                })),
            };

            // 5. Жестко перезаписываем стейт продуктов (а useEffect в Context сохранит это в IndexedDB)
            setProducts((prev) => [...prev, newCustomProduct]);

            alert("Кастом успешно сохранен в базе.");
            navigate("/profile/customs");
        } catch (err) {
            console.error("Ошибка при создании кастома:", err);
            alert("Произошла ошибка. Читай консоль.");
        } finally {
            setIsSaving(false);
        }
    };

    const visibleImages = images.filter((img) => img.side === side);

    // === 5. РЕНДЕР ХОЛСТА ===
    const renderClothCanvas = (renderSide, isExport = false) => {
        // Берем подготовленные временные ссылки
        const clothImg = renderSide === "front" ? frontBgUrl : backBgUrl;
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
