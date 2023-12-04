export type IInput = {
    getText(selector: string): Promise<string> | string
    setText(selector: string, text: string): Promise<IInput> | IInput
}
