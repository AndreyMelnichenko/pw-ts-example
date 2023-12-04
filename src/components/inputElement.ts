import { Page } from "@playwright/test"
import { BaseComponent } from "./baseComponent"
import { IInput } from "./iInput"
import { TextElement } from "./textElement"

export class InputElement extends BaseComponent implements IInput {
    private readonly page: Page

    constructor(page: Page) {
        super()
        this.page = page
    }
    async getText(selector: string, timeout: number = this.timeout): Promise<string> {
        return new TextElement(this.page).getElementText(selector, timeout)
    }

    async setText(selector: string, text: string, timeout: number = this.timeout): Promise<InputElement> {
        const locator = this.page.locator(selector).nth(0)
        await locator.waitFor({ state: "visible", timeout })
        await locator.focus({ timeout })
        await locator.fill(text, { timeout })

        return this
    }

    async typeText(selector: string, text: string, timeout: number = this.timeout): Promise<InputElement> {
        const locator = this.page.locator(selector)
        await locator.waitFor({ state: "visible", timeout })
        await locator.focus({ timeout })
        await locator.type(text, {delay: 500, timeout})

        return this
    }

    getInputSelector = (placeholder: string): string => {
        return `input[data-tid="Input"][placeholder='${placeholder}']`
    }

    async uploadFile(path: string): Promise<void> {
        await this.page.setInputFiles("input[type='file']", path)
    }
}
