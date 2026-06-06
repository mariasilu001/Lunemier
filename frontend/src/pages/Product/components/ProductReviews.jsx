import React, { useContext } from "react";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext"; // НАША БАЗА
import { useForm } from "react-hook-form";
import "../styles/product-reviews-styles.css";

function ProductReviews({ product }) {
    // 1. ПОДТЯГИВАЕМ КОНТЕКСТ
    const { appState } = useContext(AppStateContext);
    const { reviews, setReviews, orders, users } = useContext(GlobalContext);

    const { register, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: { rating: 0 },
    });
    const currentRating = watch("rating");

    // 2. ЖЕСТКИЙ БАРЬЕР ЗАЩИТЫ
    if (!reviews || !orders || !users) return null;

    const userId = Number(localStorage.getItem("user_id"));

    // 3. ВЫЧИСЛЯЕМЫЕ ДАННЫЕ (Никаких useState и fetch!)

    // А) Достаем отзывы ТОЛЬКО для этого товара
    const productReviews = reviews.filter((r) => r.product_id === product._id);

    // Б) Проверяем, заказывал ли текущий юзер этот товар
    const hasOrdered = orders.some(
        (o) =>
            o.user_id === userId &&
            o.order_items.some((item) => item.product_id === product._id),
    );

    // В) Проверяем, оставлял ли юзер уже отзыв на этот товар
    const hasReviewed = productReviews.some((r) => r.user_id === userId);

    // 4. ЛОКАЛЬНОЕ СОХРАНЕНИЕ ОТЗЫВА
    const onSubmit = (data) => {
        if (data.rating === 0) {
            alert("Поставь оценку. Я не терплю пустоты.");
            return;
        }

        try {
            // Записываем новый отзыв прямо в нашу локальную базу
            setReviews((prev) => [
                {
                    _id: Date.now(), // Уникальный ID
                    user_id: userId,
                    product_id: product._id,
                    rating: data.rating,
                    review_text: data.reviewText, // Из формы берем то, что ввели
                    created_at: new Date().toISOString(),
                    updated_at: null,
                    photos: [],
                },
                ...prev, // Добавляем старые отзывы в конец массива
            ]);

            alert("Отзыв успешно сохранен. Я всё зафиксировал.");
            reset(); // Очищаем текст
            setValue("rating", 0); // Сбрасываем звезды
        } catch (error) {
            console.error(error);
        }
    };

    // 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((star) =>
            star <= rating ? (
                <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="review-star-icon"
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
                    className="review-star-icon"
                    viewBox="0 0 16 16"
                >
                    <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
                </svg>
            ),
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("ru-RU");
    };

    // 6. РЕНДЕР
    return (
        <div className="product-reviews-container">
            <h2 className="product-reviews-title">Отзывы покупателей</h2>

            {/* Блок формы. Показываем только авторизованному, кто купил и еще не оставлял отзыв */}
            {appState.isAuthenticated && hasOrdered && !hasReviewed && (
                <div className="product-review-form-container">
                    <p className="product-review-form-title">
                        Оставь свой отзыв
                    </p>
                    <form
                        className="product-review-form"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="product-review-rating-input">
                            {[1, 2, 3, 4, 5].map((starNumber) => (
                                <span
                                    key={starNumber}
                                    onClick={() =>
                                        setValue("rating", starNumber, {
                                            shouldValidate: true,
                                        })
                                    }
                                    style={{
                                        cursor: "pointer",
                                        transition: "transform 0.2s",
                                    }}
                                >
                                    {starNumber <= currentRating ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            fill="currentColor"
                                            className="review-star-icon"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            fill="currentColor"
                                            className="review-star-icon"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
                                        </svg>
                                    )}
                                </span>
                            ))}
                        </div>
                        <textarea
                            className="product-review-textarea"
                            placeholder="Напиши, что думаешь об этой вещи..."
                            {...register("reviewText", { required: true })}
                        ></textarea>
                        <button
                            type="submit"
                            className="product-review-submit-btn"
                        >
                            Отправить отзыв
                        </button>
                    </form>
                </div>
            )}

            <div className="product-reviews-column">
                {/* Рендерим отфильтрованные отзывы */}
                {productReviews.length > 0 ? (
                    productReviews.map((review) => {
                        // Ищем автора отзыва в таблице users
                        const author = users.find(
                            (u) => u._id === review.user_id,
                        );

                        return (
                            <div
                                key={review._id}
                                className="customer-review-card"
                            >
                                <div className="customer-review-header">
                                    <span className="customer-review-username">
                                        {author ? author.username : "Аноним"}
                                    </span>
                                    <span className="customer-review-date">
                                        {formatDate(review.created_at)}
                                    </span>
                                </div>
                                <div className="customer-review-rating">
                                    {renderStars(review.rating)}
                                    <span className="customer-review-rating-number">
                                        {review.rating}.0
                                    </span>
                                </div>
                                <p className="customer-review-text">
                                    {review.review_text}
                                </p>

                                {/* НОВЫЙ БЛОК: ОТРИСОВКА КАРТИНОК ОТЗЫВА */}
                                {review.photos && review.photos.length > 0 && (
                                    <div
                                        className="customer-review-photos-grid"
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                            marginTop: "12px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {review.photos.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo.file_path}
                                                alt={`Фото к отзыву ${index + 1}`}
                                                className="customer-review-attached-photo"
                                                style={{
                                                    width: "80px",
                                                    height: "80px",
                                                    objectFit: "cover",
                                                    borderRadius: "6px",
                                                    border: "1px solid var(--color-light-brown)",
                                                }}
                                                // Если Base64 сломана, браузер скроет картинку, чтобы не портить дизайн
                                                onError={(e) =>
                                                    (e.target.style.display =
                                                        "none")
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p style={{ color: "var(--color-dark-brown)" }}>
                        Пока нет отзывов.
                    </p>
                )}
            </div>
        </div>
    );
}

export default ProductReviews;
