import { expect, Page } from "@playwright/test"
import { UIElement } from "../components/uiElement"
import { LeftSideBarMenuPage } from "../models/leftSideBarMenu"
import { BasePage } from "./basePage"
import { LeftSideMenu } from "./components/leftMenu"
import { PackageCreationPage } from "./packageCreationPage"

export class SupplierServicePage extends BasePage {
    private readonly uiElement: UIElement
    private readonly sideBarMenu: LeftSideMenu
    private readonly h3HelloText = "//h3[text()='Want more Poptop bookings? Create more services!']"
    private readonly createNewService = "//button//span[text()='CREATE NEW LISTINGS']"
    private readonly cards: string = "//div[@data-tid='CardGrid']//div[@data-tid='Card']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
    }

    async pageLoaded(): Promise<SupplierServicePage> {
        await this.page.waitForLoadState("domcontentloaded", { timeout: 35000 })
        await this.uiElement.waitForUrl(/.*\/s\/packages\/.*/g, 35000)
        await this.waitLoader(25000)
        await this.uiElement.waitForElementVisible(this.h3HelloText, 35000)
        await this.uiElement.waitForElementVisible(this.createNewService)
        const buttons = this.page.$$(this.createNewService)
        if (await this.uiElement.isElementDisplayed("//div[text()='You need to update your Calendar!']", 5000)) {
            await this.uiElement.button.clickButtonByText("CLOSE")
            await this.uiElement.waitForElementVisible("//div[text()='You need to update your Calendar!']", 5000, true)
        }
        expect((await buttons).length).toEqual(2)

        return this
    }

    async openSideBarMenu(itemName: string):
        Promise<LeftSideBarMenuPage> {
        return this.sideBarMenu.openMenuItem(itemName)
    }

    async clickOnCreateService(): Promise<PackageCreationPage> {
        await this.uiElement.button.clickButtonByText("CREATE NEW LISTINGS")
        await this.waitFor(5)

        return new PackageCreationPage(this.page, this.isMobile).pageLoaded()
    }
}
