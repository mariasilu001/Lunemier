import React, { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../../GlobalContext"; // НАША БАЗА
import "../styles/admin-moderation-styles.css";

// === ОТДЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ ДИЗАЙНА (ЗАЩИТА ПАМЯТИ) ===
function AdminDesignCard({ design, authorName, onBan }) {
    const [imgUrl, setImgUrl] = useState("/lunemier-design-perfect.png");

    useEffect(() => {
        let url = null;
        // Извлекаем Blob-скриншот кастома, который мы сохраняли в редакторе
        if (design.photos.length > 0) {
            url = URL.createObjectURL(design.photos[0].file_path);
            setImgUrl(url);
        }

        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [design]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    return (
        <div
            className={`admin-design-card ${design.deleted_at ? "banned" : ""}`}
        >
            <div className="admin-design-img-wrapper">
                <img src={imgUrl} alt="custom design" />
                {design.deleted_at && (
                    <div className="banned-overlay">ЗАБЛОКИРОВАНО</div>
                )}
            </div>
            <div className="admin-design-info">
                <p className="design-author">
                    Автор: <span>{authorName}</span>
                </p>
                <p className="design-product">Товар ID: #{design._id}</p>
                <p className="design-date">{formatDate(design.created_at)}</p>
            </div>
            <div className="admin-design-actions">
                <button
                    className="admin-btn-ban"
                    onClick={() => onBan(design._id)}
                    disabled={!!design.deleted_at}
                >
                    {design.deleted_at ? "Заблокирован" : "Заблокировать товар"}
                </button>
            </div>
        </div>
    );
}

// === ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ===
function AdminModeration() {
    const { reviews, setReviews, products, setProducts, users } =
        useContext(GlobalContext);
    const [activeTab, setActiveTab] = useState("reviews");

    // Жесткий барьер загрузки БД
    if (!reviews || !products || !users) return null;

    // ВЫЧИСЛЯЕМЫЕ ДАННЫЕ (Без useState)
    // 1. Сортируем отзывы от новых к старым
    const sortedReviews = [...reviews].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    // 2. Достаем только кастомные дизайны
    const customDesigns = products
        .filter((p) => p.is_custom === true)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // ЛОКАЛЬНОЕ УДАЛЕНИЕ ОТЗЫВА
    const handleDeleteReview = (reviewId) => {
        if (!window.confirm("Уничтожить этот отзыв навсегда?")) return;
        try {
            // Вырезаем отзыв из глобального массива
            setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        } catch (error) {
            console.error(error);
        }
    };

    // ЛОКАЛЬНАЯ БЛОКИРОВКА ДИЗАЙНА
    const handleBanDesign = (productId) => {
        if (
            !window.confirm(
                `Заблокировать кастомный товар #${productId} за нарушение правил?`,
            )
        )
            return;
        try {
            // Ставим дату удаления, переводя кастом в архив
            setProducts((prev) =>
                prev.map((p) =>
                    p._id === productId
                        ? { ...p, deleted_at: new Date().toISOString() }
                        : p,
                ),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString("ru-RU");
    };

    return (
        <section className="admin-moderation-root">
            <div className="admin-moderation-header-row">
                <div>
                    <h2 className="admin-moderation-header">
                        Модерация контента
                    </h2>
                    <p className="admin-moderation-subtitle">
                        Очистка системы от пользовательского хаоса
                    </p>
                </div>
            </div>

            <div className="admin-moderation-tabs">
                <button
                    className={`admin-moderation-tab ${activeTab === "reviews" ? "active" : ""}`}
                    onClick={() => setActiveTab("reviews")}
                >
                    Отзывы ({sortedReviews.length})
                </button>
                <button
                    className={`admin-moderation-tab ${activeTab === "designs" ? "active" : ""}`}
                    onClick={() => setActiveTab("designs")}
                >
                    Кастомные дизайны ({customDesigns.length})
                </button>
            </div>

            <div className="admin-moderation-content">
                {activeTab === "reviews" && (
                    <div className="admin-reviews-list">
                        {sortedReviews.length === 0 ? (
                            <p className="admin-empty-state">
                                Нет отзывов для проверки.
                            </p>
                        ) : (
                            sortedReviews.map((review) => {
                                // Ищем имена пользователя и товара для отображения
                                const author = users.find(
                                    (u) => u._id === review.user_id,
                                );
                                const product = products.find(
                                    (p) => p._id === review.product_id,
                                );

                                return (
                                    <div
                                        key={review._id}
                                        className="admin-review-card"
                                    >
                                        <div className="admin-review-header">
                                            <div className="admin-review-meta">
                                                <span className="review-author">
                                                    {author
                                                        ? author.username
                                                        : "Аноним"}
                                                </span>
                                                <span className="review-product">
                                                    Товар:{" "}
                                                    {product
                                                        ? product.name
                                                        : "Удален"}
                                                </span>
                                                <span className="review-date">
                                                    {formatDate(
                                                        review.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <span
                                                className={`review-rating rating-${review.rating}`}
                                            >
                                                {renderStars(review.rating)}
                                            </span>
                                        </div>
                                        <p className="admin-review-text">
                                            {review.review_text}
                                        </p>

                                        {/* Если в отзыве есть фото (Base64), рисуем их */}
                                        {review.photos &&
                                            review.photos.length > 0 && (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                        marginTop: "10px",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    {review.photos.map(
                                                        (photo, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={
                                                                    photo.file_path
                                                                }
                                                                alt="attachment"
                                                                style={{
                                                                    width: "80px",
                                                                    height: "80px",
                                                                    objectFit:
                                                                        "cover",
                                                                    borderRadius:
                                                                        "4px",
                                                                }}
                                                                onError={(e) =>
                                                                    (e.target.style.display =
                                                                        "none")
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                        <div className="admin-review-actions">
                                            <button
                                                className="admin-btn-destroy"
                                                onClick={() =>
                                                    handleDeleteReview(
                                                        review._id,
                                                    )
                                                }
                                            >
                                                Удалить (Жестко)
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === "designs" && (
                    <div className="admin-designs-grid">
                        {customDesigns.length === 0 ? (
                            <p className="admin-empty-state">
                                Нет дизайнов для проверки.
                            </p>
                        ) : (
                            customDesigns.map((design) => {
                                const author = users.find(
                                    (u) => u._id === design.user_id,
                                );
                                const authorName = author
                                    ? author.username
                                    : "Неизвестный";

                                return (
                                    <AdminDesignCard
                                        key={design._id}
                                        design={design}
                                        authorName={authorName}
                                        onBan={handleBanDesign}
                                    />
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminModeration;
