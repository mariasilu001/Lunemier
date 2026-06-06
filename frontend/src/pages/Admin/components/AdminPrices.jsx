import React, { useState, useContext } from "react";
import { GlobalContext } from "../../../GlobalContext"; // НАША БАЗА
import AdminPriceModal from "./AdminPriceModal";
import "../styles/admin-prices-styles.css";

function AdminPrices() {
    // Вытягиваем товары напрямую из памяти
    const { products } = useContext(GlobalContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Жесткий барьер
    if (!products) return null;

    const getActivePrice = (product) => {
        if (product.prices && product.prices.length > 0) {
            // Ищем именно активную цену, а не просто первую попавшуюся
            const activePrice = product.prices.find(p => p.is_active);
            if (activePrice) return activePrice.price;
        }
        return "Не задана";
    };

    const handleOpenDetails = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
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
                            <tr key={product._id}>
                                <td className="font-monospace">
                                    #{product._id}
                                </td>
                                <td className="font-bold">{product.name}</td>
                                <td>{formatDate(product.created_at)}</td>
                                <td className="price-cell">
                                    <span className="current-price-value">
                                        {getActivePrice(product)} ₽
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="admin-btn-details"
                                        onClick={() => handleOpenDetails(product)}
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