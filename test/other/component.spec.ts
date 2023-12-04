import { expect } from "@playwright/test"
import * as creds from "../../creds.json"
import { test } from "../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../src/models/eventDetails"
import { PackageEditPage } from "../../src/pages/packageEditPage"
import { PackageListPage } from "../../src/pages/packageListPage"
import { SearchPage } from "../../src/pages/searchPage"
import { SupplierServicePage } from "../../src/pages/supplierServicePage"
import * as DateHelper from "../../src/utils/dateHelper"
import * as RandomHelper from "../../src/utils/randomHelper"

test.describe("Componnet", () => {
    const eventDetails: IEventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
            eventCategory: "Music",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }

    test("check resize img @comp ", async ({ mainPage }) => {
        await test.step("Test steps", async() => {
            const searchPage: SearchPage = await mainPage.clickOnSerachButton()
            await searchPage.setEventDetails(eventDetails)
            await searchPage.clickOnSerachButton()
            await searchPage.setEventCategory(eventDetails.eventCategory || "null")
            await searchPage.checkReSize()
        })
    })

    test("crop image in service @C55 @noSafari @noMobile ", async ({ mainPage, isMobile }) => {
        await test.step("Test steps", async() => {
            const testPackName = "Catering Test service per guest"
            const loginPage = await mainPage.openLoginForm(isMobile)
            const supplierServicePage = (await loginPage.loginAs(creds.supplier[0])) as SupplierServicePage
            const packagePage: PackageListPage = new PackageListPage(supplierServicePage.page, isMobile)
            await packagePage.filterByStatus("PUBLISHED")
            const packageImgOld = await packagePage.getPackageImgSettings(testPackName)
            const packageEditSettings: PackageEditPage =
                await packagePage.openServiceByName(testPackName)
            await packageEditSettings.openLogo()
            await packageEditSettings.mutateLogo()
            await packageEditSettings.openSideBarMenu("Services")
            const newImgProps = await packagePage.getPackageImgSettings(testPackName)
            expect(packageImgOld).not.toEqual(newImgProps)

            const newMainPage = await packagePage.header.clickOnHeaderLogo()
            const searchPage = await newMainPage.clickOnSerachButton()
            await searchPage.setEventCategory("Food & Drinks -> African Catering")
            const searchImgProps = await searchPage.getServiceCardImgProps(testPackName)
            expect(newImgProps).toEqual(searchImgProps)

            const servicePage = await searchPage.clickOnServiceByName(testPackName)
            await servicePage.goToMoreServices()
            await servicePage.openRandomOtherService()
            const serviceImgProps = await servicePage.getServiceCardImgProps(testPackName)
            expect(newImgProps).toEqual(serviceImgProps)

            // const supplierDashboard: SuppDashboardPage =
            //     await supplierServicePage.openSideBarMenu("Dashboard") as SuppDashboardPage
            // const suppAsClient: SuppSeeAsClientPage = await supplierDashboard.openSeeAsClientBoard()
            // const seeAsClientImgProps = await suppAsClient.getServiceImgProps(testPackName)
        })
    })
})
