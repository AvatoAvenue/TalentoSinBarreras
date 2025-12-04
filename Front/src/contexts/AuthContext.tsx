import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthApiService, RegisterData } from '../services/authService';

interface User {
    userId: number;
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
            try {
                const parsedUser = JSON.parse(savedUser);
                console.log('🔍 Usuario parseado del localStorage:', parsedUser);
                
                let userId = 0;
                
                // Buscar userId en cualquier propiedad posible
                if (parsedUser.userId && !isNaN(Number(parsedUser.userId))) {
                    userId = Number(parsedUser.userId);
                } else if (parsedUser.IDUsuario && !isNaN(Number(parsedUser.IDUsuario))) {
                    userId = Number(parsedUser.IDUsuario);
                } else if (parsedUser.id && !isNaN(Number(parsedUser.id))) {
                    userId = Number(parsedUser.id);
                }
                
                // Si no encontramos un ID válido, limpiar
                if (userId === 0) {
                    console.warn('Usuario sin ID válido, limpiando localStorage');
                    localStorage.removeItem('user');
                    setUser(null);
                } else {
                    const normalizedUser: User = {
                        userId,
                        userRole: Number(parsedUser.userRole) || 0,
                        userName: parsedUser.userName || 'Usuario',
                        roleName: parsedUser.roleName
                    };
                    
                    console.log('Usuario normalizado:', normalizedUser);
                    setUser(normalizedUser);
                    localStorage.setItem('user', JSON.stringify(normalizedUser));
                }
            } catch (error) {
                console.error("Error al parsear usuario del localStorage:", error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const result = await AuthApiService.login({ email, password });
            console.log("Resultado del login:", result);
            
            if (result.success && result.data) {
                const userId = Number(result.data.userId || result.data.IDUsuario || 0);
                
                if (isNaN(userId) || userId === 0) {
                    console.error("userId no es un número válido:", result.data.userId, result.data.IDUsuario);
                    return { 
                        success: false, 
                        message: "Error: ID de usuario inválido" 
                    };
                }
                
                // Crear objeto normalizado
                const userData: User = {
                    userId,
                    userRole: Number(result.data.userRole),
                    userName: result.data.userName || 'Usuario',
                    roleName: result.data.roleName
                };
                
                console.log("Guardando usuario normalizado:", userData);
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
            console.error("Error completo en login:", error);
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
