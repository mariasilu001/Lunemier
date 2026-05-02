import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppStateContext } from "../../App";
import Header from "../../layouts/MainLayout/components/Header";
import "./styles/cart-styles.css";

function CartPage() {
    const { appState, setAppState } = useContext(AppStateContext);
    const navigate = useNavigate();

    const [pickupPoint, setPickupPoint] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    const cartItems = appState.cart_items || [];
    const products = appState.products || [];
    const prices = appState.prices || [];

    const pickupPoints = (appState.pickup_points || []).filter(
        (p) => !p.deleted_at,
    );
    const paymentMethods = (appState.payment_methods || []).filter(
        (p) => p.is_active,
    );

    const displayItems = cartItems.map((item) => {
        const product =
            products.find((p) => p.product_id === item.product_id) || {};
        const activePriceObj = prices.find(
            (p) => p.product_id === item.product_id && p.is_active,
        );
        const price = activePriceObj ? activePriceObj.price : 0;
        const image =
            product.front_photo ||
            (product.gallery && product.gallery[0]) ||
            "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg";

        return {
            ...item,
            product_name: product.name,
            price: price,
            image: image,
        };
    });

    const totalAmount = displayItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const updateQuantity = (cartItemId, delta) => {
        setAppState((prev) => ({
            ...prev,
            cart_items: prev.cart_items.map((ci) => {
                if (ci.cart_item_id === cartItemId) {
                    const newQuantity = ci.quantity + delta;
                    return newQuantity > 0
                        ? { ...ci, quantity: newQuantity }
                        : ci;
                }
                return ci;
            }),
        }));
    };

    const removeItem = (cartItemId) => {
        setAppState((prev) => ({
            ...prev,
            cart_items: prev.cart_items.filter(
                (ci) => ci.cart_item_id !== cartItemId,
            ),
        }));
    };

    const handleCheckout = () => {
        alert("Заказ оформлен. Я проконтролирую его доставку.");
    };

    return (
        <div className="cart-page-wrapper">
            <Header />
            <div className="cart-page-content">
                <div className="cart-items-section">
                    <h1 className="cart-title">Твоя корзина</h1>
                    {displayItems.length === 0 ? (
                        <p className="cart-empty">
                            Корзина пуста. Я жду, когда ты ее наполнишь.
                        </p>
                    ) : (
                        <div className="cart-items-list">
                            {displayItems.map((item) => (
                                <div
                                    className="cart-item-card"
                                    key={item.cart_item_id}
                                >
                                    <img
                                        src={item.image}
                                        alt="product"
                                        className="cart-item-img"
                                        onClick={() =>
                                            navigate(`/p/${item.product_id}`)
                                        }
                                    />
                                    <div className="cart-item-info">
                                        <p className="cart-item-name">
                                            {item.product_name}
                                        </p>
                                        <p className="cart-item-price">
                                            {item.price} ₽
                                        </p>
                                    </div>
                                    <div className="cart-item-controls">
                                        <div className="quantity-group">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.cart_item_id,
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
                                                        item.cart_item_id,
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
                                                removeItem(item.cart_item_id)
                                            }
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                                        key={p.pickup_point_id}
                                        value={p.pickup_point_id}
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
                                        key={m.payment_method_id}
                                        value={m.payment_method_id}
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
                                    {totalAmount} ₽
                                </span>
                            </div>
                        </div>

                        <button
                            className="checkout-submit-btn"
                            disabled={
                                displayItems.length === 0 ||
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
