import { Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { LeftSideBarMenu, LeftSideBarMenuPage } from "../models/leftSideBarMenu"
import { IUser } from "../models/user"
import * as StringHelper from "../utils/stringHelper"
import { BasePage } from "./basePage"
import { LeftSideMenu } from "./components/leftMenu"
import { PackageListPage } from "./packageListPage"

export class ConfirmPhonePage extends BasePage implements LeftSideBarMenu {
    private readonly uiElement: UIElement
    private readonly sideBarMenu: LeftSideMenu
    private readonly pageTitle: string = "//h3[text()='Confirm your phone number']"
    private readonly codeConfirmInput: string = "input[placeholder='Enter code here']"
    private readonly confitmButton: string = "//span[text()='CONFIRM']"
    private readonly editNumberButton: string = "//span[text()='EDIT NUMBER']"
    private readonly reSendSmsButton: string = "//span[contains(text(),'RE-SEND SMS')]"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
    }

    async pageLoaded(): Promise<ConfirmPhonePage> {
        await this.uiElement.waitForElementVisible(this.pageTitle, 15000)
        await this.uiElement.waitForElementVisible(this.codeConfirmInput)
        await this.uiElement.waitForElementVisible(this.confitmButton)
        await this.uiElement.waitForElementVisible(this.editNumberButton)
        await this.uiElement.waitForElementVisible(this.reSendSmsButton)

        return this
    }

    async openSideBarMenu(itemName: string):
        Promise<LeftSideBarMenuPage> {
        return this.sideBarMenu.openMenuItem(itemName)
    }

    async confirmPhone(user: IUser): Promise<PackageListPage> {
        let code = StringHelper.getSha256(`phone_check_one_two_one_two${user.email}${user.phone}`)
        code = code.slice(0, 4)
        await this.uiElement.input.setText("[data-tid='Input']", code)
        await this.uiElement.button.clickButtonByText("CONFIRM")

        return new PackageListPage(this.page, this.isMobile).pageLoaded()
    }
}
