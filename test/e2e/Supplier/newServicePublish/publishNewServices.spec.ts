import { expect } from "@playwright/test"
import { test } from "../../../../src/fixtures/mainPageFixtures"
import { PackageCreation } from "../../../../src/models/packageCreation"
import { ConfirmPhonePage } from "../../../../src/pages/confirmPhonePage"
import { PackageCreationPage } from "../../../../src/pages/packageCreationPage"
import { PackageListPage } from "../../../../src/pages/packageListPage"
import { SignUpPage } from "../../../../src/pages/signUpPage"
import { SuppCalendarPage } from "../../../../src/pages/suppCalendarPage"
import * as RandomHelper from "../../../../src/utils/randomHelper"
import * as StringHelper from "../../../../src/utils/stringHelper"

test.describe("Supplier", () => {
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

    test("Create and Publish service in Photo or Video Services category @C128 @smoke ",
        async ({ mainPage }) => {
            await test.step("Test steps", async() => {
                const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
                await singUpPage.pageLoaded()
                const user = RandomHelper.getSingUpRandomUser("Supplier")
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
    })

    test("Create and Publish service in Music category @C127 @smoke ",
        async ({ mainPage }) => {
            await test.step("Test steps", async() => {
                serviceProps = {
                    ...serviceProps,
                    breakeBetweenSets: "20",
                    childCategory: "DJ",
                    rootCategory: "Music",
                    serviceDuration: "20",
                    setsDuration: "20",
                    setsNumber: "3",
                    videoLink: "https://www.youtube.com/watch?v=C0DPdy98e4c",
                }
                const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
                await singUpPage.pageLoaded()
                const user = RandomHelper.getSingUpRandomUser("Supplier")
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
    })

    test("Create and Publish service in Party Equipment category @C124 @smoke ",
        async ({ mainPage }) => {
            await test.step("Test steps", async() => {
                serviceProps = {
                    ...serviceProps,
                    breakeBetweenSets: "20",
                    childCategory: "Event Decoration",
                    rootCategory: "Party Equipment",
                    serviceDuration: "20",
                    setsDuration: "20",
                    setsNumber: "3",
                }
                const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
                await singUpPage.pageLoaded()
                const user = RandomHelper.getSingUpRandomUser("Supplier")
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
    })

    test("Create and Publish service in Event Staff category @C125 @smoke ",
        async ({ mainPage }) => {
            await test.step("Test steps", async() => {
                serviceProps = {
                    ...serviceProps,
                    breakeBetweenSets: "20",
                    childCategory: "Bartender",
                    rootCategory: "Event Staff",
                    serviceDuration: "20",
                    setsDuration: "20",
                    setsNumber: "3",
                }
                const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
                await singUpPage.pageLoaded()
                const user = RandomHelper.getSingUpRandomUser("Supplier")
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
    })

    test("Create and Publish service in Food & Drinks category @C126 @smoke ",
        async ({ mainPage }) => {
            await test.step("Test steps", async() => {
                serviceProps = {
                    ...serviceProps,
                    childCategory: "Mobile Bar",
                    rootCategory: "Food & Drinks",
                }
                const singUpPage: SignUpPage = await mainPage.openSupplierSingUp()
                await singUpPage.pageLoaded()
                const user = RandomHelper.getSingUpRandomUser("Supplier")
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
    })
})
