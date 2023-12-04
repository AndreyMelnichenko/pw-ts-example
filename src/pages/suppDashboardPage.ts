import { BrowserContext, Page } from "@playwright/test"
import { threadId } from "worker_threads"

import { Button } from "../components/button"
import { UIElement } from "../components/uiElement"
import { BasePage } from "./basePage"
import { Header } from "./components/header"
import { LeftSideMenu } from "./components/leftMenu"
import { MainPage } from "./mainPage"
import { PopBlogPage } from "./popBlogPage"
import { SeeReviewsPage } from "./seeReviewsPage"
import { SuppProfilePage } from "./suppProfilePage"
import { SuppSeeAsClientPage } from "./suppSeeAsClientPage"

export class SuppDashboardPage extends BasePage {
    private readonly uiElement: UIElement
    private readonly button: Button
    private readonly header: Header
    private readonly suppProfileInfoBlock: string = ".profile-completeness"
    private readonly suppProfileCompleteness: string = ".completeness"
    private readonly popBlog: string = "//a[@href and text()='Learn more']"
    private readonly seeReviews: string = "//a[@href and text()='See reviews']"

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.button = new Button(this.page)
        this.header = new Header(this.page, this.isMobile)
    }

    async pageLoaded(): Promise<SuppDashboardPage> {
        await this.page.waitForLoadState("domcontentloaded")
        await this.uiElement.waitForUrl("**/s/")
        await this.uiElement.waitForElementVisible(this.suppProfileInfoBlock, 10000)
        await this.uiElement.waitForElementVisible(this.suppProfileCompleteness, 10000)

        return this
    }

    async exitPopTop(): Promise<MainPage> {
        return this.header.exitPopTop()
    }

    async openEditProfilePage(): Promise<SuppProfilePage> {
        await this.button.clickButtonByText("EDIT PROFILE")

        return new SuppProfilePage(this.page).pageLoaded()
    }

    async openSeeAsClientPage(context: BrowserContext): Promise<SuppDashboardPage> {
        const [newPage] = await Promise.all(
            [
                context.waitForEvent("page"),
                this.page.keyboard.press("ArrowDown"),
                this.waitFor(5),
                this.button.clickButtonByText("SEE AS A CLIENT"),
            ],
        )
        await new SuppSeeAsClientPage(newPage, this.isMobile).pageLoaded()
        await this.page.waitForTimeout(5000)
        await newPage.close()

        return new SuppDashboardPage(this.page, this.isMobile).pageLoaded()
    }

    async openSeeAsClientBoard(): Promise<SuppSeeAsClientPage> {
        const selector = this.button.getButtonSelector("SEE AS A CLIENT")
        const locator = this.page.locator(`${selector}/../../..`)
        const url = await locator.getAttribute("href") || "NO URL"
        await this.page.goto(url)

        return new SuppSeeAsClientPage(this.page, this.isMobile).pageLoaded()
    }

    async openSupplierPageForVrt(context: BrowserContext): Promise<Page> {
        const [newPage] = await Promise.all(
            [
                context.waitForEvent("page"),
                this.button.clickButtonByText("SEE AS A CLIENT"),
            ],
        )
        await new SuppSeeAsClientPage(newPage, this.isMobile).pageLoaded()

        return newPage
    }

    async openPopBlog(context: BrowserContext): Promise<SuppDashboardPage> {
        const [newPage] = await Promise.all(
            [
                context.waitForEvent("page", { timeout: 10000 }),
                this.uiElement.clickOnElement(this.popBlog, 10000),
            ],
        )
        await new PopBlogPage(newPage, this.isMobile).pageLoaded()
        await this.page.waitForTimeout(5000)
        await newPage.close()

        return new SuppDashboardPage(this.page, this.isMobile).pageLoaded()
    }

    async openSeeReviews(): Promise<SeeReviewsPage> {
        await this.uiElement.clickOnElement(this.seeReviews)

        return new SeeReviewsPage(this.page, this.isMobile).pageLoaded()
    }
}
