import { Page } from "@playwright/test"
import { BaseComponent } from "./baseComponent"
import { IDropDown } from "./iDropDown"

export class DropDownSelect extends BaseComponent implements IDropDown {
    private readonly page: Page

    constructor(page: Page) {
        super()
        this.page = page
    }

    getValue = (selector: string): string => {
        throw new Error("Method not implemented.")
    }

    async setValue(dropDownSelector: string, value: string, nodeNumber = 1): Promise<void> {
        const option = await this.page.$(`//option[text()='${value}']`)
        await this.page.waitForSelector(dropDownSelector, { timeout: this.timeout })
        await this.page.selectOption(dropDownSelector, option, nodeNumber)
        await this.page.waitForTimeout(1000)
    }
}
