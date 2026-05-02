const handleRegister = async (email, password, setAppState) => {
    const appState = JSON.parse(localStorage.getItem("appState"));
    // if (
    //     password !== appState.currentUser.password_hash ||
    //     email !== appState.currentUser.email
    // ) {
    //     const error = new Error();
    //     error.message = "Неверный логин или пароль, попробуйте еще раз";
    //     throw error;
    // }
    setAppState((prevAppState) => {
        const newAppState = {
            ...prevAppState,
            currentUser: {
                ...prevAppState.currentUser,
                isAuthorized: true,
                isRegistered: true,
            },
        };
        return newAppState;
    });
};

export default handleRegister;
