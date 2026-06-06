import React, { useState, useContext } from "react";
import { GlobalContext } from "../../../GlobalContext"; // НАША БАЗА
import AdminProductModal from "./AdminProductModal";
import "../styles/admin-products-styles.css";

function AdminProducts() {
    const { products, setProducts, categories } = useContext(GlobalContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    // Жесткий барьер загрузки базы
    if (!products || !categories) return null;

    const handleAddClick = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (productId) => {
        if (!window.confirm("Отправить этот товар в архив?")) return;

        try {
            // Переводим товар в архив прямо в памяти
            setProducts((prev) =>
                prev.map((p) =>
                    p._id === productId
                        ? { ...p, deleted_at: new Date().toISOString() }
                        : p,
                ),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("ru-RU");
    };

    return (
        <section className="admin-products-root">
            <div className="admin-products-header-row">
                <div>
                    <h2 className="admin-products-header">Каталог и товары</h2>
                    <p className="admin-products-subtitle">
                        Управление ядром системы ({products.length} позиций)
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
                        {products.map((product) => {
                            // Связь: Ищем категорию по ID, чтобы вывести её имя
                            const cat = categories.find(
                                (c) => c._id === product.category_id,
                            );

                            return (
                                <tr
                                    key={product._id}
                                    className={
                                        product.deleted_at ? "banned-row" : ""
                                    }
                                >
                                    <td className="font-monospace">
                                        #{product._id}
                                    </td>
                                    <td className="font-bold">
                                        {product.name}
                                    </td>
                                    <td>{cat ? cat.name : "Без категории"}</td>
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
                                            {product.deleted_at && (
                                                <span className="badge badge-cancelled">
                                                    Архив
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{formatDate(product.created_at)}</td>
                                    <td>
                                        <button
                                            className="admin-btn-text"
                                            onClick={() =>
                                                handleEditClick(product)
                                            }
                                        >
                                            Редактировать
                                        </button>
                                        {!product.deleted_at && (
                                            <button
                                                className="admin-btn-text-delete"
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        product._id,
                                                    )
                                                }
                                            >
                                                В архив
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AdminProductModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    productToEdit={productToEdit}
                />
            )}
        </section>
    );
}

export default AdminProducts;
