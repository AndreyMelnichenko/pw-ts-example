export type IDropDown = {
    getValue(selector: string): Promise<string> | string
    setValue(selector: string, value: string): Promise<void>
}
