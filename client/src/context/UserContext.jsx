
import { createContext, useContext, useEffect, useState } from "react";
import API_URL from "../config/api";

const UserContext = createContext(null);

function UserProvider({ children }){

    const [currentUser, setCurrentUser] = useState(null);
    //state om react väntar på att backend ska kontrollera befintliga cookien, då currentUser börjar som null
    const [authLoading, setAuthLoading] = useState(true);

    //körs när appen startar/sidan uppdateras
    useEffect(() =>{

        const controller = new AbortController();

        async function restoreSession(){

            try{

                const response = await fetch(`${API_URL}/api/auth/me`, {
                    credentials: "include",
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error("No active session");
                }

                const data = await response.json();

                setCurrentUser(data.user);

            } catch (error){

                if (error.name !== "AbortError"){

                    setCurrentUser(null);
                }

            }finally{

                if (!controller.signal.aborted){

                    setAuthLoading(false);
                }
            }
        }

        restoreSession();

        return () => controller.abort();
    }, []);

    //Login med e-post + lösenord
    async function login(email, password){

        const response = await fetch(`${API_URL}/api/auth/login`,{
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok){
            throw new Error(data.message || "Login failed");
        }

        setCurrentUser(data.user);

        return data.user;
    }

    //logout + rensa user i react
    async function logout() {
        const response = await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Logout failed");
        }

        setCurrentUser(null);
    }

    const value = {
        currentUser,
        authLoading,
        login,
        logout
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

function useUser() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUser must be used inside UserProvider");
    }

    return context;
}

export {UserProvider, useUser};
