import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import { GlobalContext } from "../../../GlobalContext"; // НАША БАЗА

function AdminDictionaryModal({ isOpen, onClose, itemToEdit, activeTab }) {
    const { setCategories, setSizes, setPickupPoints, setPaymentMethods } =
        useContext(GlobalContext);

    const [formData, setFormData] = useState({
        name: "",
        size_value: "",
        city: "",
        street: "",
        building: "",
        is_active: true,
    });

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                // Подтягиваем данные. Используем правильные ключи из БД
                setFormData({
                    name: itemToEdit.name || "",
                    size_value: itemToEdit.size_value || "",
                    city: itemToEdit.city || "",
                    street: itemToEdit.street || "",
                    building: itemToEdit.building || "",
                    is_active:
                        itemToEdit.is_active !== undefined
                            ? itemToEdit.is_active
                            : true,
                });
            } else {
                setFormData({
                    name: "",
                    size_value: "",
                    city: "",
                    street: "",
                    building: "",
                    is_active: true,
                });
            }
        }
    }, [isOpen, itemToEdit]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ЛОКАЛЬНОЕ СОХРАНЕНИЕ
    const handleSave = (e) => {
        e.preventDefault();

        try {
            const newItemId = Date.now(); // Генерируем уникальный ID для новой записи

            if (activeTab === "categories") {
                if (itemToEdit) {
                    setCategories((prev) =>
                        prev.map((c) =>
                            c._id === itemToEdit._id
                                ? { ...c, name: formData.name }
                                : c,
                        ),
                    );
                } else {
                    setCategories((prev) => [
                        ...prev,
                        { _id: newItemId, name: formData.name },
                    ]);
                }
            } else if (activeTab === "sizes") {
                if (itemToEdit) {
                    setSizes((prev) =>
                        prev.map((s) =>
                            s._id === itemToEdit._id
                                ? { ...s, size_value: formData.size_value }
                                : s,
                        ),
                    );
                } else {
                    setSizes((prev) => [
                        ...prev,
                        { _id: newItemId, size_value: formData.size_value },
                    ]);
                }
            } else if (activeTab === "pickup_points") {
                const pData = {
                    city: formData.city,
                    street: formData.street,
                    building: formData.building,
                };
                if (itemToEdit) {
                    setPickupPoints((prev) =>
                        prev.map((p) =>
                            p._id === itemToEdit._id ? { ...p, ...pData } : p,
                        ),
                    );
                } else {
                    setPickupPoints((prev) => [
                        ...prev,
                        {
                            _id: newItemId,
                            ...pData,
                            created_at: new Date().toISOString(),
                            deleted_at: null,
                        },
                    ]);
                }
            } else if (activeTab === "payment_methods") {
                const mData = {
                    name: formData.name,
                    is_active: formData.is_active,
                };
                if (itemToEdit) {
                    setPaymentMethods((prev) =>
                        prev.map((m) =>
                            m._id === itemToEdit._id ? { ...m, ...mData } : m,
                        ),
                    );
                } else {
                    setPaymentMethods((prev) => [
                        ...prev,
                        { _id: newItemId, ...mData },
                    ]);
                }
            }

            onClose(); // Закрываем, таблицы обновятся сами
        } catch (error) {
            console.error(error);
        }
    };

    const getTitle = () => {
        const action = itemToEdit ? "Редактирование:" : "Добавление:";
        if (activeTab === "categories") return `${action} Категория`;
        if (activeTab === "sizes") return `${action} Размер`;
        // ИСПРАВЛЕНА ОШИБКА РЕГИСТРА
        if (activeTab === "pickup_points") return `${action} Пункт выдачи`;
        if (activeTab === "payment_methods") return `${action} Метод оплаты`;
        return "Справочник";
    };

    return ReactDOM.createPortal(
        <div
            className="admin-product-modal-overlay"
            onClick={() => onClose()}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(89, 69, 69, 0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                backdropFilter: "blur(4px)",
            }}
        >
            <div
                className="admin-product-modal-box"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "var(--color-cream)",
                    padding: "30px",
                    borderRadius: "12px",
                    width: "450px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    border: "1px solid var(--color-accent-light)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "25px",
                    }}
                >
                    <h3
                        style={{
                            color: "var(--color-dark-brown)",
                            margin: 0,
                            fontSize: "20px",
                        }}
                    >
                        {getTitle()}
                    </h3>
                    <button
                        onClick={() => onClose()}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "20px",
                            cursor: "pointer",
                            color: "var(--color-dark-brown)",
                        }}
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleSave}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                    }}
                >
                    {/* ИСПРАВЛЕНА ОШИБКА РЕГИСТРА */}
                    {(activeTab === "categories" ||
                        activeTab === "payment_methods") && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                            }}
                        >
                            <label
                                style={{
                                    color: "var(--color-dark-brown)",
                                    fontWeight: "600",
                                }}
                            >
                                Название
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                style={{
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--color-accent-medium)",
                                    backgroundColor: "var(--color-white)",
                                    outline: "none",
                                    color: "var(--color-dark-brown)",
                                }}
                            />
                        </div>
                    )}

                    {activeTab === "sizes" && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                            }}
                        >
                            <label
                                style={{
                                    color: "var(--color-dark-brown)",
                                    fontWeight: "600",
                                }}
                            >
                                Значение размера
                            </label>
                            <input
                                type="text"
                                name="size_value"
                                value={formData.size_value}
                                onChange={handleInputChange}
                                required
                                style={{
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--color-accent-medium)",
                                    backgroundColor: "var(--color-white)",
                                    outline: "none",
                                    color: "var(--color-dark-brown)",
                                }}
                            />
                        </div>
                    )}

                    {/* ИСПРАВЛЕНА ОШИБКА РЕГИСТРА */}
                    {activeTab === "pickup_points" && (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "5px",
                                }}
                            >
                                <label
                                    style={{
                                        color: "var(--color-dark-brown)",
                                        fontWeight: "600",
                                    }}
                                >
                                    Город
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--color-accent-medium)",
                                        backgroundColor: "var(--color-white)",
                                        outline: "none",
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "5px",
                                }}
                            >
                                <label
                                    style={{
                                        color: "var(--color-dark-brown)",
                                        fontWeight: "600",
                                    }}
                                >
                                    Улица
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--color-accent-medium)",
                                        backgroundColor: "var(--color-white)",
                                        outline: "none",
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "5px",
                                }}
                            >
                                <label
                                    style={{
                                        color: "var(--color-dark-brown)",
                                        fontWeight: "600",
                                    }}
                                >
                                    Номер здания
                                </label>
                                <input
                                    type="text"
                                    name="building"
                                    value={formData.building}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid var(--color-accent-medium)",
                                        backgroundColor: "var(--color-white)",
                                        outline: "none",
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {/* ИСПРАВЛЕНА ОШИБКА РЕГИСТРА */}
                    {activeTab === "payment_methods" && (
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "10px",
                                color: "var(--color-dark-brown)",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                style={{ transform: "scale(1.2)" }}
                            />
                            Метод активен и доступен
                        </label>
                    )}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                            marginTop: "20px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => onClose()}
                            style={{
                                padding: "10px 20px",
                                borderRadius: "6px",
                                border: "1px solid var(--color-dark-brown)",
                                backgroundColor: "transparent",
                                color: "var(--color-dark-brown)",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: "10px 20px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "var(--color-dark-brown)",
                                color: "var(--color-cream)",
                                cursor: "pointer",
                                fontWeight: "600",
                                transition: "0.2s",
                            }}
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}

export default AdminDictionaryModal;
