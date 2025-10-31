
import { DataProvider } from "@refinedev/core";
import PocketBase from "pocketbase";

export const dataProvider = (client: PocketBase): DataProvider => ({
    getList: async ({ resource, pagination, sorters, filters }) => {
        const { current = 1, pageSize = 10 } = pagination ?? {};

        const sorter = sorters?.map((item) => {
            return `${item.order === "desc" ? "-" : ""}${item.field}`;
        }).join(",") ?? "";

        const filter = filters?.map((item) => {
            // TODO: handle more filter operators
            return `${item.field} ${item.operator} "${item.value}"`;
        }).join(" && ") ?? "";

        const { items, totalItems } = await client.collection(resource).getList(current, pageSize, {
            sort: sorter,
            filter: filter,
        });

        return {
            data: items,
            total: totalItems,
        };
    },
    getOne: async ({ resource, id }) => {
        const item = await client.collection(resource).getOne(id as string);
        return {
            data: item,
        };
    },
    create: async ({ resource, variables }) => {
        const item = await client.collection(resource).create(variables);
        return {
            data: item,
        };
    },
    update: async ({ resource, id, variables }) => {
        const item = await client.collection(resource).update(id as string, variables);
        return {
            data: item,
        };
    },
    deleteOne: async ({ resource, id }) => {
        await client.collection(resource).delete(id as string);
        return {
            data: { id } as any,
        };
    },
    getApiUrl: () => {
        return client.baseUrl;
    },
    custom: async ({ url, method, headers, payload }) => {
        const response = await client.send(url, {
            method,
            headers,
            body: payload,
        });
        return {
            data: response as any,
        };
    }
});
