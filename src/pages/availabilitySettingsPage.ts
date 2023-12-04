import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { Day } from "../models/days"
import { BasePage } from "./basePage"
import { SuppCalendarPage } from "./suppCalendarPage"

export class AvailabilitySettingsPage extends BasePage {
    private readonly uiElement: UIElement

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<AvailabilitySettingsPage> {
        await this.page.waitForLoadState("domcontentloaded", { timeout: 35000 })
        await this.uiElement.waitForUrl(/.*\/s\/calendar\/availability-settings\//, 35000)
        await this.uiElement.waitForElementVisible("//h1[text()='Availability Settings']", 15000)

        return this
    }

    async getNoticePeriod(): Promise<string> {
        return this.uiElement.getAttribute("[placeholder='Days']", "value")
    }

    async setNoticePeriod(days: string): Promise<SuppCalendarPage> {
        await this.uiElement.input.setText("[placeholder='Days']", days)
        await this.uiElement.button.clickButtonByText("SAVE")

        return new SuppCalendarPage(this.page, this.isMobile).pageLoaded()
    }

    async chooseRestrictedDay(day: Day): Promise<SuppCalendarPage> {
        await this.unselectAlldays()
        await this.uiElement.clickOnElement(`//div[text()='${day}']`)
        await this.uiElement.button.clickButtonByText("SAVE")
        await this.waitFor(3)

        return new SuppCalendarPage(this.page, this.isMobile).pageLoaded()
    }

    private async unselectAlldays(): Promise<void> {
        const selector = "//div[@data-tid='Checkbox']/div[contains(@style, 'background: rgb(0, 0, 0)')]/following-sibling::div/div"
        const days = await this.uiElement.waitForArray(selector)
        for (const day of days) {
            await day.click({ timeout: 5000 })
        }
    }

}
