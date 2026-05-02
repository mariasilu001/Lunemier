import React from "react";
import "../styles/cusomizator-banner-styles.css";
import { useNavigate } from "react-router-dom";

function CustomizatorBanner() {
    const navigate = useNavigate();

    return (
        <>
            <section className="customizator-banner-root">
                <div className="customizator-banner-img-wrapper">
                    <img
                        className="customizator-banner-img"
                        src="/customizator-banner-img.png"
                        alt="Изображение баннера кастомизатора"
                    />
                </div>
                <div className="customizator-banner-text-button-group">
                    <p className="customizator-banner-header">
                        Творить - значит кастомизировать
                    </p>
                    <p className="customizator-banner-text">
                        Выберите принты, добавьте детали, создайте свой
                        уникальный стиль с LuneMier
                    </p>
                    <button
                        onClick={() => navigate("/customizator/select-base")}
                        className="customizator-banner-button"
                    >
                        Перейти в кастомизатор
                    </button>
                </div>
            </section>
            <section className="customizator-banner-mobile-root">
                <div className="customizator-banner-mobile-img-wrapper">
                    <img
                        className="customizator-banner-mobile-img"
                        src="/customizator-banner-img-mobile.png"
                        alt="Изображение баннера кастомизатора"
                    />
                </div>
                <div className="customizator-banner-mobile-text-button-group">
                    <p className="customizator-banner-mobile-header">
                        Творить - значит кастомизировать
                    </p>
                    <p className="customizator-banner-mobile-text">
                        Выберите принты, добавьте детали, создайте свой
                        уникальный стиль с LuneMier
                    </p>
                    <button
                        onClick={() => navigate("/customizator/select-base")}
                        className="customizator-banner-mobile-button"
                    >
                        Перейти в кастомизатор
                    </button>
                </div>
            </section>
        </>
    );
}

export default CustomizatorBanner;
