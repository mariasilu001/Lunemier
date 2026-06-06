import React, { useContext } from "react";
import { useNavigate } from "react-router-dom"; // Навигатор для защиты
import ProductCard from "../../../components/ProductCard/ProductCard";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext"; // Наша база данных
import "../styles/profile-reviews-styles.css";

function ProfileReviews() {
    const { appState } = useContext(AppStateContext);
    // Достаем глобальные отзывы, продукты и функцию изменения отзывов
    const { reviews, setReviews, products } = useContext(GlobalContext);
    const navigate = useNavigate();

    // 1. ЖЕСТКИЕ БАРЬЕРЫ
    if (!reviews || !products) return null; // Ждем загрузки IndexedDB

    const userId = Number(localStorage.getItem("user_id"));
    if (!userId) {
        navigate("/login");
        return null;
    }

    // 2. ВЫЧИСЛЯЕМЫЕ ДАННЫЕ (Без useState и fetch)
    // Фильтруем отзывы: оставляем только те, которые написал текущий юзер
    const myReviews = reviews.filter((r) => r.user_id === userId);

    // 3. АВТОНОМНОЕ УДАЛЕНИЕ
    const handleDelete = (reviewId) => {
        if (!window.confirm("Ты хочешь стереть этот отзыв?")) return;

        try {
            // Удаляем отзыв из глобального массива
            // Наш "Наблюдатель" в контексте сам перезапишет IndexedDB
            setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        } catch (error) {
            console.error(error);
        }
    };

    // 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((star) =>
            star <= rating ? (
                <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-star-fill"
                    viewBox="0 0 16 16"
                >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
            ) : (
                <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-star"
                    viewBox="0 0 16 16"
                >
                    <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
                </svg>
            ),
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    // 5. РЕНДЕР
    return (
        <section className="profile-reviews-root">
            <h2 className="profile-reviews-header">Мои отзывы</h2>

            <div className="profile-reviews-list">
                {myReviews.length === 0 && (
                    <p style={{ color: "var(--color-dark-brown)" }}>Пусто</p>
                )}
                {myReviews.map((review) => {
                    // Ищем целый объект продукта в базе, чтобы передать его в карточку
                    const reviewedProduct = products.find(
                        (p) => p._id === review.product_id,
                    );

                    // Защита от удаленных товаров
                    if (!reviewedProduct) return null;

                    return (
                        <div className="profile-review-card" key={review._id}>
                            <div className="profile-review-card-left">
                                {/* Передаем реальный продукт */}
                                <ProductCard product={reviewedProduct} />
                            </div>

                            <div className="profile-review-card-right">
                                <p className="profile-review-date">
                                    {/* Исправлен ключ даты */}
                                    {formatDate(review.created_at)}
                                </p>

                                <div className="profile-review-rating-group">
                                    <div className="profile-review-stars">
                                        {renderStars(review.rating)}
                                    </div>
                                    <span className="profile-review-rating-number">
                                        {review.rating}.0
                                    </span>
                                </div>

                                <p className="profile-review-text">
                                    {/* Исправлен ключ текста */}
                                    {review.review_text}
                                </p>

                                {/* Логика Base64 фото, как мы делали в прошлом файле */}
                                {review.photos && review.photos.length > 0 && (
                                    <div className="profile-review-photos-group">
                                        {review.photos.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo.file_path}
                                                alt="review-attached"
                                                className="profile-review-photo"
                                                onError={(e) =>
                                                    (e.target.style.display =
                                                        "none")
                                                }
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="profile-review-actions">
                                    <button
                                        className="profile-review-btn-delete"
                                        onClick={() => handleDelete(review._id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default ProfileReviews;
