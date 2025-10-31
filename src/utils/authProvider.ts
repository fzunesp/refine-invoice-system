
import type { AuthProvider } from "@refinedev/core";
import PocketBase from "pocketbase";

export const authProvider = (client: PocketBase): AuthProvider => ({
    login: async ({ email, password }) => {
        try {
            await client.collection("users").authWithPassword(email, password);
            return {
                success: true,
                redirectTo: "/",
            };
        } catch (error) {
            return {
                success: false,
                error: new Error("Invalid email or password"),
            };
        }
    },
    logout: async () => {
        client.authStore.clear();
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        if (client.authStore.isValid) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
            redirectTo: "/login",
        };
    },
    getPermissions: async () => {
        // TODO: handle permissions
        return null;
    },
    getIdentity: async () => {
        if (client.authStore.isValid) {
            return {
                ...client.authStore.model,
            };
        }
        return null;
    },
    onError: async (error) => {
        if (error.status === 401) {
            return {
                logout: true,
            };
        }

        return {};
    }
});
