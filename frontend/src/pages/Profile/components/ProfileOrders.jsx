import React, { useState, useEffect, useContext } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import { AppStateContext } from "../../../App";
import "../styles/profile-orders-styles.css";

function ProfileOrders() {
    const { appState } = useContext(AppStateContext);
    const [orders, setOrders] = useState([]);
    const [receiptCode, setReceiptCode] = useState("Загрузка...");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!appState.isAuthenticated) return;
        const token = localStorage.getItem("token");

        // Я достаю твои реальные заказы
        fetch("/api/me/orders", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.orders) setOrders(data.orders);
            })
            .catch((err) => console.error(err));

        // Я достаю твой личный код для получения
        fetch("/api/me/pickup-code", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.pickupCode) setReceiptCode(data.pickupCode.code);
            })
            .catch((err) => console.error(err));
    }, [appState.isAuthenticated]);

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    // Привожу статусы к цветам
    const getStatusCode = (status) => {
        if (status === "Новый") return "ready"; // Синий/Желтый
        if (status === "Завершен") return "delivered"; // Зеленый
        if (status === "Отменен") return "cancelled"; // Красный
        return "ready";
    };

    return (
        <section className="profile-orders-root">
            <div className="profile-orders-code-banner">
                <p className="profile-orders-code-label">
                    Код получения заказов
                </p>
                <p className="profile-orders-code-value">{receiptCode}</p>
            </div>

            <h2 className="profile-orders-header">История заказов</h2>

            <div className="profile-orders-list">
                {orders.length === 0 && (
                    <p style={{ color: "var(--color-dark-brown)" }}>
                        У тебя пока нет заказов.
                    </p>
                )}
                {orders.map((order) => (
                    <div
                        className="profile-order-card"
                        key={order.orderId}
                        onClick={() => handleOrderClick(order)}
                    >
                        <div className="profile-order-card-header">
                            <p className="profile-order-id">
                                Заказ №{order.orderId}
                            </p>
                            <p className="profile-order-date">
                                {formatDate(order.createdAt)}
                            </p>
                        </div>

                        <div className="profile-order-card-body">
                            <div className="profile-order-status-group">
                                <span
                                    className={`profile-order-status-dot bg-${getStatusCode(order.status)}`}
                                ></span>
                                <p className="profile-order-status-text">
                                    {order.status}
                                </p>
                            </div>
                            <p className="profile-order-amount">
                                {order.totalAmount} ₽
                            </p>
                        </div>

                        <div className="profile-order-card-hover-hint">
                            Посмотреть детали →
                        </div>
                    </div>
                ))}
            </div>

            <OrderDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />
        </section>
    );
}

export default ProfileOrders;
