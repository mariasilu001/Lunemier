import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../styles/admin-products-styles.css";

function AdminProductModal({ isOpen, onClose, productToEdit }) {
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const initialFormState = {
        name: "",
        description: "",
        category_id: "",
        supplier_id: "",
        is_base: false,
        is_custom: false,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [files, setFiles] = useState({
        front_photo: null,
        back_photo: null,
        gallery: [],
    });
    const [previewUrls, setPreviewUrls] = useState({
        front_photo: null,
        back_photo: null,
        gallery: [],
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Подтягиваю категории напрямую с бэкенда, чтобы тебе не нужно было передавать их пропсами
        fetch("/api/categories")
            .then((res) => res.json())
            .then((data) => {
                if (data.categories) setCategories(data.categories);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setFormData({
                    name: productToEdit.name || "",
                    description: productToEdit.description || "",
                    category_id: productToEdit.categoryId || "",
                    supplier_id: productToEdit.supplierId || "",
                    is_base: !!productToEdit.isBase,
                    is_custom: !!productToEdit.isCustom,
                });
            } else {
                setFormData(initialFormState);
            }
            setFiles({ front_photo: null, back_photo: null, gallery: [] });
            setPreviewUrls({
                front_photo: null,
                back_photo: null,
                gallery: [],
            });
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
            setFiles((prev) => ({ ...prev, [field]: file }));
            setPreviewUrls((prev) => ({
                ...prev,
                [field]: URL.createObjectURL(file),
            }));
        }
    };

    const handleGalleryChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const newPreviews = selectedFiles.map((file) =>
            URL.createObjectURL(file),
        );

        setFiles((prev) => ({
            ...prev,
            gallery: [...prev.gallery, ...selectedFiles],
        }));
        setPreviewUrls((prev) => ({
            ...prev,
            gallery: [...prev.gallery, ...newPreviews],
        }));
    };

    const removeGalleryImage = (indexToRemove) => {
        setFiles((prev) => ({
            ...prev,
            gallery: prev.gallery.filter((_, index) => index !== indexToRemove),
        }));
        setPreviewUrls((prev) => ({
            ...prev,
            gallery: prev.gallery.filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            alert("Имя товара обязательно. Не зли меня.");
            return;
        }

        setIsSaving(true);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            if (formData.category_id)
                data.append("category_id", formData.category_id);
            if (formData.supplier_id)
                data.append("supplier_id", formData.supplier_id);
            data.append("is_base", formData.is_base);
            data.append("is_custom", formData.is_custom);

            if (files.front_photo)
                data.append("front_photo", files.front_photo);
            if (files.back_photo) data.append("back_photo", files.back_photo);
            files.gallery.forEach((file) => data.append("gallery", file));

            const token = localStorage.getItem("token");
            const url = productToEdit
                ? `/api/admin/products/${productToEdit.productId}`
                : "/api/admin/products";
            const method = productToEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: data,
            });

            if (res.ok) {
                alert("Товар сохранен в моей базе. Все прошло идеально.");
                onClose(true); // Сообщаем родителю, что нужно обновить список
            } else {
                const err = await res.json();
                alert(
                    err.message ||
                        "Ошибка сохранения. Мой сервер отклонил запрос.",
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // Я создаю портал, чтобы твои стили работали поверх всего остального документа
    return ReactDOM.createPortal(
        <div
            className="admin-product-modal-overlay"
            onClick={() => onClose(false)}
        >
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
                        onClick={() => onClose(false)}
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
                                        <option
                                            key={c.categoryId}
                                            value={c.categoryId}
                                        >
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

                    {/* Я показываю этот блок ТОЛЬКО если ты включила is_base */}
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
                                    {previewUrls.front_photo && (
                                        <img
                                            src={previewUrls.front_photo}
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
                                    {previewUrls.back_photo && (
                                        <img
                                            src={previewUrls.back_photo}
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
                            Шаг {formData.is_base ? "4" : "3"}: Галерея фото
                        </p>
                        <div className="admin-product-file-upload">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryChange}
                            />
                        </div>
                        {previewUrls.gallery &&
                            previewUrls.gallery.length > 0 && (
                                <div className="admin-product-gallery-preview">
                                    {previewUrls.gallery.map((img, index) => (
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
                            onClick={() => onClose(false)}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="admin-btn-save"
                            disabled={isSaving}
                        >
                            {isSaving
                                ? "Сохраняю..."
                                : productToEdit
                                  ? "Сохранить изменения"
                                  : "Создать товар"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}

export default AdminProductModal;
