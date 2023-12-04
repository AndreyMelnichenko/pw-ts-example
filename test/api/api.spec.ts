import { expect, Page, test } from "@playwright/test"
import * as creds from "../../creds.json"
import { ApiHelperController } from "../../src/Api/Controllers/apiHelperController"
import { ApiPackageController } from "../../src/Api/Controllers/packageController"
import { Profile } from "../../src/models/GraphQL/profile"
import { LoginPage } from "../../src/pages/loginPage"
import { MainPage } from "../../src/pages/mainPage"
import { SupplierServicePage } from "../../src/pages/supplierServicePage"
import * as DataHelper from "../../src/utils/dataHelper"

test.use({ headless: true })

test.describe("Api call", () => {
    let loginedPage: SupplierServicePage

    test.beforeEach(async ({ page }) => {
        await page.goto("/")
        const mainPage = new MainPage(page)
        await mainPage.pageLoaded()
        const loginPage: LoginPage = await mainPage.openLoginForm()
        await loginPage.pageLoaded()
        loginedPage = await loginPage.loginAs(creds.admin) as SupplierServicePage
    })

    test("get personal id @api ", async () => {
        const profile: Profile = await new ApiHelperController(loginedPage.page).getUserId()
        expect(profile.email).toEqual(creds.admin.email)
    })

    test("get City list from GraphQL @api ", async () => {
        const cities: Array<string> = await new ApiHelperController(loginedPage.page).getCityList()
        expect(cities.length > 0).toBeTruthy()
    })

    test("get Pack list from GraphQL ", async () => {
        const pack = new ApiPackageController()
        await pack.getPackList(DataHelper.getSuppByName("testSupp57"))
    })
})
