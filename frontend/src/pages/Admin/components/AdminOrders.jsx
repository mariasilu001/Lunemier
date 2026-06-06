import React, { useState, useContext } from "react";
import { GlobalContext } from "../../../GlobalContext"; // НАША БАЗА
import AdminOrderModal from "./AdminOrderModal";
import "../styles/admin-orders-styles.css";

function AdminOrders() {
    // Вытягиваем заказы, пользователей и функцию обновления из памяти
    const { orders, setOrders, users } = useContext(GlobalContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Жесткий барьер загрузки
    if (!orders || !users) return null;

    const handleOpenDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // ЛОКАЛЬНОЕ ОБНОВЛЕНИЕ СТАТУСА
    const handleStatusChange = (orderId, newStatus) => {
        try {
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId
                        ? {
                              ...o,
                              status: newStatus,
                              updated_at: new Date().toISOString(),
                          }
                        : o,
                ),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusBadge = (status) => {
        let badgeClass = "badge-default";
        if (status === "Создан" || status === "Новый")
            badgeClass = "badge-created";
        if (status === "Собирается" || status === "paid")
            badgeClass = "badge-processing";
        if (status === "Готов к выдаче") badgeClass = "badge-ready";
        if (
            status === "Получен" ||
            status === "Завершен" ||
            status === "delivered"
        )
            badgeClass = "badge-delivered";
        if (status === "Отменен" || status === "cancelled")
            badgeClass = "badge-cancelled";

        // Перевод для красивого отображения (если в базе английский статус)
        const displayStatus =
            status === "paid"
                ? "Собирается"
                : status === "delivered"
                  ? "Получен"
                  : status === "cancelled"
                    ? "Отменен"
                    : status;

        return <span className={`badge ${badgeClass}`}>{displayStatus}</span>;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
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
                        {/* Сортируем заказы от свежих к старым перед отрисовкой */}
                        {[...orders]
                            .sort(
                                (a, b) =>
                                    new Date(b.created_at) -
                                    new Date(a.created_at),
                            )
                            .map((order) => {
                                // Находим юзера по ID, чтобы вывести его username
                                const buyer = users.find(
                                    (u) => u._id === order.user_id,
                                );

                                return (
                                    <tr key={order._id}>
                                        <td className="font-monospace">
                                            #{order._id}
                                        </td>
                                        <td className="font-bold">
                                            {buyer ? buyer.username : "Удален"}
                                        </td>
                                        <td>{formatDate(order.created_at)}</td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td className="font-bold">
                                            {order.total_amount} ₽
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="admin-btn-text"
                                                onClick={() =>
                                                    handleOpenDetails(order)
                                                }
                                            >
                                                Детали / Изменить
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AdminOrderModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    order={selectedOrder}
                    onStatusChange={handleStatusChange}
                />
            )}
        </section>
    );
}

export default AdminOrders;
