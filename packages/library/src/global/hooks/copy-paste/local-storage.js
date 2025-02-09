const getZoloEditorLocalStorage = (key = false) => {
    if (!window.localStorage) {
        return null;
    }

    if (!key) {
        return localStorage;
    }

    const zoloLibrarytate = localStorage.getItem(key);

    if (zoloLibrarytate) {
        return JSON.parse(zoloLibrarytate);
    }

    return null;
};

export default getZoloEditorLocalStorage;
