export type ICheckBox = {
    check(selector: string): Promise<void>
    uncheck(selector: string): void
    isChecked(selector: string): void
}
