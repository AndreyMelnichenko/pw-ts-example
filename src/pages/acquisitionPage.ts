import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { IEventDetails } from "../models/eventDetails"
import * as RandomHelper from "../utils/randomHelper"
import { AcquisitionLocalPage } from "./acquisitionLocalPage"
import { BasePage } from "./basePage"
import { SearchFilter } from "./components/searchFilter"
import { SearchPage } from "./searchPage"

export class AcquisitionPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly searchFilter: SearchFilter
    private readonly setEventDetailsModal = "[data-tid='SearchForm']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.searchFilter = new SearchFilter(this.page, isMobile)
    }

    async pageLoaded(): Promise<AcquisitionPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/suppliers\/.*\/.*\//g)
        await this.uiElement.waitForElementVisible("[data-chunk='searchForm']")
        await this.uiElement.waitForElementVisible(".ui.grid .title-grid")

        return this
    }

    async openFirstAcquisitionLocalPage(): Promise<AcquisitionLocalPage> {
        await this.uiElement.clickOnElement("section a[href*='suppliers']")

        return new AcquisitionLocalPage(this.page, this.isMobile).pageLoaded()
    }

    async setEventDetails(eventDetails: IEventDetails, isIos = false): Promise<SearchPage> {
        await this.openEventDetailsModal()
        await this.searchFilter.setDate(eventDetails.date, isIos)
        await this.searchFilter.setEventType(eventDetails.eventType)
        await this.searchFilter.setGuestAmount(eventDetails.guestAmount)
        await this.searchFilter.setPostcode(eventDetails.postcode)
        await this.uiElement.button.clickButtonByText("SEARCH")

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async openRandomLocalAcquisitonPage(): Promise<AcquisitionLocalPage> {
        const links = await this.uiElement
            .waitForArray("section a[href*='suppliers']")
        const randelement: number = RandomHelper.getRandomArrayElementIndex(links)
        await links[randelement]?.click()

        return new AcquisitionLocalPage(this.page, this.isMobile).pageLoaded()
    }

    private async openEventDetailsModal(): Promise<void> {
        await this.waitFor(2)
        if (!await this.isModalOpen()) {
            await this.uiElement.clickOnElement("[data-tid='EventDetails']>div", 15000)
        }

    }

    private async isModalOpen(): Promise<boolean> {
        return this.uiElement.isElementDisplayed(this.setEventDetailsModal)
    }
}
