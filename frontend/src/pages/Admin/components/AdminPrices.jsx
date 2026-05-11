import React, { useState, useEffect } from "react";
import AdminPriceModal from "./AdminPriceModal";
import "../styles/admin-prices-styles.css";

function AdminPrices() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchPrices = () => {
        const token = localStorage.getItem("token");
        fetch("/api/admin/prices", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.products) setProducts(data.products);
            })
            .catch((err) => console.error("Ошибка загрузки цен:", err));
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const getActivePrice = (product) => {
        if (product.prices && product.prices.length > 0) {
            return product.prices[0].price; // Бэкенд отдает только активную
        }
        return "Не задана";
    };

    const handleOpenDetails = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleModalClose = (wasUpdated) => {
        setIsModalOpen(false);
        if (wasUpdated) fetchPrices(); // Обновляем список, если цена изменилась
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    return (
        <section className="admin-prices-root">
            <div className="admin-prices-header-row">
                <div>
                    <h2 className="admin-prices-header">Управление ценами</h2>
                    <p className="admin-prices-subtitle">
                        Финансовый контроль каталога
                    </p>
                </div>
            </div>

            <div className="admin-prices-table-wrapper">
                <table className="admin-prices-table">
                    <thead>
                        <tr>
                            <th>ID товара</th>
                            <th>Название</th>
                            <th>Дата создания</th>
                            <th>Текущая цена</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.productId}>
                                <td className="font-monospace">
                                    #{product.productId}
                                </td>
                                <td className="font-bold">{product.name}</td>
                                <td>{formatDate(product.createdAt)}</td>
                                <td className="price-cell">
                                    <span className="current-price-value">
                                        {getActivePrice(product)} ₽
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="admin-btn-details"
                                        onClick={() =>
                                            handleOpenDetails(product)
                                        }
                                    >
                                        История / Изменить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AdminPriceModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    product={selectedProduct}
                />
            )}
        </section>
    );
}

export default AdminPrices;
