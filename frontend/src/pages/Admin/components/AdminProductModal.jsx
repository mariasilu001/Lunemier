import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import { GlobalContext } from "../../../GlobalContext";
import "../styles/admin-products-styles.css";

function AdminProductModal({ isOpen, onClose, productToEdit }) {
    const { categories, suppliers, setProducts } = useContext(GlobalContext);

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
        const urlsToRevoke = [];

        if (isOpen) {
            if (productToEdit) {
                setFormData({
                    name: productToEdit.name || "",
                    description: productToEdit.description || "",
                    category_id: productToEdit.category_id || "",
                    supplier_id: productToEdit.supplier_id || "",
                    is_base: !!productToEdit.is_base,
                    is_custom: !!productToEdit.is_custom,
                });

                const existingFront = productToEdit.front_photo_url || null;
                const existingBack = productToEdit.back_photo_url || null;
                const existingGallery = productToEdit.photos
                    ? productToEdit.photos.map((p) => p.file_path)
                    : [];

                setFiles({
                    front_photo: existingFront,
                    back_photo: existingBack,
                    gallery: existingGallery,
                });

                const frontPreview = existingFront
                    ? URL.createObjectURL(existingFront)
                    : null;
                const backPreview = existingBack
                    ? URL.createObjectURL(existingBack)
                    : null;

                const galleryPreviews = existingGallery
                    .map((f) => {
                        if (f) return URL.createObjectURL(f);
                        return null;
                    })
                    .filter(Boolean);

                if (frontPreview) urlsToRevoke.push(frontPreview);
                if (backPreview) urlsToRevoke.push(backPreview);
                galleryPreviews.forEach((u) => urlsToRevoke.push(u));

                setPreviewUrls({
                    front_photo: frontPreview,
                    back_photo: backPreview,
                    gallery: galleryPreviews,
                });
            } else {
                setFormData(initialFormState);
                setFiles({ front_photo: null, back_photo: null, gallery: [] });
                setPreviewUrls({
                    front_photo: null,
                    back_photo: null,
                    gallery: [],
                });
            }
        }

        return () => {
            urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
        };
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name) {
            alert("Имя товара обязательно.");
            return;
        }

        setIsSaving(true);
        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                category_id: formData.category_id
                    ? Number(formData.category_id)
                    : null,
                supplier_id: formData.supplier_id
                    ? Number(formData.supplier_id)
                    : null,
                is_base: formData.is_base,
                is_custom: formData.is_custom,
                updated_at: new Date().toISOString(),
            };

            if (productToEdit) {
                setProducts((prev) =>
                    prev.map((p) => {
                        if (p._id === productToEdit._id) {
                            const updatedProduct = { ...p, ...productData };
                            updatedProduct.front_photo_url = files.front_photo;
                            updatedProduct.back_photo_url = files.back_photo;
                            updatedProduct.photos = files.gallery.map((f) => ({
                                file_path: f,
                            }));
                            return updatedProduct;
                        }
                        return p;
                    }),
                );
            } else {
                const newProduct = {
                    _id: Date.now(),
                    ...productData,
                    created_at: new Date().toISOString(),
                    deleted_at: null,
                    prices: [
                        {
                            price: 0,
                            created_at: new Date().toISOString(),
                            is_active: true,
                        },
                    ],
                    photos: files.gallery.map((f) => ({ file_path: f })),
                    custom_photos: [],
                    front_photo_url: files.front_photo,
                    back_photo_url: files.back_photo,
                };
                setProducts((prev) => [...prev, newProduct]);
            }

            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="admin-product-modal-overlay" onClick={() => onClose()}>
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
                        type="button"
                        className="admin-product-modal-close"
                        onClick={() => onClose()}
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
                                    {categories &&
                                        categories.map((c) => (
                                            <option key={c._id} value={c._id}>
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
                                    {suppliers &&
                                        suppliers.map((s) => (
                                            <option key={s._id} value={s._id}>
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
                                <span className="admin-checkbox-custom"></span>{" "}
                                Это базовая основа
                            </label>
                            <label className="admin-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_custom"
                                    checked={formData.is_custom}
                                    onChange={handleInputChange}
                                />
                                <span className="admin-checkbox-custom"></span>{" "}
                                Это кастомный товар
                            </label>
                        </div>
                    </div>

                    {formData.is_base && (
                        <div className="admin-product-step highlighted-step">
                            <p className="admin-product-step-title">
                                Шаг 3: Фото основы (Front / Back)
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
                            onClick={() => onClose()}
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
