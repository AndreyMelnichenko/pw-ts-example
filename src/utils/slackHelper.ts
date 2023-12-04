export type MessageField = { title: string, value: string, short: boolean }
export type MessageFields = { fields: Array<MessageField> }
export type Action = { type: string, name: string, text: string, url: string, style: string }
export type Actions = { actions: Array<Action> }
export type Attachments = {
        color: "good" | "warning" | "danger",
        text: string,
        fields?: Array<MessageField>,
        actions?: Array<Action>
    }

export const getMessageField = (title: string, value: string, short = true): MessageField => {
    return { title, value, short }
}

export const getAttachmentsFields = (fields: Array<MessageField>): MessageFields => {
    return { fields }
}

export const getActionButton = (text: string, url: string): Action => {
    return {
        name: text,
        style: "primary",
        text,
        type: "button",
        url,
    }
}

export const getActions = (actions: Array<Action>): Actions => {
    return { actions }
}
