import { AppConfig } from "../../config.js";

export const getRequestInfo = async (
    config: AppConfig,
    requestId: string
) => {
    const object = await config.client.getObject({
        id: requestId,
        options: {
            showContent: true,
        },
    });

    return object;
};

export const getChangePubkeyRequestInfo = async (
    config: AppConfig,
    requestId: string
) => {
    const object = await config.client.getObject({
        id: requestId,
        options: {
            showContent: true,
        },
    });

    if (object.data?.content && 'fields' in object.data.content) {
        const fields = object.data.content.fields as any;
        return {
            id: fields.id.id,
            new_pubkey: fields.new_pubkey,
            voters: fields.voters,
            deadline: fields.deadline,
            is_executed: fields.is_executed,
        };
    }

    return null;
};

export const getWithdrawRequestInfo = async (
    config: AppConfig,
    requestId: string
) => {
    const object = await config.client.getObject({
        id: requestId,
        options: {
            showContent: true,
        },
    });

    if (object.data?.content && 'fields' in object.data.content) {
        const fields = object.data.content.fields as any;
        return {
            id: fields.id.id,
            to: fields.to,
            amount: fields.amount,
            voters: fields.voters,
            deadline: fields.deadline,
            is_executed: fields.is_executed,
        };
    }

    return null;
};


