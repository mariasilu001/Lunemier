import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppStateContext } from "../../App";
import { GlobalContext } from "../../GlobalContext"; // Подключаем нашу базу
import Header from "../../layouts/MainLayout/components/Header";
import "./styles/cart-styles.css";

// === ОТДЕЛЬНЫЙ КОМПОНЕНТ ТОВАРА ДЛЯ ЗАЩИТЫ ПАМЯТИ ===
function CartItemCard({ cartItem, product, updateQuantity, removeItem }) {
    const navigate = useNavigate();
    // Локальный стейт для Blob-ссылки
    const [imgUrl, setImgUrl] = useState(
        "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg",
    );

    useEffect(() => {
        let url = null;
        // Защищенное извлечение Blob-файла (обычное фото или фото основы)
        if (
            product &&
            product.photos &&
            product.photos.length > 0 &&
            product.photos[0].file_path
        ) {
            url = URL.createObjectURL(product.photos[0].file_path);
            setImgUrl(url);
        } else if (product && product.front_photo_url) {
            url = URL.createObjectURL(product.front_photo_url);
            setImgUrl(url);
        }

        // Жесткая очистка памяти при удалении товара из корзины
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [product]);

    // Если товар удалили из базы, мы его не рендерим
    if (!product) return null;

    const price =
        product.prices && product.prices.length > 0
            ? parseFloat(product.prices[0].price)
            : 0;

    return (
        <div className="cart-item-card">
            <img
                src={imgUrl}
                alt={product.name}
                className="cart-item-img"
                onClick={() => navigate(`/p/${product._id}`)}
                style={{ cursor: "pointer" }}
            />
            <div className="cart-item-info">
                <p className="cart-item-name">{product.name}</p>
                <p className="cart-item-price">{price} ₽</p>
            </div>
            <div className="cart-item-controls">
                <div className="quantity-group">
                    <button
                        onClick={() =>
                            updateQuantity(
                                cartItem.product_id,
                                cartItem.quantity,
                                -1,
                            )
                        }
                    >
                        -
                    </button>
                    <span>{cartItem.quantity}</span>
                    <button
                        onClick={() =>
                            updateQuantity(
                                cartItem.product_id,
                                cartItem.quantity,
                                1,
                            )
                        }
                    >
                        +
                    </button>
                </div>
                <button
                    className="cart-item-delete"
                    onClick={() => removeItem(cartItem.product_id)}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

// === ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ===
function CartPage() {
    const { appState } = useContext(AppStateContext);
    const {
        users,
        setUsers,
        products,
        pickupPoints,
        paymentMethods,
        setOrders,
    } = useContext(GlobalContext);
    const navigate = useNavigate();

    const [pickupPoint, setPickupPoint] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    // Жесткие барьеры загрузки
    if (!users || !products || !pickupPoints || !paymentMethods) return null;

    const userId = Number(localStorage.getItem("user_id"));
    if (!appState.isAuthenticated || !userId) {
        navigate("/login");
        return null;
    }

    // 1. ВЫЧИСЛЯЕМЫЕ ДАННЫЕ (Без стейта cartItems)
    const currentUser = users.find((u) => u._id === userId);
    if (!currentUser) return null;

    const myCart = currentUser.cart_items || [];

    // Вычисляем итоговую сумму "на лету"
    const totalAmount = myCart.reduce((sum, item) => {
        const product = products.find((p) => p._id === item.product_id);
        if (!product) return sum;
        const price =
            product.prices && product.prices.length > 0
                ? parseFloat(product.prices[0].price)
                : 0;
        return sum + price * item.quantity;
    }, 0);

    // 2. ИЗМЕНЕНИЕ КОЛИЧЕСТВА
    const updateQuantity = (productId, currentQuantity, delta) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity < 1) return; // Нельзя меньше 1

        setUsers((prevUsers) =>
            prevUsers.map((u) => {
                if (u._id === userId) {
                    const updatedCart = u.cart_items.map((item) =>
                        item.product_id === productId
                            ? { ...item, quantity: newQuantity }
                            : item,
                    );
                    return { ...u, cart_items: updatedCart };
                }
                return u;
            }),
        );
    };

    // 3. УДАЛЕНИЕ ИЗ КОРЗИНЫ
    const removeItem = (productId) => {
        setUsers((prevUsers) =>
            prevUsers.map((u) => {
                if (u._id === userId) {
                    const updatedCart = u.cart_items.filter(
                        (item) => item.product_id !== productId,
                    );
                    return { ...u, cart_items: updatedCart };
                }
                return u;
            }),
        );
    };

    // 4. ОФОРМЛЕНИЕ ЗАКАЗА (Локальная транзакция)
    const handleCheckout = () => {
        if (!pickupPoint || !paymentMethod) {
            alert("Выбери пункт выдачи и способ оплаты. Уважай процесс.");
            return;
        }

        try {
            // А. Создаем объект нового заказа
            const newOrder = {
                _id: Date.now(),
                user_id: userId,
                status: "Новый",
                pickup_point_id: Number(pickupPoint),
                payment_method_id: Number(paymentMethod),
                total_amount: totalAmount,
                created_at: new Date().toISOString(),
                updated_at: null,
                is_hidden: false,
                // Копируем товары из корзины в заказ, фиксируя их цену
                order_items: myCart.map((c) => {
                    const prod = products.find((p) => p._id === c.product_id);
                    const priceSnapshot =
                        prod && prod.prices && prod.prices.length > 0
                            ? parseFloat(prod.prices[0].price)
                            : 0;
                    return {
                        product_id: c.product_id,
                        quantity: c.quantity,
                        price_snapshot: priceSnapshot,
                    };
                }),
            };

            // Б. Записываем заказ в базу (массив orders)
            setOrders((prev) => [...prev, newOrder]);

            // В. Очищаем корзину текущего пользователя
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u._id === userId ? { ...u, cart_items: [] } : u,
                ),
            );

            alert("Заказ успешно оформлен!");
            navigate("/profile/orders");
        } catch (error) {
            console.error(error);
            alert("Сбой в системе оформления.");
        }
    };

    return (
        <div className="cart-page-wrapper">
            <Header />
            <div className="cart-page-content">
                <div className="cart-items-section">
                    <h1 className="cart-title">Твоя корзина</h1>
                    {myCart.length === 0 ? (
                        <p className="cart-empty">Корзина пуста.</p>
                    ) : (
                        <div className="cart-items-list">
                            {myCart.map((item) => {
                                // Ищем продукт для каждой записи в корзине
                                const product = products.find(
                                    (p) => p._id === item.product_id,
                                );
                                return (
                                    <CartItemCard
                                        key={item.product_id}
                                        cartItem={item}
                                        product={product}
                                        updateQuantity={updateQuantity}
                                        removeItem={removeItem}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="cart-checkout-section">
                    <h2 className="checkout-title">Оформление заказа</h2>
                    <div className="checkout-form">
                        <div className="checkout-group">
                            <label>Пункт выдачи</label>
                            <select
                                value={pickupPoint}
                                onChange={(e) => setPickupPoint(e.target.value)}
                            >
                                <option value="">Выбери ПВЗ...</option>
                                {/* Берем pickup_point_id из архитектуры базы */}
                                {pickupPoints.map((p) => (
                                    <option
                                        key={p.pickup_point_id || p._id}
                                        value={p.pickup_point_id || p._id}
                                    >
                                        г. {p.city}, ул. {p.street}, д.{" "}
                                        {p.building}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="checkout-group">
                            <label>Способ оплаты</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            >
                                <option value="">Выбери способ...</option>
                                {/* Берем payment_method_id из архитектуры базы */}
                                {paymentMethods.map((m) => (
                                    <option
                                        key={m.payment_method_id || m._id}
                                        value={m.payment_method_id || m._id}
                                    >
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="checkout-summary">
                            <div className="summary-row">
                                <span>Итого к оплате:</span>
                                <span className="summary-total">
                                    {totalAmount.toFixed(2)} ₽
                                </span>
                            </div>
                        </div>

                        <button
                            className="checkout-submit-btn"
                            disabled={
                                myCart.length === 0 ||
                                !pickupPoint ||
                                !paymentMethod
                            }
                            onClick={handleCheckout}
                        >
                            Подтвердить заказ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
