import React, { useContext, createContext } from 'react';

// 1. Creamos el contexto. Es como un canal de información global.
const AuthContext = createContext();

// 2. Creamos el Proveedor. Este componente envolverá nuestra app
//    y le "proveerá" el valor del usuario actual a todos sus hijos.
export function AuthProvider({ children, value }) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Creamos un Hook personalizado. En lugar de importar useContext y AuthContext
//    en cada archivo, solo importaremos y usaremos este hook 'useAuth'. Es más limpio.
export const useAuth = () => {
    return useContext(AuthContext);
};
