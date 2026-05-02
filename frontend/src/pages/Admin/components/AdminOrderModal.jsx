import React, { useState, useEffect } from "react";
import ProductCard from "../../../components/ProductCard/ProductCard";
import "../styles/admin-orders-styles.css";

function AdminOrderModal({ isOpen, onClose, order, onStatusChange }) {
    const [localStatus, setLocalStatus] = useState("");

    useEffect(() => {
        if (order) {
            setLocalStatus(order.status);
        }
    }, [order, isOpen]);

    if (!isOpen || !order) return null;

    const statuses = ["Создан", "Собирается", "Готов к выдаче", "Получен", "Отменен"];

    const handleSave = () => {
        onStatusChange(order.order_id, localStatus);
        onClose();
    };

    return (
        <div className="admin-order-modal-overlay" onClick={onClose}>
            <div className="admin-order-modal-box" onClick={e => e.stopPropagation()}>
                <div className="admin-order-modal-header">
                    <div>
                        <h2>Заказ #{order.order_id}</h2>
                        <p className="admin-order-modal-subtitle">Покупатель: {order.username}</p>
                    </div>
                    <button className="admin-order-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="admin-order-modal-body">
                    <div className="admin-order-info-grid">
                        <div className="admin-order-info-block">
                            <span className="info-label">Дата оформления</span>
                            <span className="info-value">{order.order_date}</span>
                        </div>
                        <div className="admin-order-info-block">
                            <span className="info-label">Сумма заказа</span>
                            <span className="info-value amount">{order.total_amount} ₽</span>
                        </div>
                        <div className="admin-order-info-block full-width">
                            <span className="info-label">Пункт выдачи</span>
                            <span className="info-value">{order.pickup_point}</span>
                        </div>
                        <div className="admin-order-info-block full-width">
                            <span className="info-label">Способ оплаты</span>
                            <span className="info-value">{order.payment_method}</span>
                        </div>
                    </div>

                    <div className="admin-order-status-control">
                        <label>Текущий статус заказа:</label>
                        <select 
                            value={localStatus} 
                            onChange={(e) => setLocalStatus(e.target.value)}
                            className={`status-select status-${localStatus.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                            {statuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-order-separator"></div>

                    <h3 className="admin-order-items-title">Товары в заказе ({order.items?.length || 0})</h3>
                    
                    <div className="admin-order-items-grid">
                        {order.items && order.items.map((item, index) => (
                            <div key={index} className="admin-order-item-wrapper">
                                <ProductCard />
                                <div className="admin-order-item-meta">
                                    <p className="item-name">{item.name}</p>
                                    <p className="item-details">{item.quantity} шт. × {item.price} ₽</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-order-modal-footer">
                    <button className="admin-btn-cancel" onClick={onClose}>Отмена</button>
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