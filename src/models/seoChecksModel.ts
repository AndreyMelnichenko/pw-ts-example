export type SeoCehcksModel = {
    url?: string,
    responseCode?: number,
    title?: string,
    htmlContains?: Array<string>,
    description?: string,
    schema?: Array<string>,
    redirect?: string,
    selector?: Array<string>
}
