import React, { useState } from "react";
import "../styles/admin-prices-styles.css";

function AdminPriceModal({ isOpen, onClose, product, history, onAddPrice }) {
    const [newPrice, setNewPrice] = useState("");

    if (!isOpen || !product) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) return;
        
        onAddPrice(product.product_id, Number(newPrice));
        setNewPrice("");
    };

    return (
        <div className="admin-price-modal-overlay" onClick={onClose}>
            <div className="admin-price-modal-box" onClick={e => e.stopPropagation()}>
                <div className="admin-price-modal-header">
                    <div>
                        <h2>Управление ценой</h2>
                        <p className="admin-price-modal-subtitle">{product.name} (ID: {product.product_id})</p>
                    </div>
                    <button className="admin-price-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="admin-price-modal-body">
                    <form className="admin-price-form" onSubmit={handleSubmit}>
                        <label>Назначить новую цену (₽)</label>
                        <div className="admin-price-input-row">
                            <input 
                                type="number" 
                                value={newPrice} 
                                onChange={(e) => setNewPrice(e.target.value)} 
                                placeholder="Например: 2500"
                                required 
                                min="1"
                            />
                            <button type="submit" className="admin-btn-save-price">Обновить</button>
                        </div>
                        <p className="admin-price-hint">При сохранении старая цена будет деактивирована, но останется в истории.</p>
                    </form>

                    <div className="admin-price-separator"></div>

                    <h3 className="admin-price-history-title">История изменений</h3>
                    <div className="admin-price-history-list">
                        {history && history.length > 0 ? (
                            history.map(item => (
                                <div key={item.price_id} className={`admin-price-history-item ${item.is_active ? 'active' : ''}`}>
                                    <div className="price-history-left">
                                        <span className="price-history-value">{item.price} ₽</span>
                                        {item.is_active && <span className="price-history-badge">Текущая</span>}
                                    </div>
                                    <div className="price-history-right">
                                        <span className="price-history-date">{item.created_at}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="admin-price-history-empty">История цен пуста. Товар отдается бесплатно?</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPriceModal;