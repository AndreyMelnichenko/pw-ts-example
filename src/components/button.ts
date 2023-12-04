import { Page } from "@playwright/test"
import config from "../../playwright.config"
import { IButton } from "./iButton"
import { TextElement } from "./textElement"

export class Button implements IButton {
    private readonly page: Page
    private readonly timeout: number = config.timeout || 15000

    constructor(page: Page) {
        this.page = page
    }

    async clickButton(selector: string, timeout: number = this.timeout): Promise<void> {
        const locator = this.page.locator(selector)
        await locator.nth(0).waitFor({ state: "visible", timeout })
        await this.page.waitForTimeout(300)
        await locator.nth(0).click({ timeout: this.timeout })
    }

    async isEnabled(selector: string): Promise<boolean> {
        const locator = this.page.locator(selector)

        return locator.isEnabled({ timeout: this.timeout })
    }

    async getText(selector: string, timeout?: number): Promise<string> {
        return new TextElement(this.page).getElementText(selector, timeout || this.timeout)
    }

    async clickButtonByText(text: string): Promise<void> {
        await this.clickButton(this.getButtonSelector(text), 15000)
    }

    async isButtonWithTextVisible(text: string): Promise<boolean> {
        const locator = this.page.locator(this.getButtonSelector(text))

        return locator.isVisible({ timeout: this.timeout })
    }

    getButtonSelector = (text: string): string => {
        return `//button[@data-tid='Button']//span[text()='${text}']`
    }
}
