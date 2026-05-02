import React, { useState, useContext } from "react";
import { AppStateContext } from "../../../App";
import AdminOrderModal from "./AdminOrderModal";
import "../styles/admin-orders-styles.css";

function AdminOrders() {
    const { appState, setAppState } = useContext(AppStateContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const orders = appState.orders || [];

    const handleOpenDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleStatusChange = (orderId, newStatus) => {
        setAppState(prev => ({
            ...prev,
            orders: prev.orders.map(o => 
                o.order_id === orderId ? { ...o, status: newStatus } : o
            )
        }));
    };

    const getStatusBadge = (status) => {
        let badgeClass = "badge-default";
        if (status === "Создан") badgeClass = "badge-created";
        if (status === "Собирается") badgeClass = "badge-processing";
        if (status === "Готов к выдаче") badgeClass = "badge-ready";
        if (status === "Получен") badgeClass = "badge-delivered";
        if (status === "Отменен") badgeClass = "badge-cancelled";

        return <span className={`badge ${badgeClass}`}>{status}</span>;
    };

    return (
        <section className="admin-orders-root">
            <div className="admin-orders-header-row">
                <div>
                    <h2 className="admin-orders-header">Управление заказами</h2>
                    <p className="admin-orders-subtitle">Контроль логистики и продаж ({orders.length} заказов)</p>
                </div>
            </div>

            <div className="admin-orders-table-wrapper">
                <table className="admin-orders-table">
                    <thead>
                        <tr>
                            <th>№ Заказа</th>
                            <th>Покупатель</th>
                            <th>Дата</th>
                            <th>Статус</th>
                            <th>Сумма</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.order_id}>
                                <td className="font-monospace">#{order.order_id}</td>
                                <td className="font-bold">{order.username}</td>
                                <td>{order.order_date}</td>
                                <td>{getStatusBadge(order.status)}</td>
                                <td className="font-bold">{order.total_amount} ₽</td>
                                <td className="actions-cell">
                                    <button 
                                        className="admin-btn-text" 
                                        onClick={() => handleOpenDetails(order)}
                                    >
                                        Детали / Изменить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AdminOrderModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                order={selectedOrder}
                onStatusChange={handleStatusChange}
            />
        </section>
    );
}

export default AdminOrders;