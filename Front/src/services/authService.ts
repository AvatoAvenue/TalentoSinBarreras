import { apiService } from './api';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    nombre: string;
    email: string;
    password: string;
    rol: string;
    fechaNacimiento?: string;
    institucionEducativa?: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        userId: number;
        userRole: number;
        userName?: string;
        roleName?: string;
    };
}

export class AuthApiService {
    static async login(loginData: LoginData): Promise<AuthResponse> {
        return apiService.post('/auth/login', loginData);
    }

    static async register(registerData: RegisterData): Promise<AuthResponse> {
        return apiService.post('/auth/register', registerData);
    }

    static async getProfile(userId: number) {
        return apiService.get(`/auth/profile/${userId}`);
    }
}
