import React, { useState, useContext } from "react";
import ReactDOM from "react-dom";
import { GlobalContext } from "../../../GlobalContext"; // Подключаем базу для сохранения

function AdminPriceModal({ isOpen, onClose, product }) {
    const { setProducts } = useContext(GlobalContext);
    const [newPrice, setNewPrice] = useState("");

    if (!isOpen || !product) return null;

    // Вычисляем историю прямо из объекта товара. Сортируем от новых к старым.
    const history = product.prices
        ? [...product.prices].sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at),
          )
        : [];

    const handleSave = () => {
        if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
            alert(
                "Цена должна быть числом больше нуля. Никакой благотворительности.",
            );
            return;
        }

        try {
            // Формируем новую цену
            const newPriceObj = {
                price: parseFloat(newPrice),
                created_at: new Date().toISOString(),
                is_active: true, // Она становится активной
            };

            setProducts((prevProducts) =>
                prevProducts.map((p) => {
                    if (p._id === product._id) {
                        // Берем старые цены и жестко выключаем их (is_active: false)
                        const oldPrices = (p.prices || []).map((oldP) => ({
                            ...oldP,
                            is_active: false,
                        }));

                        // Возвращаем товар с обновленным массивом цен (старые + новая)
                        return { ...p, prices: [...oldPrices, newPriceObj] };
                    }
                    return p;
                }),
            );

            onClose(); // Закрываем, таблица позади обновится мгновенно
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString("ru-RU");
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
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            <div
                className="admin-product-modal-box"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    width: "500px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                    }}
                >
                    <h3 style={{ color: "var(--color-dark-brown)", margin: 0 }}>
                        Товар: {product.name}
                    </h3>
                    <button
                        onClick={() => onClose()}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "20px",
                            cursor: "pointer",
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                        Установить новую цену
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <input
                            type="number"
                            placeholder="Новая цена..."
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            style={{ flex: 1, padding: "8px" }}
                        />
                        <button
                            onClick={handleSave}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "var(--color-dark-brown)",
                                color: "var(--color-cream)",
                                cursor: "pointer",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Применить
                        </button>
                    </div>
                </div>

                <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                    История цен
                </p>
                {history.length === 0 ? (
                    <p style={{ color: "#777" }}>Истории пока нет.</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {history.map((item, index) => (
                            <li
                                key={index}
                                style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #eee",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    backgroundColor: item.is_active
                                        ? "rgba(40, 167, 69, 0.1)"
                                        : "transparent",
                                }}
                            >
                                <span>
                                    {item.price} ₽{" "}
                                    {item.is_active && (
                                        <strong style={{ color: "green" }}>
                                            {" "}
                                            (Текущая)
                                        </strong>
                                    )}
                                </span>
                                <span
                                    style={{ color: "#777", fontSize: "14px" }}
                                >
                                    {formatDate(item.created_at)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>,
        document.body,
    );
}

export default AdminPriceModal;
