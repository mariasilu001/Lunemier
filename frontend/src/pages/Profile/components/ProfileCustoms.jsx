import React from "react";
import "../styles/profile-customs-styles.css";

function ProfileCustoms() {
    const mockCustoms = [
        {
            id: "CUST-8492",
            name: "Этническое безумие",
            createdAt: "18.04.2026",
            baseProduct: "Базовая футболка оверсайз",
            baseImage: "/cloth-front.png",
            resultImage: "/lunemier-design-perfect.png",
            prints: [
                "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg",
            ],
        },
        {
            id: "CUST-8493",
            name: "Ночная тень",
            createdAt: "12.04.2026",
            baseProduct: "Классическое худи",
            baseImage: "/cloth-front.png",
            resultImage: "/lunemier-design-perfect.png",
            prints: [
                "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg",
                "https://i.pinimg.com/736x/81/eb/7a/81eb7a8dd4bbd4720ad2ed935b4d3c4b.jpg",
            ],
        },
    ];

    return (
        <section className="profile-customs-root">
            <h2 className="profile-customs-header">Мои кастомные товары</h2>

            <div className="profile-customs-list">
                {mockCustoms.map((item) => (
                    <div className="profile-custom-card" key={item.id}>
                        <div className="profile-custom-card-header">
                            <p className="profile-custom-name">{item.name}</p>
                            <p className="profile-custom-date">
                                Создан: {item.createdAt}
                            </p>
                        </div>

                        <p className="profile-custom-base-name">
                            Основа: <span>{item.baseProduct}</span>
                        </p>

                        <div className="profile-custom-images-group">
                            <div className="profile-custom-image-box base-box">
                                <p className="profile-custom-image-label">
                                    Основа
                                </p>
                                <img
                                    src={item.baseImage}
                                    alt="Base"
                                    className="profile-custom-img"
                                />
                            </div>

                            <div className="profile-custom-image-separator">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                                    />
                                </svg>
                            </div>

                            <div className="profile-custom-image-box result-box">
                                <p className="profile-custom-image-label">
                                    Результат
                                </p>
                                <img
                                    src={item.resultImage}
                                    alt="Result"
                                    className="profile-custom-img"
                                />
                            </div>
                        </div>

                        <div className="profile-custom-prints-group">
                            <p className="profile-custom-prints-label">
                                Использованные принты:
                            </p>
                            <div className="profile-custom-prints-list">
                                {item.prints.map((printUrl, index) => (
                                    <img
                                        key={index}
                                        src={printUrl}
                                        alt={`print-${index}`}
                                        className="profile-custom-print-thumb"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="profile-custom-actions">
                            <button className="profile-custom-btn-cart">
                                Добавить в корзину
                            </button>
                            <div className="profile-custom-actions-right">
                                <button className="profile-custom-btn-edit">
                                    Изменить
                                </button>
                                <button className="profile-custom-btn-delete">
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ProfileCustoms;
