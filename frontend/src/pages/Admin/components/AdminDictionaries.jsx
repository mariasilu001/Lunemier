import React, { useState, useContext } from "react";
import { AppStateContext } from "../../../App";
import AdminDictionaryModal from "./AdminDictionaryModal";
import "../styles/admin-dictionaries-styles.css";

function AdminDictionaries() {
    const { appState, setAppState } = useContext(AppStateContext);
    
    const [activeTab, setActiveTab] = useState('categories');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    const tabs = [
        { id: 'categories', label: 'Категории' },
        { id: 'sizes', label: 'Размеры' },
        { id: 'pickup_points', label: 'Пункты выдачи' },
        { id: 'payment_methods', label: 'Способы оплаты' }
    ];

    const getIdField = (tab) => {
        if (tab === 'categories') return 'category_id';
        if (tab === 'sizes') return 'size_id';
        if (tab === 'pickup_points') return 'pickup_point_id';
        if (tab === 'payment_methods') return 'payment_method_id';
    };

    const currentData = appState[activeTab] || [];

    const handleAdd = () => {
        setItemToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        const isSoftDelete = activeTab === 'pickup_points';
        const message = isSoftDelete 
            ? "Мягкое удаление: пометить этот пункт выдачи как удаленный?" 
            : "Жесткое удаление: стереть эту запись из базы навсегда?";

        if (!window.confirm(message)) return;

        setAppState(prev => {
            const idField = getIdField(activeTab);
            
            if (isSoftDelete) {
                return {
                    ...prev,
                    [activeTab]: prev[activeTab].map(item => 
                        item[idField] === id ? { ...item, deleted_at: new Date().toISOString() } : item
                    )
                };
            } else {
                return {
                    ...prev,
                    [activeTab]: prev[activeTab].filter(item => item[idField] !== id)
                };
            }
        });
    };

    const handleSave = (formData) => {
        setAppState(prev => {
            const idField = getIdField(activeTab);
            
            if (itemToEdit) {
                return {
                    ...prev,
                    [activeTab]: prev[activeTab].map(item => 
                        item[idField] === formData[idField] ? formData : item
                    )
                };
            } else {
                const newItem = { 
                    ...formData, 
                    [idField]: Date.now(),
                };
                if (activeTab === 'pickup_points') {
                    newItem.created_at = new Date().toLocaleDateString("ru-RU");
                    newItem.deleted_at = null;
                }
                
                return {
                    ...prev,
                    [activeTab]: [...prev[activeTab], newItem]
                };
            }
        });
        setIsModalOpen(false);
    };

    const renderTableContent = () => {
        if (activeTab === 'categories') {
            return currentData.map(item => (
                <tr key={item.category_id}>
                    <td className="font-monospace">#{item.category_id}</td>
                    <td className="font-bold">{item.name}</td>
                    <td className="actions-cell">
                        <button className="admin-btn-text" onClick={() => handleEdit(item)}>Редактировать</button>
                        <button className="admin-btn-text-delete" onClick={() => handleDelete(item.category_id)}>Удалить</button>
                    </td>
                </tr>
            ));
        }
        if (activeTab === 'sizes') {
            return currentData.map(item => (
                <tr key={item.size_id}>
                    <td className="font-monospace">#{item.size_id}</td>
                    <td className="font-bold">{item.size_value}</td>
                    <td className="actions-cell">
                        <button className="admin-btn-text" onClick={() => handleEdit(item)}>Редактировать</button>
                        <button className="admin-btn-text-delete" onClick={() => handleDelete(item.size_id)}>Удалить</button>
                    </td>
                </tr>
            ));
        }
        if (activeTab === 'payment_methods') {
            return currentData.map(item => (
                <tr key={item.payment_method_id}>
                    <td className="font-monospace">#{item.payment_method_id}</td>
                    <td className="font-bold">{item.name}</td>
                    <td>{item.is_active ? <span className="badge badge-active">Активен</span> : <span className="badge badge-inactive">Отключен</span>}</td>
                    <td className="actions-cell">
                        <button className="admin-btn-text" onClick={() => handleEdit(item)}>Редактировать</button>
                        <button className="admin-btn-text-delete" onClick={() => handleDelete(item.payment_method_id)}>Удалить</button>
                    </td>
                </tr>
            ));
        }
        if (activeTab === 'pickup_points') {
            return currentData.map(item => (
                <tr key={item.pickup_point_id} className={item.deleted_at ? "deleted-row" : ""}>
                    <td className="font-monospace">#{item.pickup_point_id}</td>
                    <td><span className="font-bold">{item.city}</span>, ул. {item.street}, д. {item.building}</td>
                    <td>{item.created_at}</td>
                    <td className="actions-cell">
                        <button className="admin-btn-text" onClick={() => handleEdit(item)} disabled={item.deleted_at}>Редактировать</button>
                        {!item.deleted_at && (
                            <button className="admin-btn-text-delete" onClick={() => handleDelete(item.pickup_point_id)}>Удалить</button>
                        )}
                        {item.deleted_at && <span className="deleted-stamp">Мертв ({new Date(item.deleted_at).toLocaleDateString()})</span>}
                    </td>
                </tr>
            ));
        }
    };

    return (
        <section className="admin-dict-root">
            <div className="admin-dict-header-row">
                <div>
                    <h2 className="admin-dict-header">Справочники</h2>
                    <p className="admin-dict-subtitle">Базовые константы системы</p>
                </div>
                <button className="admin-dict-add-btn" onClick={handleAdd}>
                    + Добавить запись
                </button>
            </div>

            <div className="admin-dict-tabs">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        className={`admin-dict-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="admin-dict-table-wrapper">
                <table className="admin-dict-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            {activeTab === 'categories' && <th>Название</th>}
                            {activeTab === 'sizes' && <th>Размер</th>}
                            {activeTab === 'payment_methods' && (
                                <><th>Название</th><th>Статус</th></>
                            )}
                            {activeTab === 'pickup_points' && (
                                <><th>Адрес</th><th>Создан</th></>
                            )}
                            <th style={{width: '200px'}}>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableContent()}
                    </tbody>
                </table>
                {currentData.length === 0 && (
                    <p className="admin-dict-empty">Таблица пуста. Заполни ее.</p>
                )}
            </div>

            <AdminDictionaryModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave}
                activeTab={activeTab}
                itemToEdit={itemToEdit}
            />
        </section>
    );
}

export default AdminDictionaries;