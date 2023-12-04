import { Page } from "@playwright/test"
import * as RandomHelper from "../../src/utils/randomHelper"
import { UIElement } from "../components/uiElement"
import { IUser } from "../models/user"
import * as StringHelper from "../utils/stringHelper"
import { BasePage } from "./basePage"
import { ConfirmPhonePage } from "./confirmPhonePage"

export class SignUpPage extends BasePage {
    private readonly uiElement: UIElement

    private readonly signUpForm: string = "[data-tid='Container'] form"
    private readonly signUpButton: string = `${this.signUpForm} button[type='submit']`
    private readonly businessName: string = "input[placeholder='Enter business name...']"
    private readonly email: string = "input[placeholder='Enter your email...']"
    private readonly phone: string = "input[type='tel']"
    private readonly city: string = "input[placeholder='City']"
    private readonly password: string = "input[type='password']"

    constructor(page: Page) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
    }

    async pageLoaded(): Promise<SignUpPage> {
        await this.uiElement.waitForUrl("**/signup/", 15000)
        await this.uiElement.waitForElementVisible(this.signUpForm)
        await this.uiElement.waitForElementVisible(this.signUpButton)

        return this
    }

    async fillSingUpForm(singUpData: IUser): Promise<SignUpPage> {
        await this.uiElement.input.setText(
            this.businessName, singUpData.businessName || `Test business ${StringHelper.getRandomStr(5)}`)
        await this.uiElement.input.setText(
            this.email, singUpData.email || RandomHelper.getSingUpRandomUser("Supplier").email)
        await this.uiElement.input.setText(this.phone, singUpData.phone || StringHelper.getRandomNum(10))
        await this.uiElement.dropDownInput.setValue(this.city, singUpData.city || "London")
        await this.uiElement.input.setText(this.password, singUpData.password || StringHelper.getRandomStr(8))

        return this
    }

    async submitSingUpForm(): Promise<ConfirmPhonePage> {
        await this.uiElement.clickOnElement(this.signUpButton)

        return new ConfirmPhonePage(this.page).pageLoaded()
    }
}
