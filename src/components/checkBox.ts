import { Page } from "@playwright/test"
import { BaseComponent } from "./baseComponent"
import { ICheckBox } from "./iCheckbox"

export class Checkbox extends BaseComponent implements ICheckBox {
    private readonly page: Page

    constructor(page: Page) {
        super()
        this.page = page
    }

    async check(checkBoxText: string, timeout: number = this.timeout): Promise<void> {
        const locator = this.page.locator(`//div[@data-tid='Checkbox']//*[text()='${checkBoxText}']`)
        await locator.waitFor({ state: "visible", timeout})
        await locator.click()
    }
    async checkByTextContains(checkBoxText: string, timeout: number = this.timeout): Promise<void> {
        const locator = this.page.locator(`//div[@data-tid='Checkbox']//*[contains(text(),'${checkBoxText}')]`)
        await locator.waitFor({ state: "visible", timeout})
        await locator.click()
    }
    uncheck = (selector: string): void => {
        // [data-tid='Checkbox']>input[type='checkbox']
        throw new Error("Method not implemented.")
    }
    async isChecked(checkBoxText: string): Promise<boolean> {
        const locator = this.page.locator(
            `//div[@data-tid='Checkbox']//*[text()='${checkBoxText}']//ancestor-or-self::div[@data-tid='Checkbox']/div[1]`)
            const style = await locator.getAttribute("style") || ""

        return style.includes("background: rgb(0, 0, 0)")
    }

}
