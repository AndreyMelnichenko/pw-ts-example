import { Page } from "@playwright/test"
import * as StringHelper from "../../src/utils/stringHelper"
import { InbucketController } from "../Api/Controllers/inbucketController"
import { UIElement } from "../components/uiElement"
import { IUser } from "../models/user"
import { BasePage } from "./basePage"
import { ClientMainPage } from "./clientMainPage"
import { PackageListPage } from "./packageListPage"
import { SupplierServicePage } from "./supplierServicePage"

export class LoginPage extends BasePage {
    private readonly userNameInput: string = "[data-tid='Input'][type='email']"
    private readonly userPassInput: string = "input[name='login-password']"
    private readonly submitButton: string = "button.ui"
    private readonly uiElement: UIElement
    private readonly inbucket: InbucketController

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.uiElement = new UIElement(this.page)
        this.isMobile = isMobile
        this.inbucket = new InbucketController(page)
    }

    async pageLoaded(): Promise<LoginPage> {
        await this.uiElement.waitForUrl("**/auth/", 30000)
        await this.page.waitForLoadState("domcontentloaded", { timeout: 30000 })
        await this.uiElement.waitForElementVisible(this.userNameInput)

        return this
    }

    async loginAs(user: IUser): Promise<ClientMainPage | SupplierServicePage> {
        await this.setUserName(user.email)
        await this.setPassword(user.password)
        if (user.role === "supplier") {
            return new SupplierServicePage(this.page, this.isMobile).pageLoaded()
        }

        return new ClientMainPage(this.page, this.isMobile).pageLoaded()
    }

    async recoverPasswordFor(user: IUser): Promise<string> {
        await this.setUserName(user.email)
        await this.inbucket.cleanMailBox()
        await this.uiElement.clickOnElement("//span[text()='Forgot your password?']")
        await this.uiElement.button.clickButtonByText("SUBMIT")

        return this.getRevoceryCode(`${user.email.split("@")[0]}, here's your Poptop PIN`)
    }

    async setRecoveryForm(recoveryCode: string, user: IUser): Promise<ClientMainPage | PackageListPage> {
        await this.uiElement.waitForElementVisible("//h4[text()='New password']")
        await this.uiElement.input.setText("[name='passwordReset-token']", recoveryCode)
        await this.uiElement.input.setText("[name='passwordReset-password']", user.password)
        await this.uiElement.input.setText("[name='passwordReset-passwordConfirm']", user.password)
        await this.uiElement.button.clickButtonByText("SUBMIT")
        if (user.role === "supplier") {
            return new PackageListPage(this.page, this.isMobile).pageLoaded()
        }

        return new ClientMainPage(this.page, this.isMobile).pageLoaded()
    }

    async singUpAsClient(user: IUser): Promise<ClientMainPage> {
        await this.setUserName(user.email)
        await this.uiElement.input.setText("#signup-fullName input", user.email.split("@")[0])
        await this.uiElement.input.setText("input[name='signup-phoneNumber']", `1${StringHelper.getRandomNum(9)}`)
        await this.uiElement.input.setText("input[name='signup-password']", user.password)
        await this.uiElement.button.clickButtonByText("SUBMIT")

        return new ClientMainPage(this.page, this.isMobile).pageLoaded()
    }

    private async setUserName(userName: string): Promise<void> {
        await this.uiElement.input.setText(this.userNameInput, userName)
        await this.uiElement.button.clickButtonByText("SUBMIT")
    }

    private async setPassword(password: string): Promise<void> {
        await this.uiElement.input.setText(this.userPassInput, password)
        await this.uiElement.button.clickButtonByText("SUBMIT")
    }

    private async getRevoceryCode(subject: string): Promise<string> {
        const message = await this.inbucket.getMessage(subject)
        const splitRow1 = message.body.text.toString()
        .split("\n\n\*")[2]

        return splitRow1?.split("\*\n\n")[0] || "No recovery pass"
    }
}
