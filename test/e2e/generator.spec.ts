import { expect } from "@playwright/test"
import { test } from "../../src/fixtures/mainPageFixtures"
import { PackageCreation } from "../../src/models/packageCreation"
import { ConfirmPhonePage } from "../../src/pages/confirmPhonePage"
import { PackageCreationPage } from "../../src/pages/packageCreationPage"
import { PackageListPage } from "../../src/pages/packageListPage"
import { SignUpPage } from "../../src/pages/signUpPage"
import { SuppCalendarPage } from "../../src/pages/suppCalendarPage"
import { SupplierServicePage } from "../../src/pages/supplierServicePage"
import * as DataHelper from "../../src/utils/dataHelper"
import * as RandomHelper from "../../src/utils/randomHelper"
import * as StringHelper from "../../src/utils/stringHelper"

test.describe("Test Data", () => {
    let serviceProps: PackageCreation = {
        basePrice: "100",
        childCategory: "Videographer",
        depositAmount: "25",
        freeTravel: "5",
        maxTravel: "300",
        pathToLogo: "ServiceLogo.jpeg",
        photos: ["test1.jpg", "test2.jpg", "test3.jpg", "test4.jpg"],
        postcode: "",
        pricePerMail: "5",
        promoteText: StringHelper.getRandomText(150),
        rootCategory: "Photo or Video",
        serviceDescription: StringHelper.getRandomText(300),
        serviceName: `Test Servece ${StringHelper.getRandomStr(10)} ${StringHelper.getRandomStr(15)}`,
        tellAboutService: StringHelper.getRandomText(150),
    }

    test("Supplier generator ", async ({ mainPage }) => {
        const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
        await singUpPage.pageLoaded()
        await singUpPage.fillSingUpForm(RandomHelper.getSingUpRandomUser("Supplier",
            { email: "testSupp113@inbucket.stage.gigmngr.com", password: "A12345678"}))
        const confirmPhonePage: ConfirmPhonePage = await singUpPage.submitSingUpForm()
        await confirmPhonePage.pageLoaded()
    })

    test("Publish service NEW USER in Music category @test ", async ({ mainPage, isMobile }) => {
        if (!isMobile) {
            await test.step("Test steps", async() => {
                serviceProps = {
                    ...serviceProps,
                    breakeBetweenSets: "20",
                    childCategory: "Silent Disco",
                    rootCategory: "Party Equipment",
                    serviceDuration: "20",
                    setsDuration: "20",
                    setsNumber: "3",
                }
                const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
                await singUpPage.pageLoaded()
                const user = DataHelper.getSuppByName("testSupp137")
                await singUpPage.fillSingUpForm(user)
                const confirmPhonePage: ConfirmPhonePage = await singUpPage.submitSingUpForm()
                let packageList: PackageListPage =
                    await confirmPhonePage.confirmPhone(user)
                const packageCreateScreen: PackageCreationPage = await packageList.clickOnCreateService()
                serviceProps.serviceDuration = "10"
                await packageCreateScreen.setAllForms(serviceProps)
                const calendarPage: SuppCalendarPage = await packageCreateScreen.publishService(user)
                packageList = await calendarPage.openSideBarMenu("Services") as PackageListPage
                expect(await packageList.isServicePublished(serviceProps.serviceName)).toBeTruthy()
            })
        }
    })

    test("Publish service EXISTS USER ", async ({ mainPage, isMobile }) => {
        if (!isMobile) {
            await test.step("Test steps", async() => {
                const user = DataHelper.getSuppByName("testSupp136")
                const loginPage = await mainPage.openLoginForm(isMobile)
                const supplierServicePage = (await loginPage.loginAs(user)) as SupplierServicePage
                const packageCreateScreen: PackageCreationPage = await supplierServicePage.clickOnCreateService()
                // serviceProps.serviceDuration = "10"
                await packageCreateScreen.setAllForms(serviceProps)
                const calendarPage: SuppCalendarPage = await packageCreateScreen.publishService(user)
                const packageList = await calendarPage.openSideBarMenu("Services") as PackageListPage
                expect(await packageList.isServicePublished(serviceProps.serviceName)).toBeTruthy()
            })
        }
    })
})
