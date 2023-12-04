import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { IEventDetails } from "../models/eventDetails"
import * as RandomHelper from "../utils/randomHelper"
import { BasePage } from "./basePage"
import { SearchFilter } from "./components/searchFilter"
import { SearchPage } from "./searchPage"
import { ServicePage } from "./servicePage"

export class AcquisitionLocalPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly searchFilter: SearchFilter
    private readonly mobileEventDetailsInput = "[data-tid='Date']"
    private readonly mobileSearchForm = "[data-tid='SearchForm']"
    private readonly dateInput: string = "[placeholder='Date']"
    private readonly eventType: string = "[placeholder='Event/occasion type']"
    private readonly guestAmount: string = "[placeholder='Guests (up to)']"
    private readonly postcode: string = "[placeholder='Event postcode']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.searchFilter = new SearchFilter(this.page, this.isMobile)
    }

    async pageLoaded(): Promise<AcquisitionLocalPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/suppliers\/.*\/.*\//g)
        await this.uiElement.waitForElementVisible("[data-chunk='searchForm']")
        await this.uiElement.waitForElementVisible(".ui.grid .title-grid")

        return this
    }

    async clickOnSearch(): Promise<SearchPage> {
        await this.uiElement.clickOnElement(
            this.uiElement.button.getButtonSelector("SEARCH"),
        )

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async setEventDetails(eventDetails: IEventDetails, isIos = false): Promise<SearchPage> {
        await this.searchFilter.setDate(eventDetails.date, isIos)
        await this.searchFilter.setEventType(eventDetails.eventType)
        await this.searchFilter.setGuestAmount(eventDetails.guestAmount)
        await this.searchFilter.setPostcode(eventDetails.postcode)
        await this.clickOnSearch()

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async getPrefill(isMobile = false): Promise<IEventDetails> {
        let actPrefillDate: IEventDetails = {}
        if (isMobile) {
            actPrefillDate = await this.getMobilePrefill()
        } else {
            actPrefillDate.date = await this.getDatePrefill()
            actPrefillDate.eventType = (await this.getEventTypePrefill()).trim()
            actPrefillDate.guestAmount = await this.getGuestAmountPrefill()
            actPrefillDate.postcode = (await this.getPostCodePrefill()).replace(" ", "").toUpperCase()
        }

        return actPrefillDate
    }

    async openRandomLocalAcquisitonCard(): Promise<ServicePage> {
        const links = await this.uiElement
            .waitForArray("[ga-tid='PackageCard']")
        const randelement: number = RandomHelper.getRandomArrayElementIndex(links)
        await links[randelement]?.click()

        return new ServicePage(this.page, this.isMobile).pageLoaded()
    }

    private async getDatePrefill(): Promise<string> {
        return this.uiElement.getAttribute(this.dateInput, "value")
    }

    private async getEventTypePrefill(): Promise<string> {
        return this.uiElement.getAttribute(this.eventType, "value")
    }

    private async getGuestAmountPrefill(): Promise<string> {
        return this.uiElement.getAttribute(this.guestAmount, "value")
    }

    private async getPostCodePrefill(): Promise<string> {
        return this.uiElement.getAttribute(this.postcode, "value")
    }

    private async getMobilePrefill(): Promise<IEventDetails> {
        const eventDetail: IEventDetails = {}
        eventDetail.date = await this.uiElement
            .getAttribute("[data-tid='EventDetails'] [data-tid='Input']", "value", 15000)
        eventDetail.eventType =
            (await this.uiElement.getText("//div[@data-tid='EventDetails']/div[2]/div[1]"))
                .trim()
        eventDetail.guestAmount =
            (await this.uiElement.getText("//div[@data-tid='EventDetails']/div[2]/div[2]"))
                .replace("Guests", "").trim()
        eventDetail.postcode =
            (await this.uiElement.getText("//div[@data-tid='EventDetails']/div[2]/div[3]"))
                .replace(" ", "").trim()

        return eventDetail
    }
}
