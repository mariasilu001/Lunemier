import React, { useState, useEffect } from "react";
import "../styles/admin-moderation-styles.css";

function AdminModeration() {
    const [activeTab, setActiveTab] = useState("reviews");
    const [reviews, setReviews] = useState([]);
    const [customDesigns, setCustomDesigns] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Подтягиваю отзывы
        fetch("/api/admin/moderation/reviews", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.reviews) setReviews(data.reviews);
            })
            .catch((err) => console.error(err));

        // Подтягиваю дизайны
        fetch("/api/admin/moderation/customs", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.custom_designs) setCustomDesigns(data.custom_designs);
            })
            .catch((err) => console.error(err));
    }, []);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Уничтожить этот отзыв навсегда?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `/api/admin/moderation/reviews/${reviewId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (res.ok) {
                setReviews((prev) =>
                    prev.filter((r) => r.review_id !== reviewId),
                );
            } else {
                alert("Я не смог удалить этот отзыв.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBanDesign = async (designId, productId) => {
        if (
            !window.confirm(
                `Заблокировать товар #${productId} за нарушение правил?`,
            )
        )
            return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `/api/admin/moderation/customs/${productId}/ban`,
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (res.ok) {
                const data = await res.json();
                setCustomDesigns((prev) =>
                    prev.map((d) =>
                        d.design_id === designId
                            ? { ...d, deleted_at: data.deleted_at }
                            : d,
                    ),
                );
            } else {
                const err = await res.json();
                alert(err.message || "Ошибка блокировки.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
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
                    Отзывы ({reviews.length})
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
                        {reviews.length === 0 ? (
                            <p className="admin-empty-state">
                                Нет отзывов для проверки.
                            </p>
                        ) : (
                            reviews.map((review) => (
                                <div
                                    key={review.review_id}
                                    className="admin-review-card"
                                >
                                    <div className="admin-review-header">
                                        <div className="admin-review-meta">
                                            <span className="review-author">
                                                {review.username}
                                            </span>
                                            <span className="review-product">
                                                {review.product_name}
                                            </span>
                                            <span className="review-date">
                                                {review.created_at}
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

                                    {review.file_path && (
                                        <img
                                            src={`/${review.file_path.replace(/\\/g, "/")}`}
                                            alt="attachment"
                                            style={{
                                                width: "100px",
                                                borderRadius: "4px",
                                                marginTop: "10px",
                                            }}
                                        />
                                    )}

                                    <div className="admin-review-actions">
                                        <button
                                            className="admin-btn-destroy"
                                            onClick={() =>
                                                handleDeleteReview(
                                                    review.review_id,
                                                )
                                            }
                                        >
                                            Удалить (Жестко)
                                        </button>
                                    </div>
                                </div>
                            ))
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
                            customDesigns.map((design) => (
                                <div
                                    key={design.design_id}
                                    className={`admin-design-card ${design.deleted_at ? "banned" : ""}`}
                                >
                                    <div className="admin-design-img-wrapper">
                                        <img
                                            src={
                                                design.file_path
                                                    ? `/${design.file_path.replace(/\\/g, "/")}`
                                                    : "/lunemier-design-perfect.png"
                                            }
                                            alt="custom design"
                                        />
                                        {design.deleted_at && (
                                            <div className="banned-overlay">
                                                ЗАБЛОКИРОВАНО
                                            </div>
                                        )}
                                    </div>
                                    <div className="admin-design-info">
                                        <p className="design-author">
                                            Автор:{" "}
                                            <span>{design.username}</span>
                                        </p>
                                        <p className="design-product">
                                            Товар ID: {design.product_id}
                                        </p>
                                        <p className="design-date">
                                            {design.created_at}
                                        </p>
                                    </div>
                                    <div className="admin-design-actions">
                                        <button
                                            className="admin-btn-ban"
                                            onClick={() =>
                                                handleBanDesign(
                                                    design.design_id,
                                                    design.product_id,
                                                )
                                            }
                                            disabled={!!design.deleted_at}
                                        >
                                            {design.deleted_at
                                                ? "Заблокирован"
                                                : "Заблокировать товар"}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminModeration;
