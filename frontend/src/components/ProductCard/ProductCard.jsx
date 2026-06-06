import React, { useContext, useState, useEffect } from "react";
import { AppStateContext } from "../../App";
import { GlobalContext } from "../../GlobalContext";
import "./product-card-styles.css";
import { useNavigate } from "react-router-dom";

function ProductCard({ product, isBaseMode = false }) {
    const navigate = useNavigate();
    const { appState } = useContext(AppStateContext);
    const { reviews, users, setUsers, products } = useContext(GlobalContext);
    if (!reviews || !users || !setUsers || !products) {
        return null;
    }

    const [imagePath, setImagePath] = useState(
        "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg",
    );

    useEffect(() => {
        let objectUrl = null;

        if (product.photos[0].file_path) {
            objectUrl = URL.createObjectURL(product.photos[0].file_path);
            setImagePath(objectUrl);
        }

        // Функция очистки (return в useEffect) срабатывает, когда комплнент исчезает с экрана.
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [product]);

    const handleClick = () => {
        if (isBaseMode) {
            navigate(`/customizator/redactor?baseId=${product._id}`);
        } else {
            navigate(`/p/${product._id}`);
        }
    };

    const price =
        product.prices && product.prices.length > 0
            ? product.prices[0].price
            : "Нет цены";

    const calculateRating = () => {
        const productRevs = reviews.filter((r) => r.product_id === product._id);

        if (productRevs.length === 0) return 0;

        const totalRating = productRevs.reduce((acc, r) => acc + r.rating, 0);

        return totalRating / productRevs.length;
    };

    const rating = calculateRating();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const userId = Number(localStorage.getItem("user_id"));
        if (!userId) {
            navigate("/login");
            return;
        }

        const currentUser = users.find((u) => u._id === userId);

        const isExistingCartItem = currentUser.cart_items.find(
            (i) => i.product_id === product._id,
        );

        if (isExistingCartItem) {
            setUsers((prev) => {
                const newCartItems = currentUser.cart_items.map((i) => {
                    if (i.product_id === product._id) {
                        const newQuantity = i.quantity + 1;
                        return { ...i, quantity: newQuantity };
                    }
                    return { ...i };
                });

                const newData = prev.map((u) => {
                    if (u._id === currentUser._id) {
                        return { ...u, cart_items: newCartItems };
                    }
                    return u;
                });
                return newData;
            });
        } else {
            setUsers((prev) => {
                return prev.map((u) => {
                    if (u._id === currentUser._id) {
                        const newItem = {
                            product_id: product._id,
                            quantity: 1,
                            created_at: new Date(),
                        };
                        return { ...u, cart_items: [...u.cart_items, newItem] };
                    }
                    return u;
                });
            });
        }
    };

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
                    {isBaseMode && (
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
