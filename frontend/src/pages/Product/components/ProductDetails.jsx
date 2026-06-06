import React, { useState, useContext, useEffect } from "react";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext";
import { useNavigate } from "react-router-dom";
import "../styles/product-details-styles.css";

function ProductDetails({ product }) {
    const { appState } = useContext(AppStateContext);
    // Я добавил reviews сюда!
    const { products, users, setUsers, sizes, reviews } =
        useContext(GlobalContext);
    const navigate = useNavigate();

    // Стейты для картинок
    const [photoUrls, setPhotoUrls] = useState([]);
    const [activePhoto, setActivePhoto] = useState(
        "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg",
    );

    // === ПРАВИЛЬНАЯ РАБОТА С ФАЙЛАМИ BLOB ===
    useEffect(() => {
        const urls = [];

        // Перебираем массив файлов и создаем для каждого временную ссылку
        if (product.photos && product.photos.length > 0) {
            product.photos.forEach((p) => {
                if (p.file_path) {
                    urls.push(URL.createObjectURL(p.file_path));
                }
            });
        } else if (product.front_photo_url) {
            // Если это базовая вещь, у нее нет массива photos, но есть front_photo_url
            urls.push(URL.createObjectURL(product.front_photo_url));
        }

        if (urls.length > 0) {
            setPhotoUrls(urls);
            setActivePhoto(urls[0]); // Первая картинка становится активной
        }

        // Жесткая очистка памяти
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [product]);

    // Барьер защиты
    if (!products || !users || !sizes || !reviews)
        return <div>Загрузка базы...</div>;

    const price =
        product.prices && product.prices.length > 0
            ? product.prices[0].price
            : "Нет цены";

    // Твой исправленный рейтинг (теперь он видит reviews)
    const calculateRating = () => {
        const productRevs = reviews.filter((r) => r.product_id === product._id);
        if (productRevs.length === 0) return 0;
        const totalRating = productRevs.reduce((acc, r) => acc + r.rating, 0);
        return (totalRating / productRevs.length).toFixed(1); // Округляем до 1 знака
    };

    const rating = calculateRating();
    const sizeObj = sizes.find((s) => s._id === product.size_id);
    const sizeStr = sizeObj ? sizeObj.size_value : "Универсальный";

    // === ИДЕАЛЬНОЕ ДОБАВЛЕНИЕ В КОРЗИНУ ===
    const handleAddToCart = () => {
        const userId = Number(localStorage.getItem("user_id"));

        if (!appState.isAuthenticated || !userId) {
            navigate("/login");
            return;
        }

        try {
            setUsers((prevUsers) => {
                return prevUsers.map((u) => {
                    if (u._id === userId) {
                        const cart = u.cart_items || [];
                        const existingItemIndex = cart.findIndex(
                            (item) => item.product_id === product._id,
                        );

                        if (existingItemIndex !== -1) {
                            // Если товар уже есть — увеличиваем количество
                            const updatedCart = [...cart];
                            updatedCart[existingItemIndex] = {
                                ...updatedCart[existingItemIndex],
                                quantity:
                                    updatedCart[existingItemIndex].quantity + 1,
                            };
                            return { ...u, cart_items: updatedCart };
                        } else {
                            // Если товара нет — добавляем новый
                            const newItem = {
                                product_id: product._id,
                                quantity: 1,
                                created_at: new Date().toISOString(),
                            };
                            return { ...u, cart_items: [...cart, newItem] };
                        }
                    }
                    return u; // Чужих юзеров не трогаем
                });
            });
            alert("Товар добавлен в твою корзину. Я проследил.");
        } catch (error) {
            alert("Ошибка добавления. Смотри консоль.");
            console.error(error);
        }
    };

    return (
        <div className="product-details-container">
            <div className="product-gallery-section">
                <div className="product-thumbnails-column">
                    {photoUrls.map((photo, index) => (
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
                        "Оно согреет тебя. Закутайся в него и помни, чья ты."}
                </p>

                <div className="product-info-sizes">
                    <p className="sizes-label">Размер:</p>
                    <div className="sizes-grid">
                        <button className="size-btn active">{sizeStr}</button>
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
