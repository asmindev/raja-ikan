import api from '@/lib/api';

export const productApi = {
    toggleStatus: async (productId: number, isActive: boolean) => {
        const response = await api.patch<{
            success: boolean;
            message: string;
            data: {
                id: number;
                is_active: boolean;
            };
        }>(`/admin/products/${productId}/toggle-status`, {
            is_active: isActive,
        });
        return response.data;
    },
};
