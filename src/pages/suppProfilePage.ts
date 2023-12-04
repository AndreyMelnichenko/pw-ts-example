import { Page } from "@playwright/test"

import { UIElement } from "../components/uiElement"
import { LeftSideBarMenuPage } from "../models/leftSideBarMenu"
import { BasePage } from "./basePage"
import { LeftSideMenu } from "./components/leftMenu"
import { SuppCredPage } from "./suppCredPage"

export class SuppProfilePage extends BasePage {
    private readonly uiElement: UIElement
    private readonly sideBarMenu: LeftSideMenu
    private readonly contactInfo: string = "a[href='/s/profile/credentials/']>div"
    private readonly contactListDescr: string = "a[href='/s/profile/info/']>div"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
    }

    async pageLoaded(): Promise<SuppProfilePage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl("**/s/profile/")
        await this.uiElement.waitForElementVisible(this.contactInfo)
        await this.uiElement.waitForElementVisible(this.contactListDescr)

        return this
    }

    async openCredentialsPage(): Promise<SuppCredPage> {
        await this.uiElement.clickOnElement("(//h3[text()='Contact information']/following::button)[1]")

        return new SuppCredPage(this.page, this.isMobile).pageLoaded()
    }

    async openSideBarMenu(itemName: string):
        Promise<LeftSideBarMenuPage> {
        return this.sideBarMenu.openMenuItem(itemName)
    }
}
