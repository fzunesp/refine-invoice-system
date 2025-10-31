
import type { DataProvider, GetListParams, GetListResponse, GetOneParams, GetOneResponse, CreateParams, CreateResponse, UpdateParams, UpdateResponse, BaseRecord } from "@refinedev/core";
import PocketBase from "pocketbase";

export const dataProvider = (client: PocketBase): DataProvider => ({
    getList: async <TData extends BaseRecord = BaseRecord>({ resource, pagination, sorters, filters }: GetListParams): Promise<GetListResponse<TData>> => {
        const { current = 1, pageSize = 10 } = pagination ?? {};

        const sorter = sorters?.map((item) => {
            return `${item.order === "desc" ? "-" : ""}${item.field}`;
        }).join(",") ?? "";

        const filter = filters?.map((item) => {
            // TODO: handle more filter operators
            return `${(item as any).field} ${item.operator} "${item.value}"`;
        }).join(" && ") ?? "";

        const { items, totalItems } = await client.collection(resource).getList(current, pageSize, {
            sort: sorter,
            filter: filter,
        });

        return {
            data: items as unknown as TData[],
            total: totalItems,
        };
    },
    getOne: async <TData extends BaseRecord = BaseRecord>({ resource, id }: GetOneParams): Promise<GetOneResponse<TData>> => {
        const item = await client.collection(resource).getOne(id as string);
        return {
            data: item as unknown as TData,
        };
    },
    create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>({ resource, variables }: CreateParams<TVariables>): Promise<CreateResponse<TData>> => {
        const item = await client.collection(resource).create(variables as any);
        return {
            data: item as unknown as TData,
        };
    },
    update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>({ resource, id, variables }: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> => {
        const item = await client.collection(resource).update(id as string, variables as any);
        return {
            data: item as unknown as TData,
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
