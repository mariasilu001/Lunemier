import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

function AdminDictionaryModal({ isOpen, onClose, itemToEdit, activeTab }) {
    const [formData, setFormData] = useState({
        name: "",
        size_value: "",
        city: "",
        street: "",
        building: "",
        is_active: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setFormData({
                    name: itemToEdit.name || "",
                    size_value: itemToEdit.sizeValue || "",
                    city: itemToEdit.city || "",
                    street: itemToEdit.street || "",
                    building: itemToEdit.building || "",
                    is_active:
                        itemToEdit.isActive !== undefined
                            ? itemToEdit.isActive
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

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem("token");
            let url = "";
            let method = itemToEdit ? "PUT" : "POST";
            let bodyData = {};

            // Я жестко формирую тело запроса в зависимости от того, с каким справочником мы работаем
            if (activeTab === "categories") {
                url = itemToEdit
                    ? `/api/admin/categories/${itemToEdit.categoryId}`
                    : "/api/admin/categories";
                bodyData = { name: formData.name };
            } else if (activeTab === "sizes") {
                url = itemToEdit
                    ? `/api/admin/sizes/${itemToEdit.sizeId}`
                    : "/api/admin/sizes";
                bodyData = { size_value: formData.size_value };
            } else if (activeTab === "pickupPoints") {
                url = itemToEdit
                    ? `/api/admin/pickup-points/${itemToEdit.pickupPointId}`
                    : "/api/admin/pickup-points";
                bodyData = {
                    city: formData.city,
                    street: formData.street,
                    building: formData.building,
                };
            } else if (activeTab === "paymentMethods") {
                url = itemToEdit
                    ? `/api/admin/payment-methods/${itemToEdit.paymentMethodId}`
                    : "/api/admin/payment-methods";
                bodyData = {
                    name: formData.name,
                    is_active: formData.is_active,
                };
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bodyData),
            });

            if (res.ok) {
                onClose(true);
            } else {
                const err = await res.json();
                alert(err.message || "сервер отклонил запрос.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const getTitle = () => {
        const action = itemToEdit ? "Редактирование:" : "Добавление:";
        if (activeTab === "categories") return `${action} Категория`;
        if (activeTab === "sizes") return `${action} Размер`;
        if (activeTab === "pickupPoints") return `${action} Пункт выдачи`;
        if (activeTab === "paymentMethods") return `${action} Метод оплаты`;
        return "Справочник";
    };

    // Я снова использую портал. Это окно будет парить над всей системой.
    return ReactDOM.createPortal(
        <div
            className="admin-product-modal-overlay"
            onClick={() => onClose(false)}
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
                        onClick={() => onClose(false)}
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
                    {(activeTab === "categories" ||
                        activeTab === "paymentMethods") && (
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

                    {activeTab === "pickupPoints" && (
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

                    {activeTab === "paymentMethods" && (
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
                            Метод активен и доступен пользователям
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
                            onClick={() => onClose(false)}
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
                            disabled={isSaving}
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
                            {isSaving ? "Сохраняю..." : "Сохранить"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}

export default AdminDictionaryModal;
