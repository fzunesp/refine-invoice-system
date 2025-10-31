
import type { LiveProvider } from "@refinedev/core";
import PocketBase from "pocketbase";

export const liveProvider = (client: PocketBase): LiveProvider => ({
    subscribe: ({ channel, types, params, callback }) => {
        const resource = channel.replace("resources/", "");

        const listener = (e: any) => {
            if (types.includes("*") || types.includes(e.action)) {
                if (params?.ids) {
                    if (params.ids.includes(e.record.id)) {
                        callback(e);
                    }
                } else {
                    callback(e);
                }
            }
        };

        client.collection(resource).subscribe("*", listener);

        return {
            unsubscribe: () => {
                client.collection(resource).unsubscribe();
            },
        };
    },
    unsubscribe: (subscription) => {
        subscription.unsubscribe();
    },
});
