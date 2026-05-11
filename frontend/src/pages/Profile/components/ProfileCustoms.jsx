import React, { useState, useEffect, useContext } from "react";
import { AppStateContext } from "../../../App";
import "../styles/profile-customs-styles.css";

function ProfileCustoms() {
    const { appState } = useContext(AppStateContext);
    const [customs, setCustoms] = useState([]);

    useEffect(() => {
        if (!appState.isAuthenticated) return;
        const token = localStorage.getItem("token");

        fetch("/api/me/customs", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.customs) setCustoms(data.customs);
            })
            .catch((err) => console.error(err));
    }, [appState.isAuthenticated]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    // Я проверяю, есть ли у основы фото.
    const getBaseImage = (custom) => {
        if (
            custom.baseProduct &&
            custom.baseProduct.photos &&
            custom.baseProduct.photos.length > 0
        ) {
            return `/${custom.baseProduct.photos[0].filePath.replace(/\\/g, "/")}`;
        }
        return "/cloth-front.png";
    };

    const getResultImage = (custom) => {
        if (custom.photos && custom.photos.length > 0) {
            return `/${custom.photos[0].filePath.replace(/\\/g, "/")}`;
        }
        return "/lunemier-design-perfect.png";
    };

    const handleAddToCart = async (productId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/me/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity: 1 }),
            });
            if (res.ok) alert("Твой дизайн отправлен в корзину.");
            else alert("Ошибка добавления.");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Удалить этот дизайн навсегда?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/me/customs/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setCustoms((prev) =>
                    prev.filter((c) => c.productId !== productId),
                );
                alert("Уничтожено.");
            } else {
                alert("Ошибка удаления.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <section className="profile-customs-root">
            <h2 className="profile-customs-header">Мои кастомные товары</h2>

            <div className="profile-customs-list">
                {customs.length === 0 && (
                    <p style={{ color: "var(--color-dark-brown)" }}>
                        Ты еще ничего не создавала.
                    </p>
                )}
                {customs.map((item) => (
                    <div className="profile-custom-card" key={item.productId}>
                        <div className="profile-custom-card-header">
                            <p className="profile-custom-name">{item.name}</p>
                            <p className="profile-custom-date">
                                Создан: {formatDate(item.createdAt)}
                            </p>
                        </div>

                        <p className="profile-custom-base-name">
                            Основа:{" "}
                            <span>
                                {item.baseProduct?.name || "Неизвестно"}
                            </span>
                        </p>

                        <div className="profile-custom-images-group">
                            <div className="profile-custom-image-box base-box">
                                <p className="profile-custom-image-label">
                                    Основа
                                </p>
                                <img
                                    src={getBaseImage(item)}
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
                                <p className="profile-custom-image-label">
                                    Результат
                                </p>
                                <img
                                    src={getResultImage(item)}
                                    alt="Result"
                                    className="profile-custom-img"
                                />
                            </div>
                        </div>

                        {item.customPhotos && item.customPhotos.length > 0 && (
                            <div className="profile-custom-prints-group">
                                <p className="profile-custom-prints-label">
                                    Использованные принты:
                                </p>
                                <div className="profile-custom-prints-list">
                                    {item.customPhotos.map((print) => (
                                        <img
                                            key={print.customProductPhotoId}
                                            src={`/${print.filePath.replace(/\\/g, "/")}`}
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
                                onClick={() => handleAddToCart(item.productId)}
                            >
                                Добавить в корзину
                            </button>
                            <div className="profile-custom-actions-right">
                                <button
                                    className="profile-custom-btn-delete"
                                    onClick={() => handleDelete(item.productId)}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ProfileCustoms;
