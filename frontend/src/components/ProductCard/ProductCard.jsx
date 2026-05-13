import React, { useContext } from "react";
import { AppStateContext } from "../../App";
import "./product-card-styles.css";
import { useNavigate } from "react-router-dom";

function ProductCard({ product, isBaseMode = false }) {
    const navigate = useNavigate();
    const { appState } = useContext(AppStateContext);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!appState.isAuthenticated) {
            navigate("/login");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/me/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: product.productId,
                    quantity: 1,
                }),
            });

            if (res.ok) {
            } else {
                const err = await res.json();
                alert(err.message || "Я не смог добавить товар.");
            }
        } catch (error) {
            console.error("Ошибка добавления в корзину:", error);
        }
    };

    const handleClick = () => {
        if (isBaseMode) {
            // Если мы в режиме выбора основы, я отправляю тебя прямо в редактор с ID основы
            navigate(`/customizator/redactor?baseId=${product.productId}`);
        } else {
            navigate(`/p/${product.productId}`);
        }
    };

    let imagePath = "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg";

    if (product.isBase && product.frontPhotoUrl) {
        // Я сказал: если товар базовый, рендерим строго фото спереди
        imagePath = `/uploads/${product.frontPhotoUrl}`;
    } else if (product.photos && product.photos.length > 0) {
        // Для всех остальных обычных товаров берем первую фотку из массива
        imagePath = `/uploads/${product.photos[0].filePath.replace(/\\/g, "/")}`;
    } else if (product.frontPhotoUrl) {
        // Запасной вариант, если массив пуст, но ссылка есть
        imagePath = `/uploads/${product.frontPhotoUrl}`;
    }

    const price =
        product.prices && product.prices.length > 0
            ? product.prices[0].price
            : "Нет цены";

    const rating = product.averageRating || "0.0";

    return (
        <article className="product-card-root">
            <div onClick={handleClick} className="product-card-capsule">
                <div className="product-card-img-wrapper">
                    <img
                        className="product-card-img"
                        src={imagePath}
                        alt={product.name}
                    />
                </div>
                <p className="product-card-name">{product.name}</p>
                <div className="product-card-price-rating-group">
                    <p className="product-card-price">{price} ₽</p>
                    {!isBaseMode && (
                        <div className="product-card-rating-block">
                            <span className="product-card-rating-star-wrapper">
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
                            </span>
                            <span className="product-card-rating-value">
                                {rating}
                            </span>
                        </div>
                    )}
                </div>
                {/* Кнопка корзины не нужна при выборе основы */}
                {!isBaseMode && (
                    <button
                        className="product-card-add-to-cart-button"
                        onClick={handleAddToCart}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-bag-plus-fill"
                            viewBox="0 0 16 16"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.5 3.5a2.5 2.5 0 0 0-5 0V4h5zm1 0V4H15v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4h3.5v-.5a3.5 3.5 0 1 1 7 0M8.5 8a.5.5 0 0 0-1 0v1.5H6a.5.5 0 0 0 0 1h1.5V12a.5.5 0 0 0 1 0v-1.5H10a.5.5 0 0 0 0-1H8.5z"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </article>
    );
}

export default ProductCard;
