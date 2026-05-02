import React, { useState, useContext } from "react";
import { AppStateContext } from "../../../App";
import "../styles/admin-moderation-styles.css";

function AdminModeration() {
    const { appState, setAppState } = useContext(AppStateContext);
    const [activeTab, setActiveTab] = useState('reviews');

    const reviews = appState.reviews || [];
    const customDesigns = appState.custom_designs || [];

    const handleDeleteReview = (reviewId) => {
        if (window.confirm("Уничтожить этот отзыв навсегда?")) {
            setAppState(prev => ({
                ...prev,
                reviews: prev.reviews.filter(r => r.review_id !== reviewId)
            }));
        }
    };

    const handleBanDesign = (designId, productId) => {
        if (window.confirm(`Заблокировать товар #${productId} за нарушение правил?`)) {
            setAppState(prev => {
                const updatedDesigns = prev.custom_designs.map(d => 
                    d.design_id === designId ? { ...d, deleted_at: new Date().toISOString() } : d
                );
                
                const updatedProducts = (prev.products || []).map(p => 
                    p.product_id === productId ? { ...p, deleted_at: new Date().toISOString() } : p
                );

                return {
                    ...prev,
                    custom_designs: updatedDesigns,
                    products: updatedProducts
                };
            });
        }
    };

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    return (
        <section className="admin-moderation-root">
            <div className="admin-moderation-header-row">
                <div>
                    <h2 className="admin-moderation-header">Модерация контента</h2>
                    <p className="admin-moderation-subtitle">Очистка системы от пользовательского хаоса</p>
                </div>
            </div>

            <div className="admin-moderation-tabs">
                <button 
                    className={`admin-moderation-tab ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Отзывы ({reviews.length})
                </button>
                <button 
                    className={`admin-moderation-tab ${activeTab === 'designs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('designs')}
                >
                    Пользовательские дизайны ({customDesigns.length})
                </button>
            </div>

            <div className="admin-moderation-content">
                {activeTab === 'reviews' && (
                    <div className="admin-reviews-list">
                        {reviews.length === 0 ? (
                            <p className="admin-empty-state">Нет отзывов для проверки.</p>
                        ) : (
                            reviews.map(review => (
                                <div key={review.review_id} className="admin-review-card">
                                    <div className="admin-review-header">
                                        <div className="admin-review-meta">
                                            <span className="review-author">{review.username}</span>
                                            <span className="review-product">Товар #{review.product_id}</span>
                                            <span className="review-date">{review.created_at}</span>
                                        </div>
                                        <span className={`review-rating rating-${review.rating}`}>
                                            {renderStars(review.rating)}
                                        </span>
                                    </div>
                                    <p className="admin-review-text">{review.review_text}</p>
                                    <div className="admin-review-actions">
                                        <button 
                                            className="admin-btn-destroy"
                                            onClick={() => handleDeleteReview(review.review_id)}
                                        >
                                            Удалить (Жестко)
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'designs' && (
                    <div className="admin-designs-grid">
                        {customDesigns.length === 0 ? (
                            <p className="admin-empty-state">Нет дизайнов для проверки.</p>
                        ) : (
                            customDesigns.map(design => (
                                <div key={design.design_id} className={`admin-design-card ${design.deleted_at ? 'banned' : ''}`}>
                                    <div className="admin-design-img-wrapper">
                                        <img src={design.file_path} alt="custom design" />
                                        {design.deleted_at && <div className="banned-overlay">ЗАБЛОКИРОВАНО</div>}
                                    </div>
                                    <div className="admin-design-info">
                                        <p className="design-author">Автор: <span>{design.username}</span></p>
                                        <p className="design-product">Товар ID: {design.product_id}</p>
                                        <p className="design-date">{design.created_at}</p>
                                    </div>
                                    <div className="admin-design-actions">
                                        <button 
                                            className="admin-btn-ban"
                                            onClick={() => handleBanDesign(design.design_id, design.product_id)}
                                            disabled={!!design.deleted_at}
                                        >
                                            {design.deleted_at ? "Заблокирован" : "Заблокировать товар"}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminModeration;