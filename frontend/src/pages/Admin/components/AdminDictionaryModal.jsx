import React, { useState, useEffect } from "react";
import "../styles/admin-dictionaries-styles.css";

function AdminDictionaryModal({
    isOpen,
    onClose,
    onSave,
    activeTab,
    itemToEdit,
}) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setFormData(itemToEdit);
            } else {
                if (activeTab === "categories") setFormData({ name: "" });
                if (activeTab === "sizes") setFormData({ size_value: "" });
                if (activeTab === "payment_methods")
                    setFormData({ name: "", is_active: true });
                if (activeTab === "pickup_points")
                    setFormData({ city: "", street: "", building: "" });
            }
        }
    }, [isOpen, itemToEdit, activeTab]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const titles = {
        categories: "категории",
        sizes: "размера",
        payment_methods: "способа оплаты",
        pickup_points: "пункта выдачи",
    };

    return (
        <div className="admin-dict-modal-overlay" onClick={onClose}>
            <div
                className="admin-dict-modal-box"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-dict-modal-header">
                    <h2>
                        {itemToEdit ? "Редактирование" : "Создание"}{" "}
                        {titles[activeTab]}
                    </h2>
                    <button
                        className="admin-dict-modal-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <form className="admin-dict-form" onSubmit={handleSubmit}>
                    {activeTab === "categories" && (
                        <div className="admin-dict-input-group">
                            <label>Название категории</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ""}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}

                    {activeTab === "sizes" && (
                        <div className="admin-dict-input-group">
                            <label>Значение размера (size_value)</label>
                            <input
                                type="text"
                                name="size_value"
                                value={formData.size_value || ""}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    )}

                    {activeTab === "payment_methods" && (
                        <>
                            <div className="admin-dict-input-group">
                                <label>Название способа оплаты</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <label className="admin-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active || false}
                                    onChange={handleInputChange}
                                />
                                <span className="admin-checkbox-custom"></span>
                                Активен (is_active)
                            </label>
                        </>
                    )}

                    {activeTab === "pickup_points" && (
                        <>
                            <div className="admin-dict-input-group">
                                <label>Город (city)</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-dict-input-group">
                                <label>Улица (street)</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="admin-dict-input-group">
                                <label>Здание (building)</label>
                                <input
                                    type="text"
                                    name="building"
                                    value={formData.building || ""}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="admin-dict-modal-footer">
                        <button
                            type="button"
                            className="admin-btn-cancel"
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button type="submit" className="admin-btn-save">
                            {itemToEdit ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminDictionaryModal;
