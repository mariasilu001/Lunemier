import React, { useState, useContext } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import { AppStateContext } from "../../../App";
import { GlobalContext } from "../../../GlobalContext"; // Подключаем нашу базу
import { useNavigate } from "react-router-dom"; // Подключаем навигатор
import "../styles/profile-orders-styles.css";

function ProfileOrders() {
    // 1. ПОДТЯГИВАЕМ КОНТЕКСТЫ
    const { appState } = useContext(AppStateContext);
    const { orders, pickupCodes } = useContext(GlobalContext);
    const navigate = useNavigate();

    // Оставляем только нужные стейты (для модалки)
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. ЖЕСТКИЕ БАРЬЕРЫ ЗАЩИТЫ
    if (!orders) return null; // Ждем загрузки базы

    const userId = Number(localStorage.getItem("user_id"));
    if (!userId) {
        navigate("/login");
        return null; // Если нет ID, выгоняем на страницу логина
    }

    // 3. ВЫЧИСЛЯЕМЫЕ ДАННЫЕ (Без стейтов!)
    // Достаем только заказы текущего пользователя
    const myOrders = orders.filter((o) => o.user_id === userId);

    // Достаем код получения (если он есть в базе)
    const myCodeObj = pickupCodes
        ? pickupCodes.find((c) => c.user_id === userId)
        : null;
    const receiptCode = myCodeObj ? myCodeObj.code : "123-456"; // Заглушка, если кода нет

    // 4. ФУНКЦИИ-ПОМОЩНИКИ
    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    // Переводчик статусов (база отдает английский "paid", мы рисуем русский)
    const getStatusInfo = (status) => {
        switch (status) {
            case "paid":
            case "Новый":
                return { color: "ready", text: "Оплачен / Новый" };
            case "delivered":
            case "Завершен":
                return { color: "delivered", text: "Завершен" };
            case "cancelled":
            case "Отменен":
                return { color: "cancelled", text: "Отменен" };
            default:
                return { color: "ready", text: status };
        }
    };

    // 5. РЕНДЕР
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
                {myOrders.length === 0 && (
                    <p style={{ color: "var(--color-dark-brown)" }}>
                        У тебя пока нет заказов.
                    </p>
                )}
                {myOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                        <div
                            className="profile-order-card"
                            key={order._id}
                            onClick={() => handleOrderClick(order)}
                        >
                            <div className="profile-order-card-header">
                                <p className="profile-order-id">
                                    Заказ №{order._id}
                                </p>
                                <p className="profile-order-date">
                                    {formatDate(order.created_at)}
                                </p>
                            </div>

                            <div className="profile-order-card-body">
                                <div className="profile-order-status-group">
                                    <span
                                        className={`profile-order-status-dot bg-${statusInfo.color}`}
                                    ></span>
                                    <p className="profile-order-status-text">
                                        {statusInfo.text}
                                    </p>
                                </div>
                                <p className="profile-order-amount">
                                    {order.total_amount} ₽
                                </p>
                            </div>

                            <div className="profile-order-card-hover-hint">
                                Посмотреть детали →
                            </div>
                        </div>
                    );
                })}
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
