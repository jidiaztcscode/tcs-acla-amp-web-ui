export interface User {
    username: string;
    displayName: string;
    role: string;
    roleDisplayName: string;
    permissions: string[];
}

export enum UserRole {
    ADMIN = 'GG-Rol_AMP_Prod_Admin',
    ANALISTA = 'GG-Rol_AMP_Prod_Analista'
}
