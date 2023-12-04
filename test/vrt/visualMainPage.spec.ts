import { test } from "@playwright/test"
import { Config, PageTrackOptions, PlaywrightVisualRegressionTracker } from "@visual-regression-tracker/agent-playwright"
import { Browser, BrowserContext, chromium, Page } from "playwright"
import { URL } from "url"
import * as creds from "../../creds.json"
import config from "../../playwright.config"
import { ConfirmPhonePage } from "../../src/pages/confirmPhonePage"
import { LoginPage } from "../../src/pages/loginPage"
import { MainPage } from "../../src/pages/mainPage"
import { SearchPage } from "../../src/pages/searchPage"
import { ServicePage } from "../../src/pages/servicePage"
import { SignUpPage } from "../../src/pages/signUpPage"
import { SuppDashboardPage } from "../../src/pages/suppDashboardPage"
import { SupplierServicePage } from "../../src/pages/supplierServicePage"
import * as DateHelper from "../../src/utils/dateHelper"
import * as RandomHelper from "../../src/utils/randomHelper"

test.describe.parallel("Visual test", () => {
    const browserType = chromium
    let browser: Browser
    let context: BrowserContext
    let page: Page
    let vrt: PlaywrightVisualRegressionTracker
    const urlString = config.use?.baseURL || "NO_URL"
    const url = new URL(urlString)

    const vrtConfig: Config = {
        apiKey: creds.VRT.apiKey,
        apiUrl: creds.VRT.apiUrl,
        branchName: "main",
        ciBuildId: `${DateHelper.getDateString(new Date(), "DD-MM-YYYY-hh:mm")}`,
        enableSoftAssert: false,
        project: creds.VRT.project,
    }

    const vrtOptions: PageTrackOptions = {
        diffTollerancePercent: 1,
        screenshotOptions: {
            fullPage: true,
        },
    }

    test.beforeAll(async () => {
        browser = await browserType.launch()
        context = await browser.newContext()
        page = await context.newPage()
    })

    test.beforeEach(async () => {
        vrt = new PlaywrightVisualRegressionTracker("chromium", vrtConfig)
        await vrt.start()
    })

    test.afterEach(async () => {
        await page.context().clearCookies()
        await vrt.stop()
    })

    test.afterAll(async () => {
        await browser.close()
    })

    test("main page @vrt @C84 ", async () => {
        await page.goto(`${url.protocol}//foo:bar@${url.host}`)
        await page.waitForTimeout(5000)
        await vrt.trackPage(page, "Main Page", vrtOptions)
    })

    test("search page @vrt @C85 ", async () => {
        await page.goto(`${url.protocol}//foo:bar@${url.host}`)
        const mainPage = new MainPage(page)
        await mainPage.pageLoaded()
        const searchPage: SearchPage = await mainPage.clickOnSerachButton()
        await searchPage.clickOnSerachButton()
        await page.waitForTimeout(5000)
        await vrt.trackPage(page, "Search Page", vrtOptions)
    })

    test("Supplier page @vrt @C86 ", async () => {
        await page.goto(`${url.protocol}//foo:bar@${url.host}`)
        const mainPage = new MainPage(page)
        await mainPage.pageLoaded()
        const loginPage: LoginPage = await mainPage.openLoginForm()
        const supplierServicePage = (await loginPage.loginAs(creds.supplier[0])) as SupplierServicePage
        const supplierDashboard: SuppDashboardPage =
            await supplierServicePage.openSideBarMenu("Dashboard") as SuppDashboardPage
        page = await supplierDashboard.openSupplierPageForVrt(context)

        await page.waitForTimeout(5000)
        await vrt.trackPage(page, "Supplier Page", vrtOptions)
    })

    test("Service page @vrt @C87 ", async () => {
        await page.goto(`${url.protocol}//foo:bar@${url.host}/services/23918/`)
        const servicePage: ServicePage = new ServicePage(page)
        await servicePage.pageLoaded()

        await page.waitForTimeout(5000)
        await vrt.trackPage(page, "Service Page", vrtOptions)
    })

    test("Empty Package list page @vrt @C92 ", async () => {
        await page.goto(`${url.protocol}//foo:bar@${url.host}`)
        const mainPage: MainPage = new MainPage(page)
        const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
        await singUpPage.pageLoaded()
        const user = RandomHelper.getSingUpRandomUser("Supplier")
        await singUpPage.fillSingUpForm(user)
        const confirmPhonePage: ConfirmPhonePage = await singUpPage.submitSingUpForm()
        await confirmPhonePage.confirmPhone(user)

        await page.waitForTimeout(5000)
        await vrt.trackPage(page, "Empty Package list page", vrtOptions)
    })
})
