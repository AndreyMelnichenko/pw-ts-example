import { Page } from "@playwright/test"
import { ImgResizeController } from "../Api/Controllers/imgResizeController"
import { UIElement } from "../components/uiElement"
import { IEventDetails } from "../models/eventDetails"
import { PriceModifyer, PriveModifyerNameList } from "../models/priceModifyer"
import { IUser } from "../models/user"
import * as DateHelper from "../utils/dateHelper"
import * as RandomHelper from "../utils/randomHelper"
import * as StringHelper from "../utils/stringHelper"
import { BasePage } from "./basePage"
import { CheckoutPage } from "./checkoutPage"
import { LeftSideMenu } from "./components/leftMenu"
import { MessageSupplierFilter } from "./components/messageSupplierFilter"
import { SearchFilter } from "./components/searchFilter"
import { EventListPage } from "./eventListPage"
import { SearchPage } from "./searchPage"

export class ServicePage extends BasePage {
    private readonly uiElement: UIElement
    private readonly slider = "//div[contains(@style, 'user-select: none; cursor: pointer; background: url(\"https://img-staging.poptop.uk.com')]"
    private readonly caclulationWidget = "[name='serviceRequest']"
    private readonly eventDetailsInput = "input[placeholder='Complete event details to view prices']"
    private readonly setEventDetailsModal = "[data-tid='SearchForm'],[data-tid='Form']"
    private readonly sideBarMenu: LeftSideMenu
    private readonly searchFilter: SearchFilter
    private readonly messageSupplierFilter: MessageSupplierFilter
    private readonly imgResizeController: ImgResizeController
    private readonly calculationItemNames = {
        FEE: "Service fee",
        PRICE: "Service price",
        TOTAL: "Total price",
        TRAVEL: "Travel expense",
    }
    private readonly text = StringHelper.getRandomText(20)
    private readonly eventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
            eventCategory: "Catering",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
        this.isMobile = isMobile
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
        this.searchFilter = new SearchFilter(this.page, isMobile)
        this.messageSupplierFilter = new MessageSupplierFilter(this.page, isMobile)
        this.imgResizeController = new ImgResizeController(this.page)
    }

    async pageLoaded(): Promise<ServicePage> {
        await this.page.waitForLoadState("domcontentloaded", { timeout: new UIElement(this.page).timeout })
        await this.uiElement.waitForUrl(/.*\/services\/\d+.*/g)
        await this.uiElement.waitForElementVisible(this.slider, 35000)
        this.isMobile
            ? await this.uiElement.waitForElementVisible("[data-tid='StickyBar']", 15000)
            : await this.uiElement.waitForElementVisible(this.caclulationWidget, 15000)

        return this
    }

    async fillEventDetaild(): Promise<void> {
        await this.uiElement.clickOnElement(this.eventDetailsInput)
    }

    async getPrefillEventDetail(): Promise<IEventDetails> {
        const eventDetail: IEventDetails = {}
        if (this.isMobile) {
            if (!await this.isMobileModal()) {
                await this.openMobileModal()
            }
        }
        eventDetail.date = await this.uiElement.getAttribute(this.searchFilter.dateInput, "value")
        if (this.isMobile) { eventDetail.date =
            DateHelper.convertDateFromTo(eventDetail.date, "YYYY-MM-DD", "D MMM YYYY")
        }
        this.isMobile
            ? eventDetail.eventType = StringHelper.capitalizerFirstLetter(await this.page
                .evaluate("document.querySelector(\"[name='serviceRequest-eventType']\").value"))
            : eventDetail.eventType = await this.uiElement.getAttribute(this.searchFilter.eventTypeDropDown, "value")
        eventDetail.guestAmount = await this.uiElement.getAttribute(this.searchFilter.guestAmount, "value")
        eventDetail.postcode = await this.uiElement.getAttribute(this.searchFilter.postcode, "value")
        eventDetail.postcode = eventDetail.postcode.toUpperCase().replace(" ", "")
        if (this.isMobile) {
            await this.closeMobileModal()
        }

        return eventDetail
    }

    async isEventDetailPrefill(): Promise<boolean> {
        return !(await this.uiElement.isElementDisplayed(this.eventDetailsInput))
    }

    async isErrorMessage(): Promise<boolean> {
        await this.waitFor(2)

        return this.uiElement.isElementDisplayed("[data-tid='Message']>div[style*='color: rgb(255, 31, 0)']")
    }

    async isCtaButton(buttonText: string): Promise<boolean> {
        await this.uiElement.waitForElementVisible(
            this.uiElement.button.getButtonSelector(buttonText),
            5000,
        )

        return true
    }

    async clickOnBookNow(): Promise<CheckoutPage> {
        await this.uiElement.button.clickButtonByText("BOOK NOW")

        return new CheckoutPage(this.page, this.isMobile).pageLoaded()
    }

    async clickOnBookCheckMyMooking(): Promise<CheckoutPage> {
        await this.uiElement.button.clickButtonByText("CHECK MY BOOKING")

        return new CheckoutPage(this.page, this.isMobile).pageLoaded()
    }

    async clickOnRequestToBook(isNewUser = false, isBookedBefore = false,
        user: IUser = RandomHelper.getSingUpRandomUser("Client")):
            Promise<CheckoutPage> {
                await this.clickOnRequestButton()
                if (isNewUser && !isBookedBefore) {
                    if (this.isMobile
                        && !(await this.uiElement.isElementDisplayed("input[name='email-email']", 5000))) {
                        await this.clickOnRequestButton()
                    }
                    await this.fillSingUpModal(user)
                } else {
                    if (await this.isMobileModal()) {
                        await this.clickOnRequestButton()
                    }
                }

                return new CheckoutPage(this.page, this.isMobile).pageLoaded()
    }

    async clickOnSaveForLater(
            isNewUser = false,
            user: IUser = RandomHelper.getSingUpRandomUser("Client")): Promise<ServicePage> {
        await this.uiElement.button.clickButtonByText("SAVE FOR LATER")
        if (isNewUser) {
            await this.fillSingUpModal(user)
            await this.waitFor(2)
        } else {
            await this.uiElement.button.clickButtonByText("SUBMIT")
        }

        return this
    }

    async newSaveForLater(
            isNewUser = false,
            user: IUser = RandomHelper.getSingUpRandomUser("Client")): Promise<ServicePage> {
        const selector = this.uiElement.button.getButtonSelector("SAVE FOR LATER")
        await this.uiElement.clickOnElement(`(${selector})[1]`)
        if (isNewUser) {
            await this.fillSingUpModal(user)
            await this.waitFor(2)
        } else {
            await this.fillLoginModal(user)
        }

        return this
    }

    async goToEventListPage(): Promise<EventListPage> {
        await this.sideBarMenu.openMenuItem("All events")

        return new EventListPage(this.page, this.isMobile).pageLoaded()
    }

    async clickOnMessageSupplier(
            isNewClient = false,
            isLogined = false,
            user: IUser = RandomHelper.getSingUpRandomUser("Client"),
            ): Promise<void> {
        await this.uiElement.button.clickButtonByText("MESSAGE SUPPLIER")

        if (isNewClient) {
            await this.fillSingUpModal(user)
            await this.waitFor(2)
        }
        if (!isNewClient && !isLogined) {
            await this.fillLoginModal(user)
        }
    }

    async clickOnMessageSuppLogined(eventDetails: IEventDetails = {}, isIos = false): Promise<CheckoutPage> {
        return this.fillMessageModal(eventDetails, isIos)
    }

    async clickOnMessageSuppBooked(): Promise<CheckoutPage> {
        await this.uiElement.button.clickButtonByText("MESSAGE SUPPLIER")

        return new CheckoutPage(this.page, this.isMobile).pageLoaded()
    }

    async fillMessageModal(eventDetails: IEventDetails = {}, isIos = false): Promise<CheckoutPage> {
        await this.waitFor(2)
        await this.uiElement.input
            .setText("textarea", "Test text message")
            await this.waitFor(2)
        if (JSON.stringify(eventDetails) !== JSON.stringify({})) {
            await this.fillModalEventDetail(eventDetails, isIos)
        }
        await this.uiElement.button.clickButtonByText("SUBMIT")

        return new CheckoutPage(this.page, this.isMobile).pageLoaded()
    }

    async fillSaveForLaterModal(eventDetails: IEventDetails = {}, isIos = false): Promise<ServicePage> {
        await this.waitFor(2)
        if (JSON.stringify(eventDetails) !== JSON.stringify({})) {
            await this.fillModalEventDetail(eventDetails, isIos)
        }
        await this.uiElement.button.clickButtonByText("SUBMIT")
        const selector = this.uiElement.button.getButtonSelector("SUBMIT")
        await this.uiElement.waitForElementVisible(selector, 15000, true)

        return this.pageLoaded()
    }

    async getMessageEventDetails(): Promise<IEventDetails> {
        return this.messageSupplierFilter.getPrefillEventDetail()
    }

    async isModalOpen(): Promise<boolean> {
        return this.uiElement.isElementDisplayed(this.setEventDetailsModal, 10000)
    }

    async setEventDetails(eventDetails: IEventDetails, isIos = false): Promise<ServicePage> {
        if (this.isMobile) await this.openEventDetailsModal()
        await this.searchFilter.setDate(eventDetails.date, isIos)
        await this.searchFilter.setEventType(eventDetails.eventType)
        await this.searchFilter.setGuestAmount(eventDetails.guestAmount)
        await this.searchFilter.setPostcode(eventDetails.postcode)

        return this
    }

    async openRandomOtherService(): Promise<ServicePage> {
        const cards = "//div[@data-tid='CardGrid']//div[@data-tid='Card']"
        const cardsArr = await this.uiElement.waitForArray(cards)
        const randomCardIndex: number = RandomHelper.getRandomInt(1, cardsArr.length)
        await this.uiElement.clickOnElement(`(${cards})[${randomCardIndex}]`)

        return new ServicePage(this.page, this.isMobile).pageLoaded()
    }

    async getServiceCardImgProps(serviceName: string): Promise<string> {
        const locator = this.page.
            locator(`//div[@data-tid='CardGrid']//div[@data-tid='Card']//*[text()='${serviceName}']/../../div/div[@style]`)

        return this.imgResizeController.getResizedImgLink(locator)
    }

    async goToMoreServices(): Promise<ServicePage> {
        await this.uiElement.scrollToElement("//h2[text()='More Services From This Supplier']")

        return this
    }

    async clickOnFindNewService(): Promise<SearchPage> {
        await this.uiElement.button.clickButtonByText("FIND A NEW SERVICE")

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async getStartTime(): Promise<string> {
        const selector = this.uiElement.input.getInputSelector("Select service start time")
        await this.uiElement.waitForElementVisible(selector)
        const startTime = await this.uiElement.getAttribute(selector, "value")

        return startTime
    }

    async setStartTime(startTime: string): Promise<ServicePage> {
        const selector = this.uiElement.input.getInputSelector("Select service start time")
        await this.uiElement.clickOnElement(selector)
        const startTimeSelector = `//div[@data-tid='Dialog']//div[text()='${startTime}']`
        await this.uiElement.clickOnElement(startTimeSelector)

        return this
    }

    async getDuration(): Promise<string> {
        const selector = this.uiElement.input.getInputSelector("Choose service duration")
        await this.uiElement.waitForElementVisible(selector)
        const duration = await this.uiElement.getAttribute(selector, "value")

        return duration
    }

    async setDuration(duration: string): Promise<ServicePage> {
        const selector = this.uiElement.input.getInputSelector("Choose service duration")
        await this.uiElement.clickOnElement(selector)
        const durationSelector = `//div[@data-tid='Dialog']//div[text()='${duration}']`
        await this.uiElement.clickOnElement(durationSelector)

        return this
    }

    async getServiceDuration(): Promise<string> {
        await this.uiElement.waitForElementVisible("input[name='quote-servicePrice']")

        return this.uiElement.getAttribute("input[name='quote-servicePrice']", "value")
    }

    async openEventDetailsModal(): Promise<void> {
        await this.waitFor(2)
        if (!await this.isModalOpen()) {
            await this.uiElement.clickOnElement("[data-tid='StickyBar'] button", 15000)
        }
    }

    // tODO possible to remove
    async submitEventDetailsModal(): Promise<void> {
        await this.uiElement.button.clickButtonByText("SUBMIT")
    }

    async getPriceCalculation(...modifyer: Array<PriveModifyerNameList>): Promise<PriceModifyer> {
        const priceModifyer: PriceModifyer = {}
        if (this.isMobile) {
            if (!await this.isMobileModal()) await this.openMobileModal()
        }
        if (modifyer.includes("PRICE") && !this.isMobile) priceModifyer.servicePrice = await this.getPriceValue("PRICE")
        if (modifyer.includes("TRAVEL") && !this.isMobile) {
            try {
                priceModifyer.travel = await this.getPriceValue("TRAVEL")
            } catch (error) {
                priceModifyer.travel = "0"
            }
        }
        if (modifyer.includes("FEE") && !this.isMobile) priceModifyer.fee = await this.getPriceValue("FEE")
        if (modifyer.includes("TOTAL")) priceModifyer.total = await this.getPriceValue("TOTAL")
        if (this.isMobile) await this.closeMobileModal()

        return priceModifyer
    }

    async clickOnBackToSearch(): Promise<SearchPage> {
        await this.uiElement.button.clickButtonByText("BACK TO SEARCH")

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async getTotalPriceLightMessage(): Promise<string> {
        return this.uiElement
            .getAttribute("//div[text()='You already have a quote with this service']//..//data[@data-tid='Price']",
                "value")
    }

    async clickOnViewQuote(): Promise<CheckoutPage> {
        this.isMobile
            ? await this.uiElement.clickOnElement("//span[text()='details']")
            : await this.uiElement.clickOnElement("//a[text()='View quote']")

        return new CheckoutPage(this.page, this.isMobile).pageLoaded()
    }

    async isAlreadyQuote(): Promise<boolean> {
        return this.uiElement
            .isElementDisplayed("//div[text()='You already have a quote with this service']", 15000)
    }

    async isSavedEnabled(): Promise<boolean> {
        return this.uiElement.button
            .isEnabled("(//button[@data-tid='Button']//span[text()='SAVED']/../..)[1]")
    }

    async openService(serviceId: string): Promise<ServicePage> {
        await this.page.goto(`/services/${serviceId}/`)

        return new ServicePage(this.page, this.isMobile).pageLoaded()
    }

    private async clickOnRequestButton(): Promise<void> {
        await this.uiElement.clickOnElement(
            "//button[@data-tid='Button']//span[text()='REQUEST TO BOOK' or text()='CHECK AVAILABILITY' or text()='GET INSTANT QUOTE']")
    }

    private async getPriceValue(modifyer: "PRICE" | "TRAVEL" | "FEE" | "TOTAL"): Promise<string> {
        const selector =
            `(//*[text()='${this.calculationItemNames[modifyer]}']/following::data[@data-tid='Price'])[1]`
        await this.uiElement.waitForElementVisible(selector, 15000)

        return this.uiElement.getAttribute(selector, "value")
    }

    private async openMobileModal(): Promise<void> {
        await this.clickOnRequestButton()
        await this.uiElement.waitForElementVisible("[data-tid='Form']")
    }

    private async closeMobileModal(): Promise<void> {
        await this.uiElement.clickOnElement("//*[@data-tid='ProgressHeader']//*[@data-tid='Vec']")
        await this.uiElement.waitForElementVisible("[data-tid='Form']", 15000, true)
    }

    private async isMobileModal(): Promise<boolean> {
        await this.waitFor(3)

        return this.uiElement.isElementDisplayed("[data-tid='Overlay'] [data-tid='Form']", 5000)
    }

    private async fillSingUpModal(user: IUser): Promise<void> {
        await this.uiElement.input.setText("input[name='email-email']", user.email)
        await this.uiElement.button.clickButtonByText("SUBMIT")
        await this.uiElement.input.setText("input[name='signup-fullName']", user.businessName)
        await this.uiElement.input.setText("input[name='signup-phoneNumber']", user.phone)
        await this.uiElement.input.setText("input[name='signup-password']", user.password)
        await this.uiElement.button.clickButtonByText("SUBMIT")
    }

    private async fillLoginModal(user: IUser): Promise<void> {
        if (await this.isTextPresent("Confirm your account")) {
            await this.uiElement.button.clickButtonByText("SAVE SERVICE")
        } else {
            await this.uiElement.input.setText("input[name='email-email']", user.email)
            await this.uiElement.button.clickButtonByText("SUBMIT")
            await this.uiElement.input.setText("input[name='login-password']", user.password)
            await this.uiElement.button.clickButtonByText("SUBMIT")
        }
    }

    private async fillModalEventDetail(eventDetails: IEventDetails = {}, isIos = false): Promise<void> {
            await this.messageSupplierFilter.setDate(eventDetails.date, isIos)
            await this.messageSupplierFilter.setEventType(eventDetails.eventType)
            await this.messageSupplierFilter.setGuestAmount(eventDetails.guestAmount)
            await this.messageSupplierFilter.setPostcode(eventDetails.postcode)
    }
}
