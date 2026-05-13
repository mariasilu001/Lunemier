import React, { useState, useContext } from "react";
import { AppStateContext } from "../../../App";
import { useNavigate } from "react-router-dom";
import "../styles/product-details-styles.css";

function ProductDetails({ product }) {
    const { appState } = useContext(AppStateContext);
    const navigate = useNavigate();

    // Я вытаскиваю фото товара. Если их нет — ставлю заглушку.
    const photos =
        product.photos && product.photos.length > 0
            ? product.photos.map((p) => `/${p.filePath.replace(/\\/g, "/")}`)
            : [
                  "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg",
              ];

    const [activePhoto, setActivePhoto] = useState(photos[0]);

    // Я проверяю цену.
    const price =
        product.prices && product.prices.length > 0
            ? product.prices[0].price
            : "Нет цены";

    const rating = product.averageRating || "0.0";

    const handleAddToCart = async () => {
        if (!appState.isAuthenticated) {
            alert("Сначала авторизуйся. ");
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
                alert(err.message || "Ошибка добавления.");
            }
        } catch (error) {
            console.error("Ошибка корзины:", error);
        }
    };

    return (
        <div className="product-details-container">
            <div className="product-gallery-section">
                <div className="product-thumbnails-column">
                    {photos.map((photo, index) => (
                        <img
                            key={index}
                            src={photo}
                            alt={`thumbnail-${index}`}
                            className={`product-thumbnail ${activePhoto === photo ? "active" : ""}`}
                            onClick={() => setActivePhoto(photo)}
                        />
                    ))}
                </div>
                <div className="product-main-image-wrapper">
                    <img
                        src={activePhoto}
                        alt={product.name}
                        className="product-main-image"
                    />
                </div>
            </div>

            <div className="product-info-section">
                <h1 className="product-info-title">{product.name}</h1>
                <div className="product-info-rating-row">
                    <span
                        className="product-info-stars"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                        </svg>
                    </span>
                    <span className="product-info-reviews-count">{rating}</span>
                </div>
                <p className="product-info-price">{price} ₽</p>
                <p className="product-info-description">
                    {product.description ||
                        "Оно согреет тебя"}
                </p>

                <div className="product-info-sizes">
                    <p className="sizes-label">Размер:</p>
                    <div className="sizes-grid">
                        <button className="size-btn">XS</button>
                        <button className="size-btn active">S</button>
                        <button className="size-btn">M</button>
                        <button className="size-btn">L</button>
                    </div>
                </div>

                <button
                    className="product-add-to-cart-btn"
                    onClick={handleAddToCart}
                >
                    Добавить в корзину
                </button>
            </div>
        </div>
    );
}

export default ProductDetails;
