import { Page } from "@playwright/test"

import { UIElement } from "../../components/uiElement"
import { BillingPage } from "../billingPage"
import { EventListPage } from "../eventListPage"
import { HealthAndSafetyPage } from "../healthAndSafetyPage"
import { MembershipPage } from "../membershipPage"
import { PackageListPage } from "../packageListPage"
import { SuppCalendarPage } from "../suppCalendarPage"
import { SuppDashboardPage } from "../suppDashboardPage"
import { SuppProfilePage } from "../suppProfilePage"

export class LeftSideMenu {
    private readonly leftBarMenu: string = "//div[@data-tid='Dialog']//div[contains(@style,'box-sizing: border-box')]"
    private readonly sandwich: string = "[data-tid='Dialog'] [data-tid='Avatar']"
    private readonly item: string = "//span[text()='%s']"
    private readonly page: Page
    private readonly uiElement: UIElement
    private readonly isMobile: boolean

    constructor(page: Page, isMobile = false) {
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
    }

    async openSideBarMenu(): Promise<LeftSideMenu> {
        if (!await this.isMenuDisplayed()) {
            await this.uiElement.clickOnElement(this.sandwich)
        }
        await this.uiElement.waitForElementVisible(this.leftBarMenu)

        return this
    }

    async openMenuItem(menuName: string):
        Promise<
            SuppDashboardPage |
            SuppProfilePage |
            EventListPage |
            SuppCalendarPage |
            MembershipPage |
            HealthAndSafetyPage |
            PackageListPage |
            BillingPage> {
        await this.openSideBarMenu()
        await this.uiElement.clickOnElement(this.item.replace("%s", menuName))
        switch (menuName) {
            case "Dashboard":
                return new SuppDashboardPage(this.page, this.isMobile).pageLoaded()
            case "Profile":
                return new SuppProfilePage(this.page, this.isMobile).pageLoaded()
            case "All events":
                return new EventListPage(this.page, this.isMobile).pageLoaded()
            case "Calendar":
                return new SuppCalendarPage(this.page, this.isMobile).pageLoaded()
            case "Membership":
                return new MembershipPage(this.page, this.isMobile).pageLoaded()
            case "Health & Safety":
                return new HealthAndSafetyPage(this.page, this.isMobile).pageLoaded()
            case "Services":
                return new PackageListPage(this.page, this.isMobile).pageLoaded()
            case "Billing":
                return new BillingPage(this.page, this.isMobile).pageLoaded()
            default:
                  throw new Error("Something went wrong")
        }
    }

    async clikcOnCategory(categoryName: string): Promise<void> {
        const categorySelector = this.menuSelector("Services").replace("%s", categoryName)
         //   `//*[@data-tid='Menu']//div[text()='Services']/../..//a[@href and text()='${categoryName}']`
        await this.clickOnMemuSelector(categorySelector)

    }

    async clickOnAccountItem(itemName: string): Promise<void> {
        const categorySelector = this.menuSelector("Account").replace("%s", itemName)
        await this.clickOnMemuSelector(categorySelector)
    }

    private async clickOnMemuSelector(selector: string): Promise<void> {
        await this.uiElement.waitForElementVisible(selector)
        await this.uiElement.clickOnElement(selector)
    }

    private readonly menuSelector = (subStr: string): string => {
        return `//*[@data-tid='Menu']//div[text()='${subStr}']/../..//a[@href and text()='%s']`
    }

    private async isMenuDisplayed(): Promise<boolean> {
        return this.uiElement.isElementDisplayed(this.leftBarMenu)
    }
}
