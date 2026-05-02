import React, { useContext } from "react";
import "../styles/nav-menu-styles.css";
import { AppStateContext } from "../../../App";

function NavMenu() {
    const { appState } = useContext(AppStateContext);

    return (
        <nav className="nav-menu-root">
            {appState.dictionaries.categories.map((c) => (
                <div className="nav-menu-nav-item-wrapper" key={c.category_id}>
                    <p className="nav-menu-nav-item-name">{c.name}</p>
                    <div className="nav-menu-nav-item-separator"></div>
                </div>
            ))}
        </nav>
    );
}

export default NavMenu;
