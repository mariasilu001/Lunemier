import React, { useState, useEffect } from "react";
import "../styles/profile-edit-modal-styles.css";

function ProfileEditModal({ isOpen, onClose, field, onSave }) {
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (field) {
            setInputValue(field.value || "");
        }
    }, [field, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(field.key, inputValue);
    };

    return (
        <div className="profile-edit-modal-overlay" onClick={onClose}>
            <div 
                className="profile-edit-modal-box" 
                onClick={(e) => e.stopPropagation()}
            >
                <p className="profile-edit-modal-title">Изменить: {field.label}</p>
                <form className="profile-edit-modal-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="profile-edit-modal-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        autoFocus
                        placeholder={`Введите ${field.label.toLowerCase()}`}
                    />
                    <div className="profile-edit-modal-buttons-group">
                        <button 
                            type="button" 
                            className="profile-edit-modal-cancel-btn" 
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            className="profile-edit-modal-save-btn"
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileEditModal;