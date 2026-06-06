import React, { useState, useEffect, useContext } from "react";
import ProductCard from "../../../components/ProductCard/ProductCard";
import { GlobalContext } from "../../../GlobalContext"; // НАША БАЗА
import "../styles/admin-orders-styles.css";

function AdminOrderModal({ isOpen, onClose, order, onStatusChange }) {
    // Подтягиваем всё, что нужно для расшифровки ID
    const { products, users, pickupPoints, paymentMethods } =
        useContext(GlobalContext);

    const [localStatus, setLocalStatus] = useState("");

    useEffect(() => {
        if (order) {
            setLocalStatus(
                order.status === "paid"
                    ? "Собирается"
                    : order.status === "delivered"
                      ? "Получен"
                      : order.status === "cancelled"
                        ? "Отменен"
                        : order.status,
            );
        }
    }, [order, isOpen]);

    // Жесткий барьер
    if (!isOpen || !order || !products || !users) return null;

    // Расшифровываем ID в человеческие названия (Связь таблиц)
    const buyer = users.find((u) => u._id === order.user_id);
    const pickup = pickupPoints.find((p) => p._id === order.pickup_point_id);
    const payment = paymentMethods.find(
        (m) => m._id === order.payment_method_id,
    );

    // Подготовка отображаемых данных
    const buyerName = buyer ? buyer.username : "Неизвестный покупатель";
    const pickupStr = pickup
        ? `г. ${pickup.city}, ул. ${pickup.street}, д. ${pickup.building}`
        : "Пункт удален";
    const paymentStr = payment ? payment.name : "Неизвестный метод";
    const orderDate = new Date(order.created_at).toLocaleString("ru-RU");

    const statuses = [
        "Создан",
        "Собирается",
        "Готов к выдаче",
        "Получен",
        "Отменен",
    ];

    const handleSave = () => {
        // Если статус на русском, мы можем так его и сохранить, либо перевести в англ (но сохраним как есть для простоты)
        onStatusChange(order._id, localStatus);
        onClose();
    };

    return (
        <div className="admin-order-modal-overlay" onClick={onClose}>
            <div
                className="admin-order-modal-box"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-order-modal-header">
                    <div>
                        <h2>Заказ #{order._id}</h2>
                        <p className="admin-order-modal-subtitle">
                            Покупатель: {buyerName}
                        </p>
                    </div>
                    <button
                        className="admin-order-modal-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="admin-order-modal-body">
                    <div className="admin-order-info-grid">
                        <div className="admin-order-info-block">
                            <span className="info-label">Дата оформления</span>
                            <span className="info-value">{orderDate}</span>
                        </div>
                        <div className="admin-order-info-block">
                            <span className="info-label">Сумма заказа</span>
                            <span className="info-value amount">
                                {order.total_amount} ₽
                            </span>
                        </div>
                        <div className="admin-order-info-block full-width">
                            <span className="info-label">Пункт выдачи</span>
                            <span className="info-value">{pickupStr}</span>
                        </div>
                        <div className="admin-order-info-block full-width">
                            <span className="info-label">Способ оплаты</span>
                            <span className="info-value">{paymentStr}</span>
                        </div>
                    </div>

                    <div className="admin-order-status-control">
                        <label>Текущий статус заказа:</label>
                        <select
                            value={localStatus}
                            onChange={(e) => setLocalStatus(e.target.value)}
                            className="status-select"
                        >
                            {statuses.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-order-separator"></div>

                    <h3 className="admin-order-items-title">
                        Товары в заказе ({order.order_items?.length || 0})
                    </h3>

                    <div className="admin-order-items-grid">
                        {order.order_items &&
                            order.order_items.map((item, index) => {
                                // ИЩЕМ РЕАЛЬНЫЙ ТОВАР
                                const realProduct = products.find(
                                    (p) => p._id === item.product_id,
                                );

                                // Защита от удаленных товаров
                                if (!realProduct) return null;

                                return (
                                    <div
                                        key={index}
                                        className="admin-order-item-wrapper"
                                    >
                                        {/* Передаем реальный продукт в карточку */}
                                        <ProductCard product={realProduct} />
                                        <div className="admin-order-item-meta">
                                            <p className="item-name">
                                                {realProduct.name}
                                            </p>
                                            <p className="item-details">
                                                {item.quantity} шт. ×{" "}
                                                {item.price_snapshot} ₽
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                <div className="admin-order-modal-footer">
                    <button className="admin-btn-cancel" onClick={onClose}>
                        Отмена
                    </button>
                    <button
                        className="admin-btn-save"
                        onClick={handleSave}
                        disabled={localStatus === order.status}
                    >
                        Сохранить изменения
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminOrderModal;
