import React, { useState, useEffect } from "react";
import AdminDictionaryModal from "./AdminDictionaryModal";
import "../styles/admin-dictionaries-styles.css";

function AdminDictionaries() {
    const [activeTab, setActiveTab] = useState("categories");
    const [currentData, setCurrentData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    const tabs = [
        { id: "categories", label: "Категории" },
        { id: "sizes", label: "Размеры" },
        { id: "pickup_points", label: "Пункты выдачи" },
        { id: "payment_methods", label: "Способы оплаты" },
    ];

    const fetchData = () => {
        const token = localStorage.getItem("token");
        let url = "";

        if (activeTab === "categories") url = "/api/categories";
        else if (activeTab === "sizes") url = "/api/sizes";
        else if (activeTab === "pickup_points")
            url = "/api/admin/pickup-points/all";
        else if (activeTab === "payment_methods")
            url = "/api/admin/payment-methods/all";

        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                if (!res.ok) throw new Error(`Ошибка HTTP: ${res.status}`);
                return res.json();
            })
            .then((result) => {
                if (activeTab === "categories")
                    setCurrentData(result.categories || []);
                else if (activeTab === "sizes")
                    setCurrentData(result.sizes || []);
                else if (activeTab === "pickup_points")
                    setCurrentData(
                        result.pickupPoints || result.pickup_points || [],
                    );
                else if (activeTab === "payment_methods")
                    setCurrentData(
                        result.paymentMethods || result.payment_methods || [],
                    );
            })
            .catch((err) => console.error("Ошибка загрузки справочника:", err));
    };

    useEffect(() => {
        setCurrentData([]); // Очищаем таблицу перед загрузкой новых данных
        fetchData();
    }, [activeTab]);

    const handleAdd = () => {
        setItemToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const isSoftDelete = activeTab === "pickup_points";
        const message = isSoftDelete
            ? "Мягкое удаление: пометить этот пункт выдачи как закрытый?"
            : "Жесткое удаление: стереть эту запись из базы навсегда?";

        if (!window.confirm(message)) return;

        try {
            const token = localStorage.getItem("token");
            let url = "";

            if (activeTab === "categories") url = `/api/admin/categories/${id}`;
            else if (activeTab === "sizes") url = `/api/admin/sizes/${id}`;
            else if (activeTab === "pickup_points")
                url = `/api/admin/pickup-points/${id}`;
            else if (activeTab === "payment_methods")
                url = `/api/admin/payment-methods/${id}`;

            const res = await fetch(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                fetchData(); // Сервер удалил - фронт обновляется
            } else {
                const err = await res.json();
                alert(err.message || "Ошибка сервера");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleModalClose = (wasUpdated) => {
        setIsModalOpen(false);
        if (wasUpdated) fetchData();
    };

    const renderTableContent = () => {
        if (activeTab === "categories") {
            return currentData.map((item) => {
                // Поддержка как snake_case, так и camelCase от бэкенда
                const id = item.category_id || item.categoryId;
                return (
                    <tr key={id}>
                        <td className="font-monospace">#{id}</td>
                        <td className="font-bold">{item.name}</td>
                        <td className="actions-cell">
                            <button
                                className="admin-btn-text"
                                onClick={() => handleEdit(item)}
                            >
                                Редактировать
                            </button>
                            <button
                                className="admin-btn-text-delete"
                                onClick={() => handleDelete(id)}
                            >
                                Удалить
                            </button>
                        </td>
                    </tr>
                );
            });
        }
        if (activeTab === "sizes") {
            return currentData.map((item) => {
                const id = item.size_id || item.sizeId;
                const value = item.size_value || item.sizeValue;
                return (
                    <tr key={id}>
                        <td className="font-monospace">#{id}</td>
                        <td className="font-bold">{value}</td>
                        <td className="actions-cell">
                            <button
                                className="admin-btn-text"
                                onClick={() => handleEdit(item)}
                            >
                                Редактировать
                            </button>
                            <button
                                className="admin-btn-text-delete"
                                onClick={() => handleDelete(id)}
                            >
                                Удалить
                            </button>
                        </td>
                    </tr>
                );
            });
        }
        if (activeTab === "payment_methods") {
            return currentData.map((item) => {
                const id = item.payment_method_id || item.paymentMethodId;
                const isActive =
                    item.is_active !== undefined
                        ? item.is_active
                        : item.isActive;
                return (
                    <tr key={id}>
                        <td className="font-monospace">#{id}</td>
                        <td className="font-bold">{item.name}</td>
                        <td>
                            {isActive ? (
                                <span className="badge badge-active">
                                    Активен
                                </span>
                            ) : (
                                <span className="badge badge-inactive">
                                    Отключен
                                </span>
                            )}
                        </td>
                        <td className="actions-cell">
                            <button
                                className="admin-btn-text"
                                onClick={() => handleEdit(item)}
                            >
                                Редактировать
                            </button>
                            <button
                                className="admin-btn-text-delete"
                                onClick={() => handleDelete(id)}
                            >
                                Удалить
                            </button>
                        </td>
                    </tr>
                );
            });
        }
        if (activeTab === "pickup_points") {
            return currentData.map((item) => {
                const id = item.pickup_point_id || item.pickupPointId;
                const deletedAt = item.deleted_at || item.deletedAt;
                const createdAt = item.created_at || item.createdAt;
                return (
                    <tr key={id} className={deletedAt ? "deleted-row" : ""}>
                        <td className="font-monospace">#{id}</td>
                        <td>
                            <span className="font-bold">{item.city}</span>, ул.{" "}
                            {item.street}, д. {item.building}
                        </td>
                        <td>
                            {createdAt
                                ? new Date(createdAt).toLocaleDateString(
                                      "ru-RU",
                                  )
                                : ""}
                        </td>
                        <td className="actions-cell">
                            <button
                                className="admin-btn-text"
                                onClick={() => handleEdit(item)}
                                disabled={deletedAt}
                            >
                                Редактировать
                            </button>
                            {!deletedAt && (
                                <button
                                    className="admin-btn-text-delete"
                                    onClick={() => handleDelete(id)}
                                >
                                    Удалить
                                </button>
                            )}
                            {deletedAt && (
                                <span className="deleted-stamp">
                                    Мертв (
                                    {new Date(deletedAt).toLocaleDateString(
                                        "ru-RU",
                                    )}
                                    )
                                </span>
                            )}
                        </td>
                    </tr>
                );
            });
        }
    };

    return (
        <section className="admin-dict-root">
            <div className="admin-dict-header-row">
                <div>
                    <h2 className="admin-dict-header">Справочники</h2>
                    <p className="admin-dict-subtitle">
                        Базовые константы системы
                    </p>
                </div>
                <button className="admin-dict-add-btn" onClick={handleAdd}>
                    + Добавить запись
                </button>
            </div>

            <div className="admin-dict-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`admin-dict-tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="admin-dict-table-wrapper">
                <table className="admin-dict-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            {activeTab === "categories" && <th>Название</th>}
                            {activeTab === "sizes" && <th>Размер</th>}
                            {activeTab === "payment_methods" && (
                                <>
                                    <th>Название</th>
                                    <th>Статус</th>
                                </>
                            )}
                            {activeTab === "pickup_points" && (
                                <>
                                    <th>Адрес</th>
                                    <th>Создан</th>
                                </>
                            )}
                            <th style={{ width: "200px" }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>{renderTableContent()}</tbody>
                </table>
                {currentData.length === 0 && (
                    <p className="admin-dict-empty">
                        Таблица пуста.
                    </p>
                )}
            </div>

            <AdminDictionaryModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                activeTab={activeTab}
                itemToEdit={itemToEdit}
            />
        </section>
    );
}

export default AdminDictionaries;
