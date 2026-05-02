import React, { useState, useContext } from "react";
import AdminProductModal from "./AdminProductModal";
import { AppStateContext } from "../../../App";
import "../styles/admin-products-styles.css";

function AdminProducts() {
    const { appState, setAppState } = useContext(AppStateContext);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [productToEdit, setProductToEdit] = useState(null);

    const categories = [
        { id: 1, name: "Футболки" },
        { id: 2, name: "Худи" },
        { id: 3, name: "Платья" },
    ];

    const suppliers = [
        { id: 1, name: "Ткани-Опт" },
        { id: 2, name: "LuneMier Factory" },
    ];

    const handleAddClick = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (productId) => {
        if(window.confirm("Отправить этот товар в архив? Он больше не будет доступен пользователям.")) {
            setAppState(prev => ({
                ...prev,
                products: prev.products.map(p => 
                    p.product_id === productId 
                        ? { ...p, deleted_at: new Date().toISOString() } 
                        : p
                )
            }));
        }
    };

    const handleSaveProduct = (formData) => {
        if (productToEdit) {
            setAppState((prev) => ({
                ...prev,
                products: prev.products.map((p) =>
                    p.product_id === formData.product_id ? formData : p,
                ),
            }));
        } else {
            const newProduct = {
                ...formData,
                product_id: Date.now(),
                created_at: new Date().toLocaleDateString("ru-RU"),
            };
            setAppState((prev) => ({
                ...prev,
                products: [newProduct, ...prev.products],
            }));
        }
        setIsModalOpen(false);
    };

    const productsList = appState.products || [];

    return (
        <section className="admin-products-root">
            <div className="admin-products-header-row">
                <div>
                    <h2 className="admin-products-header">Каталог и товары</h2>
                    <p className="admin-products-subtitle">
                        Управление ядром системы ({productsList.length} позиций)
                    </p>
                </div>
                <button
                    className="admin-product-add-btn"
                    onClick={handleAddClick}
                >
                    + Добавить товар
                </button>
            </div>

            <div className="admin-products-table-wrapper">
                <table className="admin-products-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Флаги</th>
                            <th>Дата создания</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productsList.map((product) => (
                            <tr key={product.product_id}>
                                <td className="font-monospace">
                                    #{product.product_id}
                                </td>
                                <td className="font-bold">{product.name}</td>
                                <td>
                                    {categories.find(
                                        (c) => c.id === product.category_id,
                                    )?.name || "Без категории"}
                                </td>
                                <td>
                                    <div className="admin-flags-group">
                                        {product.is_base && (
                                            <span className="badge badge-base">
                                                Base
                                            </span>
                                        )}
                                        {product.is_custom && (
                                            <span className="badge badge-custom">
                                                Custom
                                            </span>
                                        )}
                                        {!product.is_base &&
                                            !product.is_custom && (
                                                <span className="badge badge-regular">
                                                    Regular
                                                </span>
                                            )}
                                    </div>
                                </td>
                                <td>{product.created_at}</td>
                                <td>
                                    <button
                                        className="admin-btn-text"
                                        onClick={() => handleEditClick(product)}
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        className="admin-btn-text-delete"
                                        onClick={() =>
                                            handleDeleteClick(
                                                product.product_id,
                                            )
                                        }
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AdminProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                categories={categories}
                suppliers={suppliers}
                productToEdit={productToEdit}
            />
        </section>
    );
}

export default AdminProducts;
