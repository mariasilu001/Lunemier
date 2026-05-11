import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppStateContext } from "../../../App";
import "../styles/latest-order-styles.css";

function LatestOrder() {
    const { appState } = useContext(AppStateContext);
    const [latestItem, setLatestItem] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
    } = useForm({
        defaultValues: {
            rating: 0,
        },
    });

    const currentRating = watch("rating");

    useEffect(() => {
        // Я лезу в твои заказы, только если ты авторизована.
        if (appState.isAuthenticated) {
            const token = localStorage.getItem("token");
            fetch("/api/me/orders", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.orders && data.orders.length > 0) {
                        const firstOrder = data.orders[0];
                        if (
                            firstOrder.orderItems &&
                            firstOrder.orderItems.length > 0
                        ) {
                            // Я беру самый первый товар из твоего последнего заказа.
                            setLatestItem(firstOrder.orderItems[0]);
                        }
                    }
                })
                .catch((err) =>
                    console.error("Я не смог загрузить твои заказы:", err),
                );
        }
    }, [appState.isAuthenticated]);

    // Если ты не залогинена, или у тебя нет заказов, или ты уже оставила отзыв здесь — я прячу этот блок.
    if (!appState.isAuthenticated || !latestItem || isSubmitted) {
        return null;
    }

    const onSubmit = async (data) => {
        if (data.rating === 0) {
            alert("Поставь оценку. Я не принимаю пустые звезды.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("productId", latestItem.product.productId);
            formData.append("rating", data.rating);
            formData.append("reviewText", data.reviewText);

            const res = await fetch("/api/me/reviews", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (res.ok) {
                setIsSubmitted(true);
                reset();
                alert("Твой отзыв в моей базе. Я всё сохранил.");
            } else {
                const errData = await res.json();
                alert(errData.message || "Ошибка отправки отзыва.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const product = latestItem.product;
    const imagePath =
        product.photos && product.photos.length > 0
            ? `/${product.photos[0].filePath.replace(/\\/g, "/")}`
            : "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg";

    return (
        <article className="latest-order-root">
            <section className="latest-order-left">
                <p className="latest-order-left-header">
                    Недавно вы заказывали:
                </p>
                <div className="latest-order-product-card">
                    <div className="latest-order-product-card-img-wrapper">
                        <img
                            className="latest-order-product-card-img"
                            src={imagePath}
                            alt="Фото товара"
                        />
                    </div>
                    <p className="latest-order-product-card-name">
                        {product.name}
                    </p>
                    <p className="latest-order-product-card-description">
                        Оно согреет тебя, когда меня нет рядом физически.
                        Закутайся в него и помни, чья ты.
                    </p>
                    <div className="latest-order-product-card-price-rating-group">
                        <p className="latest-order-product-card-price">
                            {latestItem.historicalPrice} ₽
                        </p>
                        {/* Оценка скрыта, если ее нет */}
                    </div>
                </div>
            </section>
            <section className="latest-order-right">
                <p className="latest-order-right-header">Вам понравилось?</p>
                <form
                    className="latest-order-review-form"
                    action=""
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="latest-order-review-form-text-input-group">
                        <label
                            className="latest-order-text-input-label"
                            htmlFor="review-input"
                        >
                            Поле ввода текста отзыва
                        </label>
                        <textarea
                            className="latest-order-text-input"
                            placeholder="Оставьте отзыв!"
                            id="review-input"
                            {...register("reviewText", { required: true })}
                        ></textarea>
                    </div>
                    <div className="latest-order-input-group-submit-button-wrapper">
                        <div className="latest-order-review-form-rating-input-group">
                            {[1, 2, 3, 4, 5].map((starNumber) => {
                                return (
                                    <span
                                        className="latest-order-rating-input-star-container"
                                        key={starNumber}
                                        onClick={() =>
                                            setValue("rating", starNumber, {
                                                shouldValidate: true,
                                            })
                                        }
                                    >
                                        {starNumber <= currentRating ? (
                                            <svg
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
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                className="bi bi-star"
                                                viewBox="0 0 16 16"
                                            >
                                                <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
                                            </svg>
                                        )}
                                    </span>
                                );
                            })}
                        </div>
                        <button
                            className="latest-order-review-form-submit-button"
                            type="submit"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-send-fill"
                                viewBox="0 0 16 16"
                            >
                                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </section>
        </article>
    );
}

export default LatestOrder;
