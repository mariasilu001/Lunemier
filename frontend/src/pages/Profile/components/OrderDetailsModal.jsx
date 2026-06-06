import React, { useContext } from "react";
import ProductCard from "../../../components/ProductCard/ProductCard";
import { GlobalContext } from "../../../GlobalContext"; // Подключаем базу данных
import "../styles/order-details-modal-styles.css";

function OrderDetailsModal({ isOpen, onClose, order }) {
    // 1. Достаем продукты из нашего монолита
    const { products } = useContext(GlobalContext);

    // Жесткий барьер
    if (!isOpen || !order) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    // 2. Правильный переводчик статусов
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

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="order-details-modal-overlay" onClick={onClose}>
            <div
                className="order-details-modal-box"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="order-details-modal-header">
                    <p className="order-details-modal-title">
                        {/* Исправлен ключ на _id */}
                        Заказ №{order._id}
                    </p>
                    <button
                        className="order-details-modal-close-btn"
                        onClick={onClose}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z" />
                        </svg>
                    </button>
                </div>

                <div className="order-details-modal-info-group">
                    <div className="order-details-info-row">
                        <span className="order-details-info-label">
                            Статус:
                        </span>
                        <span
                            className={`order-details-info-value status-${statusInfo.color}`}
                        >
                            {statusInfo.text}
                        </span>
                    </div>
                    <div className="order-details-info-row">
                        <span className="order-details-info-label">
                            Дата оформления:
                        </span>
                        <span className="order-details-info-value">
                            {/* Исправлен ключ на created_at */}
                            {formatDate(order.created_at)}
                        </span>
                    </div>
                    <div className="order-details-info-row">
                        <span className="order-details-info-label">
                            Сумма заказа:
                        </span>
                        <span className="order-details-info-value amount">
                            {/* Исправлен ключ на total_amount */}
                            {order.total_amount} ₽
                        </span>
                    </div>
                </div>

                <div className="order-details-modal-separator"></div>
                <p className="order-details-products-title">Товары в заказе</p>

                <div className="order-details-products-grid">
                    {/* 3. Ищем реальные продукты по ID из заказа */}
                    {order.order_items &&
                        products &&
                        order.order_items.map((item, index) => {
                            // Находим полный объект товара
                            const productData = products.find(
                                (p) => p._id === item.product_id,
                            );

                            // Защита: если товар был удален из магазина, просто не рисуем его, чтобы не сломать сайт
                            if (!productData) return null;

                            return (
                                <>
                                    <ProductCard
                                        // Уникальный ключ из ID заказа и ID товара
                                        key={`${order._id}-${item.product_id}-${index}`}
                                        product={productData}
                                    />
                                    {/*<p>Количество: {item.quantity}</p>*/}
                                </>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

export default OrderDetailsModal;
