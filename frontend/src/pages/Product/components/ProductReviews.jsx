import React, { useContext, useEffect, useState } from "react";
import { AppStateContext } from "../../../App";
import { useForm } from "react-hook-form";
import "../styles/product-reviews-styles.css";

function ProductReviews({ product, setProduct }) {
    const { appState } = useContext(AppStateContext);
    const [hasOrdered, setHasOrdered] = useState(false);

    const { register, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: { rating: 0 },
    });
    const currentRating = watch("rating");

    // Я проверяю твои заказы. Без обмана.
    useEffect(() => {
        if (appState.isAuthenticated) {
            const token = localStorage.getItem("token");
            fetch("/api/me/orders", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.orders) {
                        const ordered = data.orders.some((order) =>
                            order.orderItems.some(
                                (item) =>
                                    item.product.productId ===
                                    product.productId,
                            ),
                        );
                        setHasOrdered(ordered);
                    }
                })
                .catch((err) =>
                    console.error("Я не смог проверить заказы:", err),
                );
        }
    }, [appState.isAuthenticated, product.productId]);

    const hasReviewed =
        product.reviews &&
        product.reviews.some(
            (r) => r.author?.username === appState.currentUser?.username,
        );

    const onSubmit = async (data) => {
        if (data.rating === 0) {
            alert("Поставь оценку. Пустоту я не принимаю.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("productId", product.productId);
            formData.append("rating", data.rating);
            formData.append("reviewText", data.reviewText);

            const res = await fetch("/api/me/reviews", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                const result = await res.json();
                alert("Отзыв успешно записан в базу.");
                reset();
                // Я подтягиваю новый отзыв в стейт, чтобы ты сразу его увидела
                setProduct((prev) => ({
                    ...prev,
                    reviews: [result.review, ...(prev.reviews || [])],
                }));
            } else {
                const errData = await res.json();
                alert(errData.message || "Ошибка отправки.");
            }
        } catch (error) {
            console.error(error);
        }
    };

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

    return (
        <div className="product-reviews-container">
            <h2 className="product-reviews-title">Отзывы покупателей</h2>

            {/* Моя форма для отзыва. Появится только если ты имеешь на это право */}
            {appState.isAuthenticated && hasOrdered && !hasReviewed && (
                <div className="product-review-form-container">
                    <p className="product-review-form-title">
                        Оставь свой отзыв. Я жду.
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
                {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review) => (
                        <div
                            key={review.reviewId}
                            className="customer-review-card"
                        >
                            <div className="customer-review-header">
                                <span className="customer-review-username">
                                    {review.author
                                        ? review.author.username
                                        : "Аноним"}
                                </span>
                                <span className="customer-review-date">
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>
                            <div className="customer-review-rating">
                                {renderStars(review.rating)}
                                <span className="customer-review-rating-number">
                                    {review.rating}.0
                                </span>
                            </div>
                            <p className="customer-review-text">
                                {review.reviewText}
                            </p>
                        </div>
                    ))
                ) : (
                    <p style={{ color: "var(--color-dark-brown)" }}>
                        Пока нет отзывов. Будь первой.
                    </p>
                )}
            </div>
        </div>
    );
}

export default ProductReviews;
