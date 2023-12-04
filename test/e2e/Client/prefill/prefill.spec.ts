import { expect } from "@playwright/test"
import { URL } from "url"
import { test } from "../../../../src/fixtures/mainPageFixtures"
import { IEventDetails } from "../../../../src/models/eventDetails"
import { AcquisitionLocalPage } from "../../../../src/pages/acquisitionLocalPage"
import { CheckoutPage } from "../../../../src/pages/checkoutPage"
import { EventDashboard } from "../../../../src/pages/eventDashboard"
import { PaymentPage } from "../../../../src/pages/paymentPage"
import { PaymentSuccessPage } from "../../../../src/pages/paymentSuccessPage"
import { SearchPage } from "../../../../src/pages/searchPage"
import * as DateHelper from "../../../../src/utils/dateHelper"

test.describe("Client prefill", () => {
    let eventDetails: IEventDetails = {
        }

    test.beforeEach(() => {
        eventDetails = {
            date: `${DateHelper.getDateStringWithOffsetInFormat(2, "D MMM YYYY")}`,
            eventCategory: "Private Chef",
            eventType: "Anniversary",
            guestAmount: "4",
            postcode: "TS225PS",
        }
    })

    test("Prefill after back from Service page @C72 @mobile @smoke ", async ({ mainPage, isMobile }, testInfo) => {
        await test.step("Test steps", async() => {
            const searchPage = await mainPage.clickOnSerachButton()
            await searchPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
            await searchPage.clickOnSerachButton()
            await searchPage.setEventCategory(eventDetails.eventCategory || "NO CATEGORY")
            const servicePage = await searchPage.clickOnRandomService()
            expect(await servicePage.isEventDetailPrefill()).toBeTruthy()
            const prefill = await servicePage.getPrefillEventDetail()
            delete eventDetails.eventCategory
            expect(eventDetails).toEqual(prefill)
            await servicePage.goBack()
            await searchPage.pageLoaded()
            const backPrefill = await searchPage.getPrefill(isMobile)
            expect(eventDetails).toEqual(backPrefill)
        })
    })

    test("Prefill from Acquisition page to Search page @C69 @smoke @mobile ", async ({ mainPage }, testInfo) => {
        await test.step("Test steps", async() => {
            const  acquisition = await mainPage.openAcquisitionPage()
            const acquisitionLocalPage = await acquisition.openFirstAcquisitionLocalPage()
            const searchPage = await acquisitionLocalPage
                .setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
            expect(await searchPage.isCategoryChoosen("Mobile Bar")).toBeFalsy()
            expect(await searchPage.isSubCategoryChoosen()).toBeTruthy()
        })
    })

    test("Prefill from Acquisition page to Explore Other Categories after payment to Search page @C24 @C73 @C74 @mobile @smoke ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Test steps", async() => {
                const  acquisition = await mainPage.openAcquisitionPage()
                let searchPage: SearchPage =
                    await acquisition.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                delete eventDetails.eventCategory
                expect(eventDetails).toEqual(await searchPage.getPrefill(isMobile))
                let servicePage = await searchPage.clickOnRandomService()
                expect(eventDetails).toEqual(await servicePage.getPrefillEventDetail())
                let checkout = await servicePage.clickOnRequestToBook(true)
                expect(await checkout
                    .isTextPresent("This service is ready to book. Your supplier is available & you can see your price quote below. Need help? Call us via "),
                ).toBeTruthy()
                const checkoutUrl = checkout.page.url()
                const paymentPage: PaymentPage = await checkout.clickOnBookNow()
                const paymentSuccess = await paymentPage.fillPaymentInformation() as PaymentSuccessPage
                searchPage = await paymentSuccess.exploreOtherCategories()
                expect(eventDetails).toEqual(await searchPage.getPrefill(isMobile))
                await searchPage.page.goto(new URL(checkoutUrl).pathname)
                checkout = await new CheckoutPage(searchPage.page, isMobile).pageLoaded()
                servicePage = await checkout.clickOnLinkWithText("View service")
                await servicePage.isCtaButton("GET INSTANT QUOTE")
                await servicePage.isTextPresent("You already have a quote with this service")
                await servicePage.clickOnViewQuote()
            })
        },
    )

    test("Redirect from Acquisition page to service page | highlighted service card @C95 @C70 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                const msgText = "Add event details in the form above to see live pricing & availability"
                const  acquisition = await mainPage.openAcquisitionPage()
                const acquisitionLocalPage = await acquisition.openRandomLocalAcquisitonPage()
                const servicePage = await acquisitionLocalPage.openRandomLocalAcquisitonCard()
                expect(await servicePage.isCtaButton("CHECK AVAILABILITY")).toBeTruthy()
                expect(await servicePage.isCtaButton("SAVE FOR LATER")).toBeTruthy()
                const searchPage = await servicePage.clickOnBackToSearch()
                expect(await searchPage.isTextPresent(msgText)).toBeTruthy()
                await searchPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const updSearchPage = await searchPage.clickOnSerachButton()
                expect(await updSearchPage.isTextPresent(msgText)).toBeFalsy()
            })
    })

    test("Prefill from banner | Client Event dashboard | Prefill from Find a new service | Quote submitted state @C80 @C68 @smoke @mobile ",
        async ({ mainPage }, testInfo) => {
            await test.step("Test steps", async() => {
                let searchPage = await mainPage.clickOnSerachButton()
                await searchPage.setEventCategory("Solo Singer")
                await searchPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                await searchPage.clickOnSerachButton()
                await searchPage.goToPaginationPage("2")
                let servicePage = await searchPage.openRandomAlternativeCard()
                expect(await servicePage.isEventDetailPrefill()).toBeTruthy()
                const checkoutPage =
                    await servicePage.clickOnRequestToBook(true)
                servicePage = await checkoutPage.clickOnLinkWithText("View service")
                expect(await servicePage.isEventDetailPrefill())
                const eventList = await servicePage.goToEventListPage()
                const eventDashboard: EventDashboard = await eventList.clickOnEventByType("Anniversary")
                searchPage = await eventDashboard.clickOnBannerButton("EXPLORE")
                expect(await searchPage.isPrefill()).toBeTruthy()
            })
        },
    )

    test("Prefill from Search page to Acquisition page @C96 @smoke @mobile ",
        async ({ mainPage, isMobile }, testInfo) => {
            await test.step("Test steps", async() => {
                const  acquisition = await mainPage.openAcquisitionPage()
                let acquisitionLocalPage = await acquisition.openRandomLocalAcquisitonPage()
                const searchPage = await acquisitionLocalPage.clickOnSearch()
                expect(await searchPage.isSubCategoryChoosen()).toBeTruthy()
                expect(await searchPage.isTextPresent("Add event details in the form above to see live pricing & availability"))
                    .toBeTruthy()
                await searchPage.setEventDetails(eventDetails, testInfo.project.name === "Mobile Safari")
                const updSearchPage = await searchPage.clickOnSerachButton()
                await updSearchPage.goBack()
                if (!isMobile) {
                    acquisitionLocalPage = await new AcquisitionLocalPage(updSearchPage.page).pageLoaded()
                    const actualPrefill = await acquisitionLocalPage.getPrefill(isMobile)
                    delete eventDetails.eventCategory
                    expect(actualPrefill, `${JSON.stringify(actualPrefill)} not equals ${JSON.stringify(eventDetails)}`)
                        .toEqual(eventDetails)
                } else {
                    expect(await updSearchPage.isMobileSearchForm()).toBeTruthy()
                }
        })
    })

    test("Prefill from category banner on main page @C140 @mobile @smoke ", async ({ mainPage }) => {
        await test.step("Test steps", async() => {
            const category = "DJ"
            const searchPage = await mainPage.clickCategoryBanner(category)
            expect(await searchPage.isCategoryChoosen(category)).toBeTruthy()
        })
    })
})
