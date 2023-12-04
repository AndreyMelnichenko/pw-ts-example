import { ElementHandle, expect, Page } from "@playwright/test"

import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { LeftSideMenu } from "./components/leftMenu"

export class HealthAndSafetyPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly sideBarMenu: LeftSideMenu

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
    }

    async pageLoaded(): Promise<HealthAndSafetyPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/health-safety\//g, 15000)
        await this.uiElement.textElement.isTextPresent("Sign up to Poptop’s Health & Safety Program", 15000)
        await this.uiElement.textElement.isTextPresent("This program is optional but if you do sign up your profile will awarded with:")

        return this
    }

    async applyCheckboxForm(text: string): Promise<HealthAndSafetyPage> {
        const selector = `//*[text()='${text}']/following::div[@data-tid='Checkbox']`
        const elementSize: number = await this.uiElement.getLocatorArraySize(selector)
        for (let i = 1; i <= elementSize; i = i + 1) {
            await this.uiElement.clickOnElement(`${selector}[${i}]`)
        }
        await this.clickOnCtaButton()

        return this
    }

    async clickOnCtaButton(): Promise<void> {
        await this.uiElement.button.clickButton("//button[@data-tid='Button']//span")
    }

    async isCardWithTextPresent(text: string): Promise<boolean> {
        await this.uiElement.waitForElementVisible(`//h4[text()='${text}']`, 15000)

        return true
    }
}
