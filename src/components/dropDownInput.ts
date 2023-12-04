import { expect, Page } from "@playwright/test"
import { BaseComponent } from "./baseComponent"
import { IDropDown } from "./iDropDown"

export class DropDownInput extends BaseComponent implements IDropDown {
    private readonly page: Page

    constructor(page: Page) {
        super()
        this.page = page
    }

    getValue = (selector: string): string => {
        throw new Error(`Method not implemented. ${selector}`)
    }

    async setValue(selector: string, value: string): Promise<void> {
        const baseDropDownSelector = "//div[contains(@style, 'box-shadow: rgba(51, 51, 51, 0.1)')]"
        const dropDownSelector = this.page.locator(baseDropDownSelector)
        const ddSelector = this.page.locator(selector).nth(0)
        await ddSelector.waitFor({ state: "visible", timeout: this.timeout })
        await ddSelector.click({ timeout: this.timeout })
        await dropDownSelector.waitFor({state: "visible", timeout: this.timeout })
        await ddSelector.fill(value)
        const item = this.page.locator(`${baseDropDownSelector}//*[text()='${value}']`)
        await item.waitFor({ state: "visible", timeout: this.timeout })
        await item.click({ timeout: this.timeout })
        expect((await ddSelector.getAttribute("value")) === value).toBeTruthy()
    }

    async chooseValue(selector: string, value: string): Promise<void> {
        const ddSelector = this.page.locator(selector)
        await ddSelector.waitFor({ state: "visible", timeout: this.timeout })
        await ddSelector.click({ timeout: this.timeout })
        const itemSelector = this.page.locator(`//div[@data-tid='Dropdown']/following::div//*[text()='${value}']`)
        await itemSelector.waitFor({ state: "visible", timeout: this.timeout })
        await itemSelector.click()
    }
}
