import { Page } from "playwright"
import * as RandomHelper from "../../src/utils/randomHelper"
import { ApiHelperController } from "../Api/Controllers/apiHelperController"
import { UIElement } from "../components/uiElement"
import { LeftSideBarMenu } from "../models/leftSideBarMenu"
import { LeftSideMenu } from "./components/leftMenu"
import { PackageCreationPage } from "./packageCreationPage"

export class PackageEditPage extends PackageCreationPage implements LeftSideBarMenu {

    constructor(page: Page, isMobile = false) {
        super(page, isMobile)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.apiController =  new ApiHelperController(this.page)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
    }

    override async pageLoaded(): Promise<PackageEditPage> {
        await this.uiElement.waitForUrl(/.*\/packages\/.*/g)
        await this.uiElement.waitForArraySize("div.step", 10)

        return this
    }

    async openLogo(): Promise<PackageEditPage> {
        await this.uiElement.button.clickButtonByText("EDIT")

        return this
    }

    async mutateLogo(): Promise<PackageEditPage> {
        await this.setRandomImgPosition()
        await this.uiElement.button.clickButtonByText("SAVE IMAGE")
        await this.waitFor(2)
        await this.goToEditImgTitle()
        await this.saveAndContinue()
        await this.goToTab("Overview")

        return this
    }

    async boxMarker(): Promise<string> {
        const selector = "(//div[@data-tid='ThumbnailEditor']//div[contains(@style,'border-box')])[1]/div[2]"
        await this.uiElement
            .waitForElementVisible(selector)

        return selector
    }

    private async setRandomImgPosition(): Promise<void> {
        const positionArr = [
            {x: 1600, y: 900},
            {x: 1600, y: 400},
            {x: 1600, y: -150},
            {x: 900, y: 900},
            {x: 900, y: 400},
            {x: 900, y: -150},
            {x: 300, y: 900},
            {x: 300, y: 400},
            {x: 300, y: -150},
        ]
        const position = positionArr[RandomHelper.getRandomInt(0, positionArr.length - 1)]
        for (let i = 0; i <= 18; i = i + 1) {
            await this.zoomIn()
        }
        const selector = await this.boxMarker()
        await this.page.hover(selector)
        await this.page.mouse.down()
        await this.page.mouse.move(position.x, position.y)
        await this.page.mouse.up()
    }

    private async zoomIn(): Promise<PackageEditPage> {
        await this.uiElement.clickOnElement("(//div[@data-tid='Slider']/div)[3]")

        return this
    }

    private async zoomOut(): Promise<PackageEditPage> {
        await this.uiElement.clickOnElement("(//div[@data-tid='Slider']/div)[2]")

        return this
    }

    private async rotateImg(): Promise<PackageEditPage> {
        await this.uiElement.clickOnElement("(//div[@data-tid='IconedButtonGroup']/div)[1]")

        return this
    }

    private async mirrorImg(): Promise<PackageEditPage> {
        await this.uiElement.clickOnElement("(//div[@data-tid='IconedButtonGroup']/div)[1]")

        return this
    }

    private async goToTab(tabName: string): Promise<PackageEditPage> {
        await this.uiElement
            .waitForElementVisible(`//div[@class='active completed step']//a[not(text()='${tabName}')]`)
        await this.uiElement.clickOnElement(`css=.green.check.icon ~ a >> text='${tabName}'`)
        await this.goToEditImgTitle()

        return this
    }

    private async goToEditImgTitle(): Promise<PackageEditPage> {
        const selector = this.uiElement.button.getButtonSelector("EDIT")
        const locator = this.page.locator(selector)
        await locator.hover()

        return this
    }
}
