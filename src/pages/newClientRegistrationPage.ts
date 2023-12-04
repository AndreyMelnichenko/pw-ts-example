import { Page } from "@playwright/test"
import * as RandomHelper from "../../src/utils/randomHelper"
import { UIElement } from "../components/uiElement"
import { IUser } from "../models/user"
import * as StringHelper from "../utils/stringHelper"
import { BasePage } from "./basePage"
import { CheckoutPage } from "./checkoutPage"
import { SearchPage } from "./searchPage"
import { ServicePage } from "./servicePage"

export class NewClientRegistrationPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly progressBar = "[data-tid='ProgressHeader']"
    private readonly fullName = "input[name='fullName']"
    private readonly email = "input[placeholder='e.g. yourname@gmail.com']"
    private readonly phoneNumber = "input[placeholder='2920299992']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
        this.isMobile = isMobile
    }

    async pageLoaded(): Promise<NewClientRegistrationPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/services\/\d+\/request\/.*/g, 35000)
        await this.uiElement.waitForElementVisible(this.progressBar, 15000)
        await this.uiElement.waitForElementVisible(this.fullName, 5000)
        await this.uiElement.waitForElementVisible(this.email, 5000)
        await this.uiElement.waitForElementVisible(this.phoneNumber, 5000)

        return this
    }

    async fillSingUpForm(singUpData: IUser): Promise<NewClientRegistrationPage> {
        await this.uiElement.input.setText(this.fullName, singUpData.businessName ||
            `Test Client ${StringHelper.getRandomStr(5)}`)
        await this.uiElement.input.setText(
            this.email, singUpData.email || RandomHelper.getSingUpRandomUser("Client").email)
        await this.uiElement.input.setText(this.phoneNumber, `1${StringHelper.getRandomNum(9)}`)

        return this
    }

    async clickOnCta(buttonText = "GO TO CHECKOUT"): Promise<NewClientRegistrationPage> {
        await this.uiElement.button.clickButtonByText(buttonText)
        await this.page.waitForTimeout(3000)

        return this
    }

    async fillPassword(password: string = StringHelper.getRandomNum(10)): Promise<NewClientRegistrationPage> {
        await this.uiElement.waitForElementVisible("//div[text()='Set your password']", 15000)
        await this.uiElement.input.setText("input[type='password']", password)
        await this.uiElement.waitForElementVisible(
            "//div[text()='Receive emails with professional advice and planning tips from the Poptop team']")

        return this
    }

    async completeRegistration(): Promise<CheckoutPage> {
        await this.uiElement.button.clickButtonByText("GO TO CHECKOUT")
        await this.uiElement.waitForElementVisible(
            this.uiElement.button.getButtonSelector("GO TO CHECKOUT"), 15000, true)
        await this.waitLoader(25000)

        return new CheckoutPage(this.page, this.isMobile).pageLoaded()
    }

    async completeSaveForLater(): Promise<void> {
        await this.uiElement.button.clickButtonByText("SAVE SERVICE")
        await this.uiElement.waitForElementVisible(
            this.uiElement.button.getButtonSelector("SAVE SERVICE"), 15000, true)
        await this.waitLoader(25000)
    }

    async isServiceShortlistPopUp(): Promise<boolean> {
        await this.uiElement.waitForElementVisible("//div[text()='Service was saved to shortlist!']", 10000)

        return true
    }

    async clickOnBackToSearch(): Promise<SearchPage> {
        await this.uiElement.button.clickButtonByText("BACK TO SEARCH")

        return new SearchPage(this.page, this.isMobile).pageLoaded()
    }

    async clickOnBackToService(): Promise<ServicePage> {
        await this.uiElement.button.clickButton("//a[text()='Back to service']")

        return new ServicePage(this.page, this.isMobile).pageLoaded()
    }

    async waitForModal(): Promise<NewClientRegistrationPage> {
        await this.uiElement.waitForElementVisible("//a[text()='Back to service']", 35000)

        return this
    }
}
