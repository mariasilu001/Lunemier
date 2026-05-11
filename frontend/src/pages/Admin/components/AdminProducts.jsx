import React, { useState, useEffect } from "react";
import AdminProductModal from "./AdminProductModal";
import "../styles/admin-products-styles.css";

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    const fetchProducts = () => {
        const token = localStorage.getItem("token");
        fetch("/api/admin/products", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.products) setProducts(data.products);
            })
            .catch((err) => console.error("Я не смог загрузить товары:", err));
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddClick = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (productId) => {
        if (
            !window.confirm(
                "Отправить этот товар в архив? Пользователи больше его не увидят.",
            )
        )
            return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                // Если я заархивировал его на сервере, обновляем и тут.
                setProducts((prev) =>
                    prev.map((p) =>
                        p.productId === productId
                            ? { ...p, deletedAt: new Date().toISOString() }
                            : p,
                    ),
                );
            } else {
                const err = await res.json();
                alert(err.message || "Я не смог удалить товар.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleModalClose = (wasUpdated) => {
        setIsModalOpen(false);
        // Если что-то изменилось, я заставляю компонент перезапросить данные.
        if (wasUpdated) fetchProducts();
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
                        {products.map((product) => (
                            <tr
                                key={product.productId}
                                className={
                                    product.deletedAt ? "banned-row" : ""
                                }
                            >
                                <td className="font-monospace">
                                    #{product.productId}
                                </td>
                                <td className="font-bold">{product.name}</td>
                                <td>
                                    {product.category?.name || "Без категории"}
                                </td>
                                <td>
                                    <div className="admin-flags-group">
                                        {product.isBase && (
                                            <span className="badge badge-base">
                                                Base
                                            </span>
                                        )}
                                        {product.isCustom && (
                                            <span className="badge badge-custom">
                                                Custom
                                            </span>
                                        )}
                                        {!product.isBase &&
                                            !product.isCustom && (
                                                <span className="badge badge-regular">
                                                    Regular
                                                </span>
                                            )}
                                        {product.deletedAt && (
                                            <span className="badge badge-cancelled">
                                                Архив
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{formatDate(product.createdAt)}</td>
                                <td>
                                    <button
                                        className="admin-btn-text"
                                        onClick={() => handleEditClick(product)}
                                    >
                                        Редактировать
                                    </button>
                                    {!product.deletedAt && (
                                        <button
                                            className="admin-btn-text-delete"
                                            onClick={() =>
                                                handleDeleteClick(
                                                    product.productId,
                                                )
                                            }
                                        >
                                            В архив
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
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
