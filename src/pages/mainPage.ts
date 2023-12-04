import { ElementHandle, Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { IEventDetails } from "../models/eventDetails"
import * as RandomHelper from "../utils/randomHelper"
import { AcquisitionPage } from "./acquisitionPage"
import { BasePage } from "./basePage"
import { SearchFilter } from "./components/searchFilter"
import { LoginPage } from "./loginPage"
import { SearchPage } from "./searchPage"
import { ServicePage } from "./servicePage"
import { SignUpPage } from "./signUpPage"
import { VenuePage } from "./venuePage"

export class MainPage extends BasePage {
    private readonly mainText: string = ".landing-main-block-container h1"
    private readonly dateInput: string = "input[placeholder=\"Date\"]"
    private readonly serachContainer: string = "div[data-chunk='searchForm']"
    private readonly header: string = "[data-chunk='header']"
    private readonly serachButton: string = "[data-tid='SearchForm'] [data-tid='Button']"
    private readonly venuesItem: string = "a[href='/venues/']"
    private readonly subVenuesLinks: string = "//a[contains(@href,'/venues/') and not(@href='/venues/')]"
    private readonly subVenuesByText: string = "//a[contains(@href,'/venues/') and text()='%s']"
    private readonly card: string = "//div[@data-tid='Card']"
    private readonly addFilters: string = "//button[@data-tid='Button']//span[text()='ADD FILTERS']"
    private readonly uiElement: UIElement
    private readonly searchFilter: SearchFilter

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
        this.searchFilter = new SearchFilter(this.page, isMobile)
        this.isMobile = isMobile
    }

    async pageLoaded(): Promise<MainPage> {
        await this.uiElement.waitForElementVisible(this.serachContainer, 35000)
        await this.uiElement.waitForPage("domcontentloaded")
        await this.uiElement.waitForElementVisible(this.header, 15000)
        await this.uiElement.waitForElementVisible(this.header)

        return this
    }

    async isMainText(expectedText: string): Promise<boolean> {
        const textelement: string = await new UIElement(this.page).textElement.getElementText(this.mainText)

        return textelement === expectedText
    }

    async isDateInputVisible(): Promise<boolean> {
        const uiElement: boolean = await new UIElement(this.page).isElementDisplayed(this.dateInput)

        return uiElement
    }

    async openSupplierSingUp(): Promise<SignUpPage> {
        await this.uiElement.clickOnElement("//div[@data-chunk='header']//div[@data-tid='Dialog']//*[@data-tid='Vec']")
        await this.uiElement.clickOnElement("a[href='/signup']")

        return new SignUpPage(this.page).pageLoaded()
    }

    async openLoginForm(isMobile = false): Promise<LoginPage> {
        this.isMobile = isMobile
        await this.uiElement
            .clickOnElement("//div[@data-chunk='header']//div[@data-tid='Dialog']//*[@data-tid='Vec']", 25000)
        await this.uiElement.clickOnElement("a[href='/auth']")

        return new LoginPage(this.page, isMobile).pageLoaded()
    }

    async clickOnSerachButton(): Promise<SearchPage> {
        await this.uiElement.button.clickButton(this.serachButton, 10000)
        await this.waitLoader(25000)

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async scrollToVenues(): Promise<MainPage> {
        await this.uiElement.scrollToElement(this.venuesItem)

        return this
    }

    async openVenue(venueName: string): Promise<VenuePage> {
        const selector = this.subVenuesByText.replace("%s", venueName)
        await this.uiElement.waitForElementVisible(selector)
        await this.uiElement.clickOnElement(selector)

        return new VenuePage(this.page).pageLoaded()
    }

    async openAcquisitionPage(acquisitionName = "Wedding DJ"): Promise<AcquisitionPage> {
        await this.uiElement
            .clickOnElement(`//div[@data-tid='CategoriesInterlinking']//a[text()='${acquisitionName}']`)

        return new AcquisitionPage(this.page, this.isMobile).pageLoaded()
    }

    async getRandomVenueName(): Promise<string> {
        const venues: Array<ElementHandle> = await this.uiElement.waitForArray(this.subVenuesLinks)
        const randVenue: number = RandomHelper.getRandomArrayElementIndex(venues)
        const textVenue = await venues[randVenue].innerText()

        return textVenue
    }

    async getSearchResults(): Promise<MainPage> {
        await this.uiElement.clickOnElement(this.serachButton)
        await this.uiElement.waitForElementVisible(this.card, 25000)
        await this.uiElement.waitForArray(this.card)
        await this.uiElement.waitForElementVisible(this.addFilters)

        return this
    }

    async setEventDetails(eventDetails: IEventDetails, isIos = false): Promise<MainPage> {
        await this.searchFilter.setDate(eventDetails.date, isIos)
        await this.searchFilter.setEventType(eventDetails.eventType)
        await this.searchFilter.setGuestAmount(eventDetails.guestAmount)
        await this.searchFilter.setPostcode(eventDetails.postcode)

        return this
    }

    async openService(serviceId: string): Promise<ServicePage> {
        await this.page.goto(`/services/${serviceId}/`)

        return new ServicePage(this.page, this.isMobile).pageLoaded()
    }

    async clickCategoryBanner(bannerName = "DJ"): Promise<SearchPage> {
        await this.uiElement.clickOnElement(`//h4[text()='${bannerName}']/..`, 25000)

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }
}
