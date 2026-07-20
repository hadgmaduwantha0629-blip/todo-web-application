"use client"

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => { 
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken) {
            setToken(savedToken);
        }

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    return(
        <AuthContext.Provider
            value={{
                user,
                setUser,
                token,
                setToken,
            }} > {children}</AuthContext.Provider>
    );

}

export function useAuth() {
    return useContext(AuthContext);
}