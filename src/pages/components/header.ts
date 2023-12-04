import { Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import { MainPage } from "../mainPage"

export class Header {
    private readonly poptopLogo: string = "a[href='/']"
    private readonly userMenu: string = "[data-tid='Avatar']"
    private readonly page: Page
    private readonly uiElement: UIElement
    private readonly isMobile: boolean

    constructor(page: Page, isMobile = false) {
        this.page = page
        this.uiElement = new UIElement(this.page)
        this.isMobile = isMobile
    }

    async clickOnHeaderLogo(): Promise<MainPage> {
        await this.uiElement.clickOnElement(this.poptopLogo, 5000)

        return new MainPage(this.page, this.isMobile).pageLoaded()
    }

    async exitPopTop(): Promise<MainPage> {
        await this.uiElement.clickOnElement(this.userMenu, 5000)
        await this.uiElement.clickOnElement("a[href='/logout/']", 5000)

        return new MainPage(this.page, this.isMobile).pageLoaded()
    }
}
