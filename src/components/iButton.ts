export type IButton = {
    clickButton(selector: string): Promise<void>
    isEnabled(selector: string): Promise<boolean> | boolean
    getText(selector: string): Promise<string> | string
}
