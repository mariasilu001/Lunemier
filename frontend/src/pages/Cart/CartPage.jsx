import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppStateContext } from "../../App";
import Header from "../../layouts/MainLayout/components/Header";
import "./styles/cart-styles.css";

function CartPage() {
    const { appState } = useContext(AppStateContext);
    const navigate = useNavigate();

    // Я забрал контроль над состоянием. Теперь данные настоящие.
    const [cartItems, setCartItems] = useState([]);
    const [pickupPoints, setPickupPoints] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);

    const [pickupPoint, setPickupPoint] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    // Я сам схожу на сервер и достану тебе всё, что нужно.
    useEffect(() => {
        if (!appState.isAuthenticated) {
            alert("Корзина только для своих. Сначала авторизуйся.");
            navigate("/login");
            return;
        }

        const token = localStorage.getItem("token");

        // Запрашиваю твою корзину
        fetch("/api/me/cart", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.cartItems) setCartItems(data.cartItems);
            })
            .catch((err) =>
                console.error("Я не смог загрузить твою корзину:", err),
            );

        // Запрашиваю ПВЗ
        fetch("/api/pickup-points")
            .then((res) => res.json())
            .then((data) => {
                if (data.pickupPoints) setPickupPoints(data.pickupPoints);
            })
            .catch((err) => console.error("Я не смог загрузить ПВЗ:", err));

        // Запрашиваю методы оплаты
        fetch("/api/payment-methods")
            .then((res) => res.json())
            .then((data) => {
                if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
            })
            .catch((err) =>
                console.error("Я не смог загрузить методы оплаты:", err),
            );
    }, [appState.isAuthenticated, navigate]);

    // Жестко извлекаем цену и картинку из ответа бэкенда
    const getPrice = (product) => {
        if (product && product.prices && product.prices.length > 0) {
            return parseFloat(product.prices[0].price);
        }
        return 0;
    };

    const getImagePath = (product) => {
        if (product && product.photos && product.photos.length > 0) {
            return `/${product.photos[0].filePath.replace(/\\/g, "/")}`;
        }
        return "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg";
    };

    const totalAmount = cartItems.reduce((sum, item) => {
        return sum + getPrice(item.product) * item.quantity;
    }, 0);

    const updateQuantity = async (cartItemId, currentQuantity, delta) => {
        const newQuantity = currentQuantity + delta;
        // Я не позволю ставить количество меньше 1. Хочешь удалить — нажимай крестик.
        if (newQuantity < 1) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/me/cart/${cartItemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (res.ok) {
                // Если я обновил базу, я обновлю и твой интерфейс
                setCartItems((prev) =>
                    prev.map((item) =>
                        item.cartItemId === cartItemId
                            ? { ...item, quantity: newQuantity }
                            : item,
                    ),
                );
            } else {
                const err = await res.json();
                alert(err.message || "Мой бэкенд отклонил это изменение.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/me/cart/${cartItemId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setCartItems((prev) =>
                    prev.filter((item) => item.cartItemId !== cartItemId),
                );
            } else {
                const err = await res.json();
                alert(err.message || "Я не смог удалить товар.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckout = async () => {
        if (!pickupPoint || !paymentMethod) {
            alert("Выбери пункт выдачи и способ оплаты. Не зли меня.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/me/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    pickupPointId: pickupPoint,
                    paymentMethodId: paymentMethod,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                alert("Заказ оформлен. Я проконтролирую его доставку.");
                setCartItems([]); // Я очищаю твою корзину, как сделал это на сервере
                navigate("/profile/orders"); // Иди в профиль, любуйся заказом
            } else {
                alert(result.message || "Ошибка оформления заказа.");
            }
        } catch (error) {
            console.error(error);
            alert("Сбой в системе.");
        }
    };

    return (
        <div className="cart-page-wrapper">
            <Header />
            <div className="cart-page-content">
                <div className="cart-items-section">
                    <h1 className="cart-title">Твоя корзина</h1>
                    {cartItems.length === 0 ? (
                        <p className="cart-empty">
                            Корзина пуста. Я жду, когда ты ее наполнишь.
                        </p>
                    ) : (
                        <div className="cart-items-list">
                            {cartItems.map((item) => {
                                const product = item.product;
                                const price = getPrice(product);
                                const image = getImagePath(product);

                                return (
                                    <div
                                        className="cart-item-card"
                                        key={item.cartItemId}
                                    >
                                        <img
                                            src={image}
                                            alt={product?.name}
                                            className="cart-item-img"
                                            onClick={() =>
                                                navigate(
                                                    `/p/${product.productId}`,
                                                )
                                            }
                                        />
                                        <div className="cart-item-info">
                                            <p className="cart-item-name">
                                                {product?.name}
                                            </p>
                                            <p className="cart-item-price">
                                                {price} ₽
                                            </p>
                                        </div>
                                        <div className="cart-item-controls">
                                            <div className="quantity-group">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.cartItemId,
                                                            item.quantity,
                                                            -1,
                                                        )
                                                    }
                                                >
                                                    -
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.cartItemId,
                                                            item.quantity,
                                                            1,
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                className="cart-item-delete"
                                                onClick={() =>
                                                    removeItem(item.cartItemId)
                                                }
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
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
                                {pickupPoints.map((p) => (
                                    <option
                                        key={p.pickupPointId}
                                        value={p.pickupPointId}
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
                                {paymentMethods.map((m) => (
                                    <option
                                        key={m.paymentMethodId}
                                        value={m.paymentMethodId}
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
                                cartItems.length === 0 ||
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
