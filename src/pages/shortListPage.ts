import { expect, Page } from "@playwright/test"

import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { SearchPage } from "./searchPage"
import { ServicePage } from "./servicePage"

export class ShortListPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly wayToAddEventRadio: string = "[data-tid='Stack'] input[type='radio']+div"
    private readonly addNewEventRadio: string = "//div[text()='Create new event']"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<ShortListPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/services\/\d+\/request\/.*/g, 15000)
        await this.uiElement.waitForElementVisible("//div[text()='Choose the event']", 15000)
        const waysToAddEnect = await this.page.$$(this.wayToAddEventRadio)
        expect(waysToAddEnect.length >= 2).toBeTruthy()

        return this
    }

    async addNewEvent(): Promise<ShortListPage> {
        await this.uiElement.clickOnElement(this.addNewEventRadio)
        await this.uiElement.button.clickButtonByText("CHOOSE")
        await this.uiElement.waitForElementVisible("//div[text()='Confirm your account']")
        await this.uiElement.button.clickButtonByText("SAVE SERVICE")
        await this.waitLoader(25000)
        expect(await this.isShrtlistedModalVisible()).toBeTruthy()

        return this
    }

    async clickOnBackToSearch(): Promise<SearchPage> {
        await this.uiElement.button.clickButtonByText("BACK TO SEARCH")

        return new SearchPage(this.page).pageLoaded()
    }

    async clickOnBackToService(): Promise<ServicePage> {
        await this.uiElement.clickOnElement("//a[@href and text()='Back to service']")
        await this.page.waitForTimeout(5000)
        if (await this.uiElement.isElementDisplayed("//a[@href and text()='Back to service']")) {
            await this.uiElement.clickOnElement("//a[@href and text()='Back to service']")
        }

        return new ServicePage(this.page).pageLoaded()
    }

    private async isShrtlistedModalVisible(): Promise<boolean> {
        await this.uiElement.waitForElementVisible("//div[text()='Service was saved to shortlist!']", 15000)
        const firstStr = "We’ve saved this service to your collection. "
        const secondStr = "Now you can back to search, or continue explore this service."
        await this.uiElement.waitForElementVisible(
            `//div[text()='${firstStr}${secondStr}']`,
            10000)

        return true
    }

}
