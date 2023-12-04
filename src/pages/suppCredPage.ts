import { Page } from "@playwright/test"

import { UIElement } from "../components/uiElement"
import { LeftSideBarMenuPage } from "../models/leftSideBarMenu"
import { BasePage } from "./basePage"
import { LeftSideMenu } from "./components/leftMenu"

export class SuppCredPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly sideBarMenu: LeftSideMenu
    private readonly suppNameInput: string = "//div[text()='Your act or business name']/following-sibling::input"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
    }

    async pageLoaded(): Promise<SuppCredPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl("**/s/profile/credentials/")
        await this.uiElement.waitForElementVisible(this.suppNameInput, 15000)

        return this
    }

    async openCredentialsPage(): Promise<void> {
        await this.uiElement.clickOnElement("(//h3[text()='Contact information']/following::button)[1]")
    }

    async setSuppName(name: string): Promise<SuppCredPage> {
        await this.uiElement.input.setText(this.suppNameInput, name)
        while (!(await this.uiElement.textElement.isTextPresent("Profile saved", 500))) {
            await this.uiElement.button.clickButtonByText("SAVE")
            await this.waitFor(2)
        }

        return this
    }

    async getSuppName(): Promise<string> {
        return this.uiElement.getAttribute(this.suppNameInput, "value")
    }

    async openSideBarMenu(itemName: string): Promise<LeftSideBarMenuPage> {
        return this.sideBarMenu.openMenuItem(itemName)
    }
}
