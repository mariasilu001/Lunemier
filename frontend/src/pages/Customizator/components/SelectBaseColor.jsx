import React, { useContext } from "react";
import "../styles/select-base-color.css";
import { AppStateContext } from "../../../App";

function SelectBaseColor({ color, setColor }) {
    const { appState, setAppState } = useContext(AppStateContext);
    const presetColors = [
        "#ffffff",
        "#000000",
        "#1a52c4",
        "#b81414",
        "#d1d1d1",
    ];

    return (
        <div className="select-base-color-root">
            <div className="select-base-header-group">
                <p className="select-base-title">{appState.products[0].name}</p>
                <span className="select-base-subtitle">{appState.products[0].description}</span>
            </div>

            <div className="select-base-color-section">
                <p className="select-base-label">
                    Цвет: <span>{color}</span>
                </p>
                <div className="select-base-presets">
                    {presetColors.map((c) => (
                        <button
                            key={c}
                            className={`select-base-swatch ${color === c ? "active" : ""}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>
            </div>

            <div className="select-base-custom-section">
                <p className="select-base-label">Фон</p>
                <div className="select-base-input-group">
                    <div className="color-picker-wrapper">
                        <input
                            type="color"
                            className="color-picker-input"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </div>
                    <input
                        type="text"
                        className="color-hex-input"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        maxLength={7}
                    />
                    <button className="color-apply-btn">Применить</button>
                </div>
            </div>
        </div>
    );
}

export default SelectBaseColor;
