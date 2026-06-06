import React, { useState, useContext } from "react";
import { GlobalContext } from "../../../GlobalContext"; // НАША БАЗА
import AdminDictionaryModal from "./AdminDictionaryModal";
import "../styles/admin-dictionaries-styles.css";

function AdminDictionaries() {
    const { categories, sizes, pickupPoints, paymentMethods, setCategories, setSizes, setPickupPoints, setPaymentMethods } = useContext(GlobalContext);

    const [activeTab, setActiveTab] = useState("categories");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    const tabs = [
        { id: "categories", label: "Категории" },
        { id: "sizes", label: "Размеры" },
        { id: "pickup_points", label: "Пункты выдачи" },
        { id: "payment_methods", label: "Способы оплаты" },
    ];

    // Вычисляем текущие данные в зависимости от активной вкладки
    const getCurrentData = () => {
        if (activeTab === "categories") return categories || [];
        if (activeTab === "sizes") return sizes || [];
        if (activeTab === "pickup_points") return pickupPoints || [];
        if (activeTab === "payment_methods") return paymentMethods || [];
        return [];
    };

    const currentData = getCurrentData();

    const handleAdd = () => {
        setItemToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    // ЛОКАЛЬНОЕ УДАЛЕНИЕ (Жесткое и мягкое)
    const handleDelete = (id) => {
        const isSoftDelete = activeTab === "pickup_points";
        const message = isSoftDelete
            ? "Мягкое удаление: пометить этот пункт выдачи как закрытый?"
            : "Жесткое удаление: стереть эту запись из базы навсегда?";

        if (!window.confirm(message)) return;

        try {
            if (activeTab === "categories") {
                setCategories(prev => prev.filter(c => c._id !== id));
            } else if (activeTab === "sizes") {
                setSizes(prev => prev.filter(s => s._id !== id));
            } else if (activeTab === "pickup_points") {
                // Мягкое удаление: ставим deleted_at
                setPickupPoints(prev => prev.map(p => p._id === id ? { ...p, deleted_at: new Date().toISOString() } : p));
            } else if (activeTab === "payment_methods") {
                // Жесткое удаление метода оплаты
                setPaymentMethods(prev => prev.filter(m => m._id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const renderTableContent = () => {
        if (activeTab === "categories") {
            return currentData.map((item) => (
                <tr key={item._id}>
                    <td className="font-monospace">#{item._id}</td>
                    <td className="font-bold">{item.name}</td>
                    <td className="actions-cell">
                        <button className="admin-btn-text" onClick={() => handleEdit(item)}>Редактировать</button>
                        <button className="admin-btn-text-delete" onClick={() => handleDelete(item._id)}>Удалить</button>
                    </td>
                </tr>
            ));
        }
        if (activeTab === "sizes") {
            return currentData.map((item) => (
                <tr key={item._id}>
                    <td className="font-monospace">#{item._id}</td>
                    <td className="font-bold">{item.size_value}</td>
                    <td className="actions-cell">
                        <button className="admin-btn-text" onClick={() => handleEdit(item)}>Редактировать</button>
                        <button className="admin-btn-text-delete" onClick={() => handleDelete(item._id)}>Удалить</button>
                    </td>
                </tr>
            ));
        }
        if (activeTab === "payment_methods") {
            return currentData.map((item) => (
                <tr key={item._id}>
                    <td className="font-monospace">#{item._id}</td>
                    <td className="font-bold">{item.name}</td>
                    <td>
                        {item.is_active ? (
                            <span className="badge badge-active">Активен</span>
                        ) : (
                            <span className="badge badge-inactive">Отключен</span>
                        )}
                    </td>
                    <td className="actions-cell">
                        <button className="admin-btn-text" onClick={() => handleEdit(item)}>Редактировать</button>
                        <button className="admin-btn-text-delete" onClick={() => handleDelete(item._id)}>Удалить</button>
                    </td>
                </tr>
            ));
        }
        if (activeTab === "pickup_points") {
            return currentData.map((item) => (
                <tr key={item._id} className={item.deleted_at ? "deleted-row" : ""}>
                    <td className="font-monospace">#{item._id}</td>
                    <td>
                        <span className="font-bold">{item.city}</span>, ул. {item.street}, д. {item.building}
                    </td>
                    <td>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("ru-RU") : ""}
                    </td>
                    <td className="actions-cell">
                        <button className="admin-btn-text" onClick={() => handleEdit(item)} disabled={item.deleted_at}>
                            Редактировать
                        </button>
                        {!item.deleted_at && (
                            <button className="admin-btn-text-delete" onClick={() => handleDelete(item._id)}>Удалить</button>
                        )}
                        {item.deleted_at && (
                            <span className="deleted-stamp">Мертв ({new Date(item.deleted_at).toLocaleDateString("ru-RU")})</span>
                        )}
                    </td>
                </tr>
            ));
        }
    };

    return (
        <section className="admin-dict-root">
            <div className="admin-dict-header-row">
                <div>
                    <h2 className="admin-dict-header">Справочники</h2>
                    <p className="admin-dict-subtitle">Базовые константы системы</p>
                </div>
                <button className="admin-dict-add-btn" onClick={handleAdd}>+ Добавить запись</button>
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
                                <><th>Название</th><th>Статус</th></>
                            )}
                            {activeTab === "pickup_points" && (
                                <><th>Адрес</th><th>Создан</th></>
                            )}
                            <th style={{ width: "200px" }}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>{renderTableContent()}</tbody>
                </table>
                {currentData.length === 0 && <p className="admin-dict-empty">Таблица пуста.</p>}
            </div>

            {isModalOpen && (
                <AdminDictionaryModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    activeTab={activeTab}
                    itemToEdit={itemToEdit}
                />
            )}
        </section>
    );
}

export default AdminDictionaries;