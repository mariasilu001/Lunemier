import React, { useState, useContext } from "react";
import { AppStateContext } from "../../../App";
import AdminPriceModal from "./AdminPriceModal";
import "../styles/admin-prices-styles.css";

function AdminPrices() {
    const { appState, setAppState } = useContext(AppStateContext);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const activeProducts = (appState.products || []).filter(p => !p.deleted_at);
    const allPrices = appState.prices || [];

    const getActivePrice = (productId) => {
        const priceObj = allPrices.find(p => p.product_id === productId && p.is_active);
        return priceObj ? priceObj.price : "Не задана";
    };

    const getProductHistory = (productId) => {
        return allPrices
            .filter(p => p.product_id === productId)
            .sort((a, b) => b.price_id - a.price_id);
    };

    const handleOpenDetails = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAddPrice = (productId, newPriceValue) => {
        setAppState(prev => {
            const updatedPrices = prev.prices.map(p => 
                p.product_id === productId && p.is_active 
                    ? { ...p, is_active: false } 
                    : p
            );

            const newPriceRecord = {
                price_id: Date.now(),
                product_id: productId,
                price: newPriceValue,
                created_at: new Date().toLocaleDateString("ru-RU"),
                is_active: true
            };

            return {
                ...prev,
                prices: [newPriceRecord, ...updatedPrices]
            };
        });
    };

    return (
        <section className="admin-prices-root">
            <div className="admin-prices-header-row">
                <div>
                    <h2 className="admin-prices-header">Управление ценами</h2>
                    <p className="admin-prices-subtitle">Финансовый контроль каталога</p>
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
                        {activeProducts.map((product) => (
                            <tr key={product.product_id}>
                                <td className="font-monospace">#{product.product_id}</td>
                                <td className="font-bold">{product.name}</td>
                                <td>{product.created_at}</td>
                                <td className="price-cell">
                                    <span className="current-price-value">{getActivePrice(product.product_id)} ₽</span>
                                </td>
                                <td>
                                    <button 
                                        className="admin-btn-details" 
                                        onClick={() => handleOpenDetails(product)}
                                    >
                                        Детали
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AdminPriceModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct}
                history={selectedProduct ? getProductHistory(selectedProduct.product_id) : []}
                onAddPrice={handleAddPrice}
            />
        </section>
    );
}

export default AdminPrices;