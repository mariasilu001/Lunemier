import React, { useState, useEffect } from "react";
import "../styles/admin-products-styles.css";

function AdminProductModal({
    isOpen,
    onClose,
    onSave,
    categories,
    suppliers,
    productToEdit,
}) {
    const initialFormState = {
        name: "",
        description: "",
        category_id: "",
        supplier_id: "",
        is_base: false,
        is_custom: false,
        front_photo: null,
        back_photo: null,
        gallery: [],
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setFormData(productToEdit);
            } else {
                setFormData(initialFormState);
            }
        }
    }, [isOpen, productToEdit]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                [field]: URL.createObjectURL(file),
            }));
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => URL.createObjectURL(file));
        setFormData((prev) => ({
            ...prev,
            gallery: [...prev.gallery, ...newImages],
        }));
    };

    const removeGalleryImage = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            gallery: prev.gallery.filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="admin-product-modal-overlay" onClick={onClose}>
            <div
                className="admin-product-modal-box"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-product-modal-header">
                    <h2>
                        {productToEdit
                            ? "Редактирование товара"
                            : "Создание товара"}
                    </h2>
                    <button
                        className="admin-product-modal-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <form className="admin-product-form" onSubmit={handleSubmit}>
                    <div className="admin-product-step">
                        <p className="admin-product-step-title">
                            Шаг 1: Базовая информация
                        </p>
                        <div className="admin-product-input-group">
                            <label>Название товара</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="admin-product-input-group">
                            <label>Описание</label>
                            <textarea
                                name="description"
                                value={formData.description || ""}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>
                        <div className="admin-product-row-group">
                            <div className="admin-product-input-group">
                                <label>Категория</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">
                                        Выберите категорию...
                                    </option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="admin-product-input-group">
                                <label>Поставщик</label>
                                <select
                                    name="supplier_id"
                                    value={formData.supplier_id || ""}
                                    onChange={handleInputChange}
                                >
                                    <option value="">
                                        Выберите поставщика...
                                    </option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="admin-product-step">
                        <p className="admin-product-step-title">
                            Шаг 2: Флаги товара
                        </p>
                        <div className="admin-product-checkbox-group">
                            <label className="admin-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_base"
                                    checked={formData.is_base}
                                    onChange={handleInputChange}
                                />
                                <span className="admin-checkbox-custom"></span>
                                Это базовая основа для кастомизатора
                            </label>
                            <label className="admin-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_custom"
                                    checked={formData.is_custom}
                                    onChange={handleInputChange}
                                />
                                <span className="admin-checkbox-custom"></span>
                                Это кастомный товар пользователя
                            </label>
                        </div>
                    </div>

                    {formData.is_base && (
                        <div className="admin-product-step highlighted-step">
                            <p className="admin-product-step-title">
                                Шаг 3: Фото основы (Front / Back)
                            </p>
                            <p className="admin-product-step-hint">
                                Так как товар отмечен как основа, загрузите
                                манекены.
                            </p>
                            <div className="admin-product-row-group">
                                <div className="admin-product-file-upload">
                                    <label>Вид спереди</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleFileChange(e, "front_photo")
                                        }
                                    />
                                    {formData.front_photo && (
                                        <img
                                            src={formData.front_photo}
                                            alt="front"
                                            className="admin-product-preview-small"
                                        />
                                    )}
                                </div>
                                <div className="admin-product-file-upload">
                                    <label>Вид сзади</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleFileChange(e, "back_photo")
                                        }
                                    />
                                    {formData.back_photo && (
                                        <img
                                            src={formData.back_photo}
                                            alt="back"
                                            className="admin-product-preview-small"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="admin-product-step">
                        <p className="admin-product-step-title">
                            Шаг 4: Галерея фото
                        </p>
                        <div className="admin-product-file-upload">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryChange}
                            />
                        </div>
                        {formData.gallery && formData.gallery.length > 0 && (
                            <div className="admin-product-gallery-preview">
                                {formData.gallery.map((img, index) => (
                                    <div
                                        key={index}
                                        className="gallery-thumb-wrapper"
                                    >
                                        <img
                                            src={img}
                                            alt={`gallery-${index}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeGalleryImage(index)
                                            }
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="admin-product-modal-footer">
                        <button
                            type="button"
                            className="admin-btn-cancel"
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button type="submit" className="admin-btn-save">
                            {productToEdit
                                ? "Сохранить изменения"
                                : "Создать товар"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminProductModal;
