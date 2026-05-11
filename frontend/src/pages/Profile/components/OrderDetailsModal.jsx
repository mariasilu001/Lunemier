import React from "react";
import ProductCard from "../../../components/ProductCard/ProductCard";
import "../styles/order-details-modal-styles.css";

function OrderDetailsModal({ isOpen, onClose, order }) {
    if (!isOpen || !order) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    const getStatusCode = (status) => {
        if (status === "Новый") return "ready";
        if (status === "Завершен") return "delivered";
        if (status === "Отменен") return "cancelled";
        return "ready";
    };

    return (
        <div className="order-details-modal-overlay" onClick={onClose}>
            <div
                className="order-details-modal-box"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="order-details-modal-header">
                    <p className="order-details-modal-title">
                        Заказ №{order.orderId}
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
                            className={`order-details-info-value status-${getStatusCode(order.status)}`}
                        >
                            {order.status}
                        </span>
                    </div>
                    <div className="order-details-info-row">
                        <span className="order-details-info-label">
                            Дата оформления:
                        </span>
                        <span className="order-details-info-value">
                            {formatDate(order.createdAt)}
                        </span>
                    </div>
                    <div className="order-details-info-row">
                        <span className="order-details-info-label">
                            Сумма заказа:
                        </span>
                        <span className="order-details-info-value amount">
                            {order.totalAmount} ₽
                        </span>
                    </div>
                </div>

                <div className="order-details-modal-separator"></div>
                <p className="order-details-products-title">Товары в заказе</p>

                <div className="order-details-products-grid">
                    {/* Я пробрасываю реальные товары из твоего заказа */}
                    {order.orderItems &&
                        order.orderItems.map((item) => (
                            <ProductCard
                                key={item.orderItemId}
                                product={item.product}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}

export default OrderDetailsModal;
