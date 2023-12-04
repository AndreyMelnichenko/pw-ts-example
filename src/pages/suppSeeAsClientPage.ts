import { Page } from "@playwright/test"
import { ImgResizeController } from "../Api/Controllers/imgResizeController"

import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"

export class SuppSeeAsClientPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly suppLogo: string = ".ui.circular.image.supplier-avatar"
    private readonly suppServices: string = "//div[contains(@class,'PackagePage__PackagesBox')]"
    private readonly imgResizeController: ImgResizeController

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.imgResizeController = new ImgResizeController(this.page)
    }

    async pageLoaded(): Promise<SuppSeeAsClientPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl(/.*\/supplier\/.*\//g)
        await this.uiElement.waitForElementVisible(this.suppLogo, 20000)
        await this.uiElement.waitForElementVisible(this.suppServices, 20000)

        return this
    }

    async getServiceImgProps(serviceName: string): Promise<string> {
        const selector = `//span[@class='ui card']//h3[text()='${serviceName}']/../../../div[1]`
        const locator = this.page.locator(selector)

        return this.imgResizeController.getResizedImgLink(locator)
    }
}
