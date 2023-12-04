import { expect, Page } from "@playwright/test"
import { ISearchPrefill } from "../../src/models/searchPrefill"
import { ImgResizeController } from "../Api/Controllers/imgResizeController"
import { UIElement } from "../components/uiElement"
import { IEventDetails } from "../models/eventDetails"
import { ImageProps } from "../models/imageProps"
import { MobileRootCategories, RootCategories } from "../models/rootCategories"
import * as DataHelper from "../utils/dataHelper"
import * as DateHelper from "../utils/dateHelper"
import * as RandomHelper from "../utils/randomHelper"
import * as StringHelper from "../utils/stringHelper"
import { BasePage } from "./basePage"
import { LeftSideMenu } from "./components/leftMenu"
import { SearchFilter } from "./components/searchFilter"
import { ServicePage } from "./servicePage"

export class SearchPage extends BasePage {
    private readonly cards: string = "//div[@data-tid='Card']"
    private readonly cardGrid: string = "[data-tid='CardGrid']"
    private readonly dateInput: string = "[placeholder='Date']"
    private readonly eventType: string = "[placeholder='Event type'],[placeholder='Event/occasion type']"
    private readonly guestAmount: string = "[placeholder='Guests'],[placeholder='Guests (up to)']"
    private readonly postcode: string = "[placeholder='Postcode'],[placeholder='Event postcode']"
    private readonly mobileEventDetailsInput = "[data-tid='EventDetails']"
    private readonly mobileSearchForm = "[data-tid='SearchForm']"
    private readonly searchFilter: SearchFilter
    private readonly uiElement: UIElement
    private readonly imgResizeController: ImgResizeController
    private readonly sideBarMenu: LeftSideMenu

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.searchFilter = new SearchFilter(this.page, this.isMobile)
        this.imgResizeController = new ImgResizeController(this.page)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
    }

    async pageLoaded(): Promise<SearchPage> {
        await this.uiElement.waitForUrl(/.*\/search\/?.*/g, 35000)
        if (!this.isMobile) {
            await this.uiElement.waitForElementVisible(this.dateInput, 15000)
            await this.uiElement.waitForElementVisible(this.eventType)
            await this.uiElement.waitForElementVisible(this.guestAmount)
            await this.uiElement.waitForElementVisible(this.postcode)
        }
        const url = this.page.url()
        if (url.includes("category_slugs")) {
            await this.uiElement.waitForArray(this.cards, 15000)
        }

        return this
    }

    async setEventCategory(categoryName: string): Promise<SearchPage> {
        await this.waitForFilter("Price range")
        await this.uiElement.clickOnElement(`//div[@data-scrollbar="hide"]//div[text()='${categoryName}']`)
        await this.waitLoader(25000)

        return this
    }

    async setPriceRange(price: "Affordable" | "Mid Range" | "Premium" | "All"): Promise<void> {
        await this.uiElement.clickOnElement(this.getFilterSelector("Price range"))
        if (this.isMobile) {
            await this.uiElement.dropDownSelect
                    .setValue("//*[@data-tid='Dropdown']/select", price)
        } else {

            await this.setDropDownFilter("Price range", price)
        }
        await this.waitLoader(25000)
    }

    async clickOnServiceByName(serviceName: string): Promise<ServicePage> {
        const cardsArr = await this.uiElement.waitForArray(this.cards)
        await this.uiElement
            .clickOnElement(`//div[@data-tid='CardGrid']//div[@data-tid='Card']//*[text()='${serviceName}']`)

        return new ServicePage(this.page).pageLoaded()
    }

    async clickOnRandomService(): Promise<ServicePage> {
        const cardsArr = await this.uiElement.waitForArray(this.cards)
        const randomCardIndex: number = RandomHelper.getRandomInt(1, cardsArr.length)
        await this.uiElement.clickOnElement(`(${this.cards})[${randomCardIndex}]`)

        return new ServicePage(this.page, this.isMobile).pageLoaded()
    }

    async isPrefillEmailFollow(expPrefillDate: ISearchPrefill): Promise<boolean> {
        const actPrefillDate: ISearchPrefill = {}
        actPrefillDate.date = await this.getDatePrefill()
        actPrefillDate.event_type_slug = (await this.getEventTypePrefill()).replace(" ", "_").toLocaleLowerCase()
        actPrefillDate.guests_number = Number(await this.getGuestAmountPrefill())
        actPrefillDate.location = (await this.getPostCodePrefill()).toLocaleLowerCase().replace(" ", "")
        expect(expPrefillDate).toEqual(actPrefillDate)

        return true
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

    async isPrefill(): Promise<boolean> {
        let isPrefill = false
        const actPrefillDate: IEventDetails = await this.getPrefill(this.isMobile)
        isPrefill = (
                actPrefillDate.date !== "" &&
                actPrefillDate.eventType !== "" &&
                actPrefillDate.guestAmount !== "" &&
                actPrefillDate.postcode !== ""
        )

        return isPrefill
    }

    async setEventDetails(eventDetails: IEventDetails, isIos = false): Promise<SearchPage> {
        if (this.isMobile) {
            await this.uiElement.clickOnElement(this.mobileEventDetailsInput)
            await this.uiElement.waitForElementVisible(this.mobileSearchForm)
        }
        if (eventDetails.date) await this.searchFilter.setDate(eventDetails.date, isIos)
        if (eventDetails.eventType) await this.searchFilter.setEventType(eventDetails.eventType)
        if (eventDetails.guestAmount) await this.searchFilter.setGuestAmount(eventDetails.guestAmount)
        if (eventDetails.postcode) await this.searchFilter.setPostcode(eventDetails.postcode)

        return this
    }

    async isMobileSearchForm(): Promise<boolean> {
        return this.uiElement.isElementDisplayed(this.mobileSearchForm)
    }

    async clickOnSerachButton(): Promise<SearchPage> {
        if (!this.isMobile) {
            await this.uiElement.clickOnElement("[data-tid='SearchForm'] button[data-tid='ClipButton']")
        } else {
            await this.uiElement.button.clickButtonByText("SEARCH")
        }
        await this.waitLoader(25000)

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async checkReSize(): Promise<void> {
        const selector = "[data-tid='Card']>div>div:not([data-tid='Rank']):first-child"
        const img = this.page.locator(selector)
        const pageImg: ImageProps = await this.imgResizeController.getImageSize(img)
        const imgServiceLink = await this.imgResizeController.getResizedImgLink(img)
        await this.page.waitForTimeout(2000)
        await this.page.goto(imgServiceLink)
        await this.page.waitForTimeout(2000)
        const imgNatural = this.page.locator("img")
        const imgNaturalClientSize = await this.imgResizeController.getImgNaturalSize(imgNatural)
        const imgNaturalSize = await this.imgResizeController.getImgSize(imgNatural)
        expect(pageImg.height / imgNaturalClientSize.height).toBeLessThanOrEqual(1.5)
        expect(pageImg.width / imgNaturalClientSize.width).toBeLessThanOrEqual(1.5)
        expect(imgNaturalClientSize.height).toEqual(imgNaturalSize.height)
        expect(imgNaturalClientSize.width).toEqual(imgNaturalSize.width)
    }

    async getServiceCardImgProps(serviceName: string): Promise<string> {
        const locator = this.page.
            locator(`//div[@data-tid='CardGrid']//div[@data-tid='Card']//*[text()='${serviceName}']/../../div/div[@style]`)

        return this.imgResizeController.getResizedImgLink(locator)
    }

    async isCategoryChoosen(category: string): Promise<boolean> {
        return this.uiElement
            .isElementDisplayed(`//span[@data-activate and contains(@style, 'color: rgb(0, 0, 0)')]//div[text()='${category}']`,
            15000)
    }

    async isSubCategoryChoosen(): Promise<boolean> {
        let selector = ""
        this.isMobile
            ? selector = "//div[@data-tid='Dropdown']//option[text()='Choose subcategory...']/.."
            : selector = "[placeholder='Choose subcategory...']"

        return this.uiElement
            .isElementDisplayed(selector)
    }

    async goToPaginationPage(pageNumber: string): Promise<SearchPage> {
        await this.uiElement.clickOnElement(`//div[@data-tid='Stack']//div[text()='${pageNumber}']`)
        await this.waitLoader(25000)

        return this
    }

    async isAlternativeBlocks(): Promise<boolean> {
        const blocks = await this.uiElement.waitForArray("[data-tid='CardCarousel']", 20000)

        return blocks.length > 2
    }

    async openRandomAlternativeCard(): Promise<ServicePage> {
        const cards = await this.uiElement.waitForArray("[data-tid='CardCarousel']", 20000)
        const index = RandomHelper.getRandomArrayElementIndex(cards)
        await cards[index]?.click()

        return new ServicePage(this.page, this.isMobile).pageLoaded()
    }

    async isBasePrice(): Promise<string> {
        const selector = "//div[@data-tid='Card']//span[contains(text(), 'from ')]/../../../h3"
        const cards = await this.uiElement
            .waitForArray(selector)
        const index = RandomHelper.getRandomArrayElementIndex(cards)

        return this.uiElement.getText(`(${selector})[${index}]`)
    }

    async getServicePrice(serviceName: string): Promise<string> {
        const price = await this.uiElement.getAttribute(
            `//div[@data-tid='Card']//h3[text()='${serviceName}']/following-sibling::footer/data`, "value", 15000)

        return price
    }

    async chooseCategoryFromSideMenu<T extends RootCategories>(category: T[keyof T]): Promise<SearchPage> {
        await this.sideBarMenu.openSideBarMenu()
        await this.sideBarMenu.clikcOnCategory(category as string)
        await this.waitLoader(25000)

        return this
    }

    async getRootCategoryValue(isMobile = false): Promise<string> {
        let value = ""
        if (isMobile) {
            const mobileSelectValue = await this.getDropDownFilterValue("ROOT")
            const normalizedKeyValue = DataHelper.getKeyByValue(MobileRootCategories, mobileSelectValue)
            value = DataHelper.getValueByKey(RootCategories, normalizedKeyValue)
        } else {
            const locator = `${this.getFilterSelector("Choose category")}//input`
            value = await this.uiElement.getAttribute(locator, "value")
        }

        return value
    }

    async isHighliteCardDisplayed(): Promise<boolean> {
        const selector = "//div[@data-tid='Card' and contains(@style, 'background: rgb(247, 247, 237)')]"
        const cards = await this.uiElement.getLocatorArraySize(selector)

        return cards === 1
    }

    private async getMobilePrefill(): Promise<IEventDetails> {
        const eventDetail: IEventDetails = {}
        await this.uiElement.clickOnElement("[data-tid='EventDetails']")
        await this.uiElement.waitForElementVisible("[data-tid='SearchForm']")
        eventDetail.date = await this.uiElement.getAttribute(this.searchFilter.dateInput, "value")
        eventDetail.date = DateHelper.convertDateFromTo(eventDetail.date, "YYYY-MM-DD", "D MMM YYYY")
        eventDetail.eventType = StringHelper.capitalizerFirstLetter(await this.page
                .evaluate("document.querySelector(\"[data-tid='SearchForm'] select\").value"))
        eventDetail.guestAmount = await this.uiElement.getAttribute(this.searchFilter.guestAmount, "value")
        eventDetail.postcode = await this.uiElement.getAttribute(this.searchFilter.postcode, "value")
        eventDetail.postcode = eventDetail.postcode.toUpperCase().replace(" ", "")
        await this.closeMobileModal()

        return eventDetail
    }

    private async closeMobileModal(): Promise<void> {
        await this.uiElement.clickOnElement("//*[@data-tid='ProgressHeader']//*[@data-tid='Vec']")
        await this.uiElement.waitForElementVisible("[data-tid='Form']", 15000, true)
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

    private readonly getFilterSelector = (filterName: string): string => {
        return `//div[text()='${filterName}']/following-sibling::div`
    }

    private async waitForFilter(selector: string): Promise<void> {
        await this.uiElement.waitForElementVisible(this.getFilterSelector(selector))
    }

    private async setRootCategory(filterValue: string): Promise<void> {
        await this.uiElement.clickOnElement(this.getFilterSelector("Choose category"))
        await this.setDropDownFilter("Choose category", filterValue)
    }

    private async setSubCategory(filterValue: string): Promise<void> {
        const subCategorySelector = "input[placeholder='Select...']"
        await this.setRootCategory(filterValue)
    }

    private async setDropDownFilter(filterTitle: string, text: string): Promise<void> {
        const dropdownArea = "//div[@data-tid='Dropdown']/following-sibling::div"
        await this.uiElement.waitForElementVisible(dropdownArea)
        const dropDownItem = `${dropdownArea}//div[text()='${text}']`
        await this.uiElement.waitForElementVisible(dropDownItem)
        await this.uiElement.clickOnElement(dropDownItem)
        await this.uiElement.waitForElementVisible(
            `${this.getFilterSelector(filterTitle)}//input[@value='${text}']`)
    }

    private async getDropDownFilterValue(categoryFilter: "ROOT" | "SUB" | "PRICE"): Promise<string> {
        let filterIndex = "0"
        if (categoryFilter === "SUB") filterIndex = "1"
        if (categoryFilter === "PRICE") filterIndex = "2"
        const nodeValue: string =
            await this.page.evaluate(`document.querySelectorAll("[data-tid='Dropdown']>select")[${filterIndex}].value`)

        return nodeValue
    }
}
