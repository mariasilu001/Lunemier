import React, { useState, useEffect, useContext } from "react";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext"; // Наша база данных
import { useNavigate } from "react-router-dom";
import "../styles/profile-customs-styles.css";

// === ОТДЕЛЬНЫЙ КОМПОНЕНТ КАРТОЧКИ (ДЛЯ ЗАЩИТЫ ПАМЯТИ) ===
function ProfileCustomCard({ item, baseProduct, onAddToCart, onDelete }) {
    // Локальные стейты для временных ссылок на Blob-файлы
    const [resultImage, setResultImage] = useState(
        "/lunemier-design-perfect.png",
    );
    const [baseImage, setBaseImage] = useState("/cloth-front.png");
    const [printImages, setPrintImages] = useState([]);

    useEffect(() => {
        const urlsToRevoke = [];

        // 1. Генерируем ссылку для основы (front_photo_url базового товара)
        if (baseProduct && baseProduct.front_photo_url) {
            const url = URL.createObjectURL(baseProduct.front_photo_url);
            setBaseImage(url);
            urlsToRevoke.push(url);
        }

        // 2. Генерируем ссылку для результата (front_photo_url нашего кастома, куда мы сохранили скриншот)
        if (item.photos.length > 0) {
            const url = URL.createObjectURL(item.photos[0].file_path);
            setResultImage(url);
        }

        // 3. Генерируем ссылки для наложенных принтов
        if (item.custom_photos && item.custom_photos.length > 0) {
            const pUrls = item.custom_photos
                .map((print) => {
                    if (print.file_path) {
                        const url = URL.createObjectURL(print.file_path);
                        urlsToRevoke.push(url);
                        return url;
                    }
                    return null;
                })
                .filter(Boolean); // Убираем пустые, если вдруг они есть
            setPrintImages(pUrls);
        }

        // ЖЕСТКАЯ ОЧИСТКА. Когда карточка удаляется, браузер стирает ссылки.
        return () => {
            urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [item, baseProduct]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    return (
        <div className="profile-custom-card">
            <div className="profile-custom-card-header">
                <p className="profile-custom-name">{item.name}</p>
                <p className="profile-custom-date">
                    Создан: {formatDate(item.created_at)}
                </p>
            </div>

            <p className="profile-custom-base-name">
                Основа:{" "}
                <span>{baseProduct ? baseProduct.name : "Неизвестно"}</span>
            </p>

            <div className="profile-custom-images-group">
                <div className="profile-custom-image-box base-box">
                    <p className="profile-custom-image-label">Основа</p>
                    <img
                        src={baseImage}
                        alt="Base"
                        className="profile-custom-img"
                    />
                </div>

                <div className="profile-custom-image-separator">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path
                            fillRule="evenodd"
                            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                        />
                    </svg>
                </div>

                <div className="profile-custom-image-box result-box">
                    <p className="profile-custom-image-label">Результат</p>
                    <img
                        src={resultImage}
                        alt="Result"
                        className="profile-custom-img"
                    />
                </div>
            </div>

            {printImages.length > 0 && (
                <div className="profile-custom-prints-group">
                    <p className="profile-custom-prints-label">
                        Использованные принты:
                    </p>
                    <div className="profile-custom-prints-list">
                        {printImages.map((printUrl, index) => (
                            <img
                                key={index}
                                src={printUrl}
                                alt="print-thumb"
                                className="profile-custom-print-thumb"
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="profile-custom-actions">
                <button
                    className="profile-custom-btn-cart"
                    onClick={() => onAddToCart(item._id)}
                >
                    Добавить в корзину
                </button>
                <div className="profile-custom-actions-right">
                    <button
                        className="profile-custom-btn-delete"
                        onClick={() => onDelete(item._id)}
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}

// === ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ===
function ProfileCustoms() {
    const { appState } = useContext(AppStateContext);
    const { products, setProducts, users, setUsers } =
        useContext(GlobalContext);
    const navigate = useNavigate();

    // БАРЬЕРЫ ЗАЩИТЫ
    if (!products || !users) return null;

    const userId = Number(localStorage.getItem("user_id"));
    if (!userId) {
        navigate("/login");
        return null;
    }

    // ВЫЧИСЛЯЕМЫЕ ДАННЫЕ (Без стейта customs)
    // Ищем все кастомы текущего пользователя
    const myCustoms = products.filter(
        (p) => p.is_custom === true && p.user_id === userId,
    );

    // === ЛОГИКА ДОБАВЛЕНИЯ В КОРЗИНУ (Без сервера) ===
    const handleAddToCart = (productId) => {
        try {
            setUsers((prevUsers) => {
                return prevUsers.map((u) => {
                    if (u._id === userId) {
                        const cart = u.cart_items || [];
                        const existingItemIndex = cart.findIndex(
                            (c) => c.product_id === productId,
                        );

                        if (existingItemIndex !== -1) {
                            // Увеличиваем количество, если уже есть
                            const updatedCart = [...cart];
                            updatedCart[existingItemIndex] = {
                                ...updatedCart[existingItemIndex],
                                quantity:
                                    updatedCart[existingItemIndex].quantity + 1,
                            };
                            return { ...u, cart_items: updatedCart };
                        } else {
                            // Добавляем как новый товар
                            const newItem = {
                                product_id: productId,
                                quantity: 1,
                                created_at: new Date().toISOString(),
                            };
                            return { ...u, cart_items: [...cart, newItem] };
                        }
                    }
                    return u; // Остальных юзеров не трогаем
                });
            });
            alert("Твой дизайн отправлен в корзину. Я проследил.");
        } catch (err) {
            console.error(err);
            alert("Ошибка добавления.");
        }
    };

    // === ЛОГИКА УДАЛЕНИЯ (Без сервера) ===
    const handleDelete = (productId) => {
        if (!window.confirm("Удалить этот дизайн навсегда?")) return;
        try {
            // Просто выкидываем товар из массива продуктов
            setProducts((prev) => prev.filter((p) => p._id !== productId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <section className="profile-customs-root">
            <h2 className="profile-customs-header">Мои кастомные товары</h2>

            <div className="profile-customs-list">
                {myCustoms.length === 0 && (
                    <p style={{ color: "var(--color-dark-brown)" }}>Пусто</p>
                )}
                {myCustoms.map((item) => {
                    // Ищем базовую вещь, из которой сделан этот кастом
                    const baseProduct = products.find(
                        (p) => p._id === item.base_product_id,
                    );

                    return (
                        <ProfileCustomCard
                            key={item._id}
                            item={item}
                            baseProduct={baseProduct}
                            onAddToCart={handleAddToCart}
                            onDelete={handleDelete}
                        />
                    );
                })}
            </div>
        </section>
    );
}

export default ProfileCustoms;
