export type IElement = {
    isElementDisplayed(selector: string): Promise<boolean> | boolean
}
