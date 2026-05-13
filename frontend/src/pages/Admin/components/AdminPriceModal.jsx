import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

function AdminPriceModal({ isOpen, onClose, product }) {
    const [history, setHistory] = useState([]);
    const [newPrice, setNewPrice] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!product) return;

        // Как только модалка открывается, я заставляю ее стянуть историю цен этого товара
        const token = localStorage.getItem("token");
        fetch(`/api/admin/prices/product/${product.productId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.history) setHistory(data.history);
            })
            .catch(console.error);
    }, [product]);

    if (!isOpen || !product) return null;

    const handleSave = async () => {
        if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
            alert("Цена должна быть числом больше нуля");
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/prices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    product_id: product.productId,
                    price: newPrice,
                }),
            });

            if (res.ok) {
                onClose(true); // Сообщаем родителю об обновлении
            } else {
                const err = await res.json();
                alert(err.message || "Ошибка обновления цены.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString("ru-RU");
    };

    // Очередной портал. Ничто не перекроет мою волю.
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
                        onClick={() => onClose(false)}
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
                            disabled={isSaving}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "var(--color-dark-brown)",
                                color: "var(--color-cream)",
                                cursor: "pointer",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            {isSaving ? "Установка..." : "Применить"}
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
                        {history.map((item) => (
                            <li
                                key={item.priceId}
                                style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #eee",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    backgroundColor: item.isActive
                                        ? "rgba(40, 167, 69, 0.1)"
                                        : "transparent",
                                }}
                            >
                                <span>
                                    {item.price} ₽{" "}
                                    {item.isActive && (
                                        <strong style={{ color: "green" }}>
                                            (Текущая)
                                        </strong>
                                    )}
                                </span>
                                <span
                                    style={{ color: "#777", fontSize: "14px" }}
                                >
                                    {formatDate(item.createdAt)}
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
