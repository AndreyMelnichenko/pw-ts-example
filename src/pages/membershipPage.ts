import { expect, Page } from "@playwright/test"

import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { LeftSideMenu } from "./components/leftMenu"
import { ProMembershipPage } from "./proMembershipPage"

export class MembershipPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly sideBarMenu: LeftSideMenu
    private readonly joinProMembership = "a.ui.button[href='/s/membership/Pro/']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
    }

    async pageLoaded(): Promise<MembershipPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/membership\//g, 15000)
        await this.uiElement
            .waitForElementVisible("//h4[text()='Poptop Membership - the next step on your Poptop journey']", 15000)
        await this.uiElement.waitForElementVisible("//h2/b[text()='BASIC']")
        await this.uiElement.waitForElementVisible("//h2/b[text()='PRO']")
        await this.uiElement.waitForElementVisible("//h2/b[text()='GOLD']")

        return this
    }

    async joinOnProMember(): Promise<ProMembershipPage> {
        await this.uiElement.clickOnElement(this.joinProMembership)

        return new ProMembershipPage(this.page, this.isMobile).pageLoaded()
    }
}
