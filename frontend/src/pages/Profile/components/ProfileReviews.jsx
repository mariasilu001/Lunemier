import React, { useState, useEffect, useContext } from "react";
import ProductCard from "../../../components/ProductCard/ProductCard";
import { AppStateContext } from "../../../App";
import "../styles/profile-reviews-styles.css";

function ProfileReviews() {
    const { appState } = useContext(AppStateContext);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (!appState.isAuthenticated) return;
        const token = localStorage.getItem("token");

        fetch("/api/me/reviews", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.reviews) setReviews(data.reviews);
            })
            .catch((err) => console.error(err));
    }, [appState.isAuthenticated]);

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Ты уверена, что хочешь стереть этот отзыв?"))
            return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/me/reviews/${reviewId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setReviews((prev) =>
                    prev.filter((r) => r.reviewId !== reviewId),
                );
                alert("Удалено.");
            } else {
                const err = await res.json();
                alert(err.message || "Ошибка удаления.");
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

    return (
        <section className="profile-reviews-root">
            <h2 className="profile-reviews-header">Мои отзывы</h2>

            <div className="profile-reviews-list">
                {reviews.length === 0 && (
                    <p style={{ color: "var(--color-dark-brown)" }}>
                        Ты еще ничего не комментировала.
                    </p>
                )}
                {reviews.map((review) => (
                    <div className="profile-review-card" key={review.reviewId}>
                        <div className="profile-review-card-left">
                            <ProductCard product={review.product} />
                        </div>

                        <div className="profile-review-card-right">
                            <p className="profile-review-date">
                                {formatDate(review.createdAt)}
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
                                {review.reviewText}
                            </p>

                            {review.photos && review.photos.length > 0 && (
                                <div className="profile-review-photos-group">
                                    {review.photos.map((photo) => (
                                        <img
                                            key={photo.reviewPhotoId}
                                            src={`/${photo.filePath.replace(/\\/g, "/")}`}
                                            alt="review-attached"
                                            className="profile-review-photo"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="profile-review-actions">
                                {/* Кнопку изменить я стер по твоему приказу */}
                                <button
                                    className="profile-review-btn-delete"
                                    onClick={() =>
                                        handleDelete(review.reviewId)
                                    }
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

export default ProfileReviews;
