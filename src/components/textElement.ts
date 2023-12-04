import { Page } from "@playwright/test"
import { BaseComponent } from "./baseComponent"
import { IText } from "./iTextElement"

export class TextElement extends BaseComponent implements IText {
    private readonly page: Page

    constructor(page: Page) {
        super()
        this.page = page
    }

    async getElementText(selector: string, timeout: number = this.timeout): Promise<string> {
        const locator = this.page.locator(selector)
        await locator.waitFor({ state: "visible", timeout })

        return locator.innerText()
    }

    async isTextPresent(text: string, timeout: number = this.timeout): Promise<boolean> {
        try {
            const locator = this.page.locator(`//*[text()='${text}']`)
            await locator.nth(0).waitFor({ state: "visible", timeout })

            return true
        } catch (error) {
            return false
        }
    }

    async isTextContains(text: string, timeout: number = this.timeout): Promise<boolean> {
        try {
            const locator = this.page.locator(`//*[contains(text(),'${text}')]`)
            await locator.nth(0).waitFor({ state: "visible", timeout })

            return true
        } catch (error) {
            return false
        }
    }

    async waitForText(text: string, timeout: number = this.timeout, isReverse = false): Promise<void> {
        const locator = this.page.locator(`//*[text()='${text}']`)
        isReverse
            ? await locator.nth(0).waitFor({ state: "hidden", timeout })
            : await locator.nth(0).waitFor({ state: "visible", timeout })
    }
}
