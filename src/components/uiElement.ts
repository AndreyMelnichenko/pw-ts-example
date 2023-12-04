import { ElementHandle, Locator, Page } from "@playwright/test"
import { BaseComponent } from "./baseComponent"
import { Button } from "./button"
import { Checkbox } from "./checkBox"
import { DropDownInput } from "./dropDownInput"
import { DropDownSelect } from "./dropDownselect"
import { IElement } from "./iElement"
import { InputElement } from "./inputElement"
import { TextElement } from "./textElement"

export class UIElement extends BaseComponent implements IElement {
    button: Button
    input: InputElement
    textElement: TextElement
    dropDownInput: DropDownInput
    checkbox: Checkbox
    dropDownSelect: DropDownSelect
    protected page: Page

    constructor(page: Page) {
        super()
        this.page = page
        this.button = new Button(page)
        this.textElement = new TextElement(page)
        this.input = new InputElement(page)
        this.dropDownInput = new DropDownInput(page)
        this.checkbox = new Checkbox(page)
        this.dropDownSelect = new DropDownSelect(page)
    }

    async waitForElementVisible(selector: string, timeout: number = this.timeout, isReverse = false): Promise<Locator> {
        const locator = this.page.locator(selector)
        if (!isReverse) {
            await locator.first().waitFor({ state: "visible", timeout })
            if (!await locator.first().isVisible({ timeout })) {
                await locator.first().hover({ timeout })
            }
        } else {
            await locator.first().waitFor({ state: "hidden", timeout })
        }

        return locator
    }

    async waitForArray(selector: string, timeout: number = this.timeout): Promise<Array<ElementHandle>> {
        const locator = this.page.locator(selector)
        await locator.first().waitFor({ state: "attached", timeout })
        await locator.first().hover({ timeout })

        return locator.elementHandles()
    }

    async getLocatorArraySize(selector: string): Promise<number> {
        const locator = this.page.locator(selector)
        if (await this.isElementDisplayed(selector, 5000)) {
            await locator.first().waitFor({ state: "visible", timeout: this.timeout })

            return locator.count()
        }

        return 0
    }

    async waitForArraySize(selector: string, size: number, timeout: number = this.timeout): Promise<void> {
        const locator = this.page.locator(selector)
        await locator.first().waitFor({ state: "attached", timeout })
        await locator.evaluateAll((divs: Array<ElementHandle<string>>, min: number) => divs.length >= min, size)
    }

    async isElementDisplayed(selector: string, timeout: number = this.timeout): Promise<boolean> {
        try {
            await this.waitForElementVisible(selector, timeout)

            return true
        } catch (error) {

            return false
        }
    }

    async clickOnElement(selector: string, timeout: number = this.timeout): Promise<void> {
        await this.waitForElementVisible(selector, timeout)
        await this.page.click(selector)
    }

    async clickOnLastElement(selector: string, timeout: number = this.timeout): Promise<void> {
        const locator = this.page.locator(selector)
        await locator.last().click({ timeout })
    }

    async waitForPage(
        state?: "load" | "domcontentloaded" | "networkidle",
        timeout: number = this.timeout,
    ): Promise<void> {
        await this.page.waitForLoadState(state, { timeout })
    }

    async getText(selector: string, timeout: number = this.timeout): Promise<string> {
        await this.waitForElementVisible(selector, timeout)
        const element = await this.page.textContent(selector, { timeout })
        if (element === null) {
            throw new Error("Element NULL")
        }

        return element
    }

    async waitForUrl(url: string | RegExp, timeout = 15000): Promise<void> {
        await this.page.waitForURL(url, { timeout })
    }

    async scrollToElement(selector: string, timeout: number = this.timeout): Promise<void> {
        const locator = await this.waitForElementVisible(selector, timeout)
        await locator.hover({ timeout })
    }

    async getAttribute(selector: string, attributeName: string, timeout: number = this.timeout): Promise<string> {
        const locator = await this.waitForElementVisible(selector, timeout)
        const element = await locator.first().getAttribute(attributeName, { timeout })
        if (element === null) {
            throw new Error("Element NULL")
        }

        return element
    }

    async isVisible(selector: string): Promise<boolean> {
        const locator = this.page.locator(selector)

        return locator.first().isVisible({ timeout: this.timeout })
    }

    async isExists(selector: string): Promise<boolean> {
        const locator = this.page.locator(selector)
        try {
            await locator.first().waitFor({ state: "attached", timeout: this.timeout })

            return true
        } catch (error) {
            return false
        }
    }
}
