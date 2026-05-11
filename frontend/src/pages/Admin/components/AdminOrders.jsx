import React, { useState, useEffect } from "react";
import AdminOrderModal from "./AdminOrderModal";
import "../styles/admin-orders-styles.css";

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("/api/admin/orders", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.orders) setOrders(data.orders);
            })
            .catch((err) => console.error("Ошибка загрузки заказов:", err));
    }, []);

    const handleOpenDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                // Если я разрешил статус на бэкенде, обновляю список
                setOrders((prev) =>
                    prev.map((o) =>
                        o.order_id === orderId
                            ? { ...o, status: newStatus }
                            : o,
                    ),
                );
            } else {
                const err = await res.json();
                alert(err.message || "Ошибка обновления статуса.");
            }
        } catch (error) {
            console.error(error);
        }
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
                    <p className="admin-orders-subtitle">
                        Контроль логистики и продаж ({orders.length} заказов)
                    </p>
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
                                <td className="font-monospace">
                                    #{order.order_id}
                                </td>
                                <td className="font-bold">{order.username}</td>
                                <td>{order.order_date}</td>
                                <td>{getStatusBadge(order.status)}</td>
                                <td className="font-bold">
                                    {order.total_amount} ₽
                                </td>
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
                // Прокидываем функцию, чтобы модалка могла менять статус
                onStatusChange={handleStatusChange}
            />
        </section>
    );
}

export default AdminOrders;
