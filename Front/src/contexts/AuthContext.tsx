import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthApiService, RegisterData } from '../services/authService';

interface User {
    IDUsuario: number;
    userRole: number;
    userName: string;
    roleName?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const result = await AuthApiService.login({ email, password });
            
            if (result.success && result.data) {
                const userData: User = {
                    IDUsuario: result.data.userId,
                    userRole: result.data.userRole,
                    userName: result.data.userName || 'Usuario',
                    roleName: result.data.roleName
                };
                
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                
                return { 
                    success: true, 
                    message: result.message || "Inicio de sesión exitoso" 
                };
            } else {
                return { 
                    success: false, 
                    message: result.message || "Error en el inicio de sesión" 
                };
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error de conexión";
            return { 
                success: false, 
                message 
            };
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            const result = await AuthApiService.register(userData);

            if (result.success) {
                return { 
                    success: true, 
                    message: result.message || "Registro exitoso" 
                };
            } else {
                return { 
                    success: false, 
                    message: result.message || "Error en el registro" 
                };
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Error de conexión durante el registro";
            return { 
                success: false, 
                message 
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}
