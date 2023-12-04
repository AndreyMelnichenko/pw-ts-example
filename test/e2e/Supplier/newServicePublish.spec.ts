import { expect } from "@playwright/test"
import { test } from "../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../src/models/eventDetails"
import { PackageCreation } from "../../../src/models/packageCreation"
import { ConfirmPhonePage } from "../../../src/pages/confirmPhonePage"
import { NewContextMainPage } from "../../../src/pages/newContextMainPage"
import { PackageCreationPage } from "../../../src/pages/packageCreationPage"
import { PackageListPage } from "../../../src/pages/packageListPage"
import { ServicePage } from "../../../src/pages/servicePage"
import { SignUpPage } from "../../../src/pages/signUpPage"
import { SuppCalendarPage } from "../../../src/pages/suppCalendarPage"
import { SuppCheckoutPage } from "../../../src/pages/suppCheckoutPage"
import { SupplierServicePage } from "../../../src/pages/supplierServicePage"
import * as DataHelper from "../../../src/utils/dataHelper"
import * as DateHelper from "../../../src/utils/dateHelper"
import * as RandomHelper from "../../../src/utils/randomHelper"
import * as StringHelper from "../../../src/utils/stringHelper"

test.describe("Supplier", () => {
    let packageList: PackageListPage
    const newService: PackageCreation = {
        basePrice: "100",
        childCategory: "Party Transport",
        depositAmount: "26",
        freeTravel: "5",
        guestAmount: {
            from: "5",
            to: "500",
        },
        maxTravel: "300",
        pathToLogo: "ServiceLogo.jpeg",
        photos: ["test1.jpg", "test2.jpg", "test3.jpg", "test4.jpg"],
        postcode: "TS225PS",
        pricePerMail: "5",
        promoteText: StringHelper.getRandomText(110),
        rootCategory: "Transport",
        serviceDescription: StringHelper.getRandomText(300),
        serviceDuration: "60",
        serviceName: `Test Servece ${StringHelper.getRandomStr(10)} ${StringHelper.getRandomStr(15)}`,
        setsNumber: "5",
        tellAboutService: StringHelper.getRandomText(200),
    }

    test("publish new service @C2 @C97 @smoke ", async ({ mainPage, isMobile }, testInfo) => {
        let serviceId = ""
        let quote = ""
        const user = RandomHelper.getSingUpRandomUser("Supplier")
        await test.step("Publish service", async() => {
            const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
            await singUpPage.pageLoaded()
            await singUpPage.fillSingUpForm(user)
            const confirmPhonePage: ConfirmPhonePage = await singUpPage.submitSingUpForm()
            packageList = await confirmPhonePage.confirmPhone(user)
            const packageCreateScreen: PackageCreationPage = await packageList.clickOnCreateService()
            await packageCreateScreen.setAllForms(newService)
            const calendarPage: SuppCalendarPage = await packageCreateScreen.publishService(user)
            serviceId = await packageCreateScreen.getServiceId(user)
            packageList = await calendarPage.openSideBarMenu("Services") as PackageListPage
            expect(await packageList.isServicePublished(newService.serviceName)).toBeTruthy()
        })
        await test.step("Depozit frozen", async() => {
            const newMainPage = await new NewContextMainPage(testInfo).getNewContextPage()
            const eventDetails: IEventDetails = {
                date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
                eventCategory: newService.rootCategory,
                eventType: "Anniversary",
                guestAmount: "5",
                postcode: newService.postcode,
            }
            const servicePage: ServicePage = await newMainPage.openService(serviceId)
            await servicePage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
            const checkoutPage =
                await servicePage.clickOnRequestToBook(true)
            quote = await checkoutPage.getQuoteId()
            const paymentPage = await checkoutPage.clickOnBookNow()
            await paymentPage.fillPaymentInformation()
            await paymentPage.page.close()
        })
        await test.step("Supp add biling details", async() => {
            await packageList.page.goto(`/s/inbox/${quote}`)
            const suppCheckout = new SuppCheckoutPage(packageList.page, isMobile)
            await suppCheckout.pageLoaded()
            expect(await suppCheckout.isTextPresent("ADD BANK DETAILS TO CONFIRM")).toBeTruthy()
            const bilingDetails = await suppCheckout.clickToAddBankDetails()
            await bilingDetails.fillPassword(user.password)
            // suppCheckout = await bilingDetails.fillBankDetails()
            // await suppCheckout.confirmBooking()
        })
    })

    test("publish new service with exists supplier @C3 @smoke  ", async ({ mainPage, isMobile }) => {
        await test.step("Test steps", async() => {
            const loginPage = await mainPage.openLoginForm(isMobile)
            const supplierServicePage = (await loginPage
                .loginAs(DataHelper.getSuppByName("testSupp105"))) as SupplierServicePage
            const packageCreateScreen: PackageCreationPage = await supplierServicePage.clickOnCreateService()
            newService.photos = []
            await packageCreateScreen.setAllForms(newService)
            const calendarPage: SuppCalendarPage =
                await packageCreateScreen.publishService(DataHelper.getSuppByName("testSupp105"))
            packageList = await calendarPage.openSideBarMenu("Services") as PackageListPage
            expect(await packageList.isServicePublished(newService.serviceName)).toBeTruthy()
        })
    })
})
