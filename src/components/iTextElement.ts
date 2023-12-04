export type IText = {
    getElementText(selector: string): Promise<string> | string
}
