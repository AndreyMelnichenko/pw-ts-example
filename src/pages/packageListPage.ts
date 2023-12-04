import { Page } from "@playwright/test"
import * as RandomHelper from "../../src/utils/randomHelper"
import { ImgResizeController } from "../Api/Controllers/imgResizeController"
import { UIElement } from "../components/uiElement"
import { LeftSideBarMenuPage } from "../models/leftSideBarMenu"
import { BasePage } from "./basePage"
import { Header } from "./components/header"
import { LeftSideMenu } from "./components/leftMenu"
import { PackageCreationPage } from "./packageCreationPage"
import { PackageEditPage } from "./packageEditPage"

export class  PackageListPage extends BasePage {
    readonly header: Header
    private readonly uiElement: UIElement
    private readonly cards: string = "//div[@data-tid='CardGrid']//div[@data-tid='Card']"
    private readonly serviceName: string = "(//div[@data-tid='Card']//div[text()='Published 😎']/following::h3)[1]"
    private readonly imgResizeController: ImgResizeController
    private readonly sideBarMenu: LeftSideMenu

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.imgResizeController = new ImgResizeController(this.page)
        this.header = new Header(this.page, this.isMobile)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
    }

    async pageLoaded(): Promise<PackageListPage> {
        await this.uiElement.waitForUrl(/.*\/packages\/.*/g, 45000)
        await this.uiElement.waitForElementVisible("//h3[text()='Create & Manage your LISTINGS']", 45000)

        return this
    }

    async openSideBarMenu(itemName: string): Promise<LeftSideBarMenuPage> {
        return this.sideBarMenu.openMenuItem(itemName)
    }

    async clickOnCreateService(): Promise<PackageCreationPage> {
        await this.uiElement.button.clickButtonByText("CREATE A LISTING")
        await this.waitFor(5)

        return new PackageCreationPage(this.page, this.isMobile).pageLoaded()
    }

    async isServiceExists(serviceName: string): Promise<boolean> {
        try {
            await this.uiElement.waitForElementVisible(`//h3[text()='${serviceName}']`)

            return true
        } catch (error) {
            return false
        }
    }

    async filterByStatus(status: "PUBLISHED" | "IN REVIEW" | "DRAFT"): Promise<void> {
        await this.uiElement.clickOnElement(`//button[@data-tid='Button']//span[contains(text(),'${status}')]`)
    }

    async openRandomService(): Promise<void> {
        const cardsArr = await this.uiElement.waitForArray(this.cards)
        const randomCardIndex: number = RandomHelper.getRandomInt(1, cardsArr.length)
        await this.uiElement.clickOnElement(`(${this.cards})[${randomCardIndex}]`)
    }

    async openServiceByName(name: string): Promise<PackageEditPage> {
        const selector = `${this.cards}//*[text()='${name}']`
        await this.uiElement.clickOnElement(selector)

        return new PackageEditPage(this.page, this.isMobile).pageLoaded()
    }

    async getPackageImgSettings(serviceName: string): Promise<string> {
        const locator = this.page.
            locator(`//div[@data-tid='CardGrid']//div[@data-tid='Card']//*[text()='${serviceName}']/../../div/div[@style]`)

        return this.imgResizeController.getResizedImgLink(locator)
    }

    async isServicePublished(serviceName: string): Promise<boolean> {
        await this.uiElement.waitForElementVisible(
            `//div[@data-tid='Card']//div[text()='Published 😎']/following::h3[text()='${serviceName}']`, 25000)

        return true
    }
}
