import React from "react";
import "./product-card-styles.css";
import { useNavigate } from "react-router-dom";

function ProductCard() {
    const navigate = useNavigate();

    return (
        <article className="product-card-root">
            <div
                onClick={() => navigate("/p/:productId")}
                className="product-card-capsule"
            >
                <div className="product-card-img-wrapper">
                    <img
                        className="product-card-img"
                        src="https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg"
                        alt="product-image"
                    />
                </div>
                <p className="product-card-name">
                    Название товара (если слишком длинное, то должно скрываться
                    за троеточием)
                </p>
                <div className="product-card-price-rating-group">
                    <p className="product-card-price">4500.0 ₽</p>
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
                        <span className="product-card-rating-value">4.7</span>
                    </div>
                </div>
                <button
                    className="product-card-add-to-cart-button"
                    onClick={(e) => {
                        e.preventDefault;
                        e.stopPropagation;
                    }}
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
            </div>
        </article>
    );
}

export default ProductCard;
