import React, { useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import "../styles/profile-orders-styles.css";

function ProfileOrders() {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const receiptCode = "8492";

    const mockOrders = [
        {
            order_id: "LM-99482",
            status: "Ожидает в пункте выдачи",
            statusCode: "ready", 
            statusDate: null,
            order_date: "17.04.2026",
            total_amount: "4500.00",
            productsCount: 1,
        },
        {
            order_id: "LM-99310",
            status: "Получен",
            statusCode: "delivered",
            statusDate: "12.04.2026",
            order_date: "09.04.2026",
            total_amount: "12400.00",
            productsCount: 3,
        },
        {
            order_id: "LM-98102",
            status: "Отменен",
            statusCode: "cancelled",
            statusDate: "02.04.2026",
            order_date: "01.04.2026",
            total_amount: "3200.00",
            productsCount: 1,
        }
    ];

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <section className="profile-orders-root">
            <div className="profile-orders-code-banner">
                <p className="profile-orders-code-label">Код получения заказов</p>
                <p className="profile-orders-code-value">{receiptCode}</p>
            </div>

            <h2 className="profile-orders-header">История заказов</h2>

            <div className="profile-orders-list">
                {mockOrders.map((order) => (
                    <div 
                        className="profile-order-card" 
                        key={order.order_id}
                        onClick={() => handleOrderClick(order)}
                    >
                        <div className="profile-order-card-header">
                            <p className="profile-order-id">Заказ №{order.order_id}</p>
                            <p className="profile-order-date">{order.order_date}</p>
                        </div>
                        
                        <div className="profile-order-card-body">
                            <div className="profile-order-status-group">
                                <span className={`profile-order-status-dot bg-${order.statusCode}`}></span>
                                <p className="profile-order-status-text">
                                    {order.status}
                                    {order.statusDate && <span className="profile-order-status-date"> ({order.statusDate})</span>}
                                </p>
                            </div>
                            <p className="profile-order-amount">{order.total_amount} ₽</p>
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