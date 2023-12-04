import { expect, Page } from "@playwright/test"
import * as RandomHelper from "../../src/utils/randomHelper"
import * as StringHelper from "../../src/utils/stringHelper"
import { ApiHelperController } from "../Api/Controllers/apiHelperController"
import { ApiPackageController } from "../Api/Controllers/packageController"
import { UIElement } from "../components/uiElement"
import { LeftSideBarMenu, LeftSideBarMenuPage } from "../models/leftSideBarMenu"
import { PackageCreation } from "../models/packageCreation"
import { IUser } from "../models/user"
import { BasePage } from "./basePage"
import { LeftSideMenu } from "./components/leftMenu"
import { SuppCalendarPage } from "./suppCalendarPage"

export class PackageCreationPage extends BasePage implements LeftSideBarMenu {
    protected uiElement: UIElement
    protected newServiceSettings: PackageCreation = {}
    protected apiController: ApiHelperController
    protected sideBarMenu: LeftSideMenu
    protected availableImages = "//*[@class='ui teal left corner label']"
    private readonly packageController: ApiPackageController
    private readonly postcodes: Array<string> = ["ne11ad", "ne11aa", "ne11ah", "ts225pp", "ts225pr", "ts225pt"]

    constructor(page: Page, isMobile = false) {
        super(page)
        this.page = page
        this.isMobile = isMobile
        this.uiElement = new UIElement(this.page)
        this.apiController =  new ApiHelperController(this.page)
        this.sideBarMenu = new LeftSideMenu(this.page, isMobile)
        this.packageController = new ApiPackageController()
    }

    async pageLoaded(): Promise<PackageCreationPage> {
        await this.page.reload()
        await this.uiElement.waitForUrl(/.*\/package-create\/.*/g)
        await this.uiElement.waitForArraySize("div.step", 10, 25000)

        return this
    }

    async openSideBarMenu(itemName: string): Promise<LeftSideBarMenuPage> {
        return this.sideBarMenu.openMenuItem(itemName)
    }

    async setAllForms(newService: PackageCreation): Promise<void> {
        if (newService.postcode === "NOT SET") newService.postcode = await this.getPostCode()
        this.newServiceSettings = newService
        await this.setOverviewTab()
        await this.setPriceOptions()
        await this.setDescription()
        await this.fillQandA()
        await this.setExtras()
        await this.setEvents()
        await this.setCalendar()
        await this.setTravel()
        await this.setDepositAmount()
    }

    async publishService(user: IUser): Promise<SuppCalendarPage> {
        return this.publish(user)
    }

    async getServiceId(user: IUser): Promise<string> {
        const packList = await this.packageController.getPackList(user)

        return String(packList.services[0].pk)
    }

    protected async saveAndContinue(text = "SAVE & CONTINUE"): Promise<void> {
        await this.uiElement.button.clickButtonByText(text)
    }

    private async getPostCode(): Promise<string> {
        return RandomHelper.getRandomArrayElement(this.postcodes)
    }

    private async setOverviewTab(): Promise<void> {
        await this.chooseServiceCategory(this.newServiceSettings.rootCategory)
        await this.chooseServiceCategory(this.newServiceSettings.childCategory)
        await this.setServiceName(this.newServiceSettings.serviceName)
        await this.setLogo()
        await this.addPhotos()
        if (this.newServiceSettings.videoLink) {
            await this.addVideoLink()
        }
        await this.saveAndContinue()
        await this.uiElement
            .waitForElementVisible("css=.active.step >> xpath=//*[text()='Price Options']", 10000)
    }

    private async chooseServiceCategory(catName: string): Promise<void> {
        await this.uiElement.checkbox.checkByTextContains(catName)
    }

    private async setServiceName(name: string): Promise<void> {
        await this.uiElement.input.
            setText("[placeholder='Enter your title']", name)
    }

    private async setLogo(isAvailableImage = false): Promise<void> {
        await this.waitFor(2)
        await this.uiElement.clickOnElement(".photo.fitted.icon")
        await this.waitFor(2)
        await this.uiElement.waitForElementVisible(".ui.modal.transition.visible.active")
        await this.waitFor(2)
        if (!isAvailableImage) {
            await this.setPhoto(`./src/fixtures/${this.newServiceSettings.pathToLogo}`)
        } else {
            await this.markExistsPhoto()
        }
        await this.waitFor(2)
        await this.uiElement.button.clickButtonByText("SAVE IMAGE")
        await this.waitFor(2)
    }

    private async addPhotos(): Promise<void> {
        await this.uiElement.clickOnElement("//div[@name='photos']/following-sibling::div")
        if (this.newServiceSettings.photos.length !== 0) {
            for (const photo of this.newServiceSettings.photos) {
                await this.setPhoto(`./src/fixtures/${photo}`)
                await this.waitFor(3)
            }
            await this.uiElement.clickOnElement(this.availableImages)
        } else {
            for (const photo of ["1", "2", "3", "4"]) {
                await this.markExistsPhoto(photo)
            }
        }
        await this.waitFor(3)
        await this.uiElement.clickOnElement(".ui.pink.button")
    }

    private async addVideoLink(): Promise<void> {
        await this.uiElement.clickOnElement("//div[@name='videos']/following-sibling::div")
        await this.uiElement.input.setText("input[name='video-upload']", this.newServiceSettings.videoLink)
        await this.uiElement.clickOnElement("[data-tid='ClipButton']")
        await this.uiElement.clickOnElement(".ui.teal.left.corner.label>.plus")
        await this.uiElement.waitForElementVisible(".ui.green.left.corner.label")
        await this.uiElement.clickOnElement(".ui.pink.button")
        await this.uiElement.waitForElementVisible(".ui.pink.button", 10000, true)
    }

    private async markExistsPhoto(imgIndex = "1"): Promise<void> {
        await this.uiElement.clickOnElement(`(${this.availableImages})[${imgIndex}]`)
    }

    private async setPhoto(path: string): Promise<void> {
        await this.uiElement.input.uploadFile(path)
    }

    private async setPriceOptions(): Promise<void> {
        switch (this.newServiceSettings.rootCategory) {
            case "Photo or Video":
            case "Party Equipment":
            case "Transport":
                await this.uiElement.waitForElementVisible("//h1[text()='Price']")
                await this.setBasePrice(this.newServiceSettings.basePrice)
                await this.setServiceDuration(this.newServiceSettings.serviceDuration)
                break
            case "Music":
                await this.uiElement.waitForElementVisible("//h1[text()='Price']")
                await this.setBasePrice(this.newServiceSettings.basePrice)
                await this.setServiceDuration(this.newServiceSettings.serviceDuration)
                await this.setNumberOfSets(this.newServiceSettings.setsNumber)
                await this.setDuration(this.newServiceSettings.setsDuration)
                await this.setBreak(this.newServiceSettings.breakeBetweenSets)
                break
            case "Event Staff":
                await this.uiElement.input.setText("(//h3[text()='min']/following::input)[1]", "1")
                await this.uiElement.input.setText("(//h3[text()='max']/following::input)[1]", "100")
                await this.setBasePrice(this.newServiceSettings.basePrice)
                await this.uiElement.input.setText("(//h3[text()='min']/following::input)[4]", "1")
                await this.uiElement.input.setText("(//h3[text()='max']/following::input)[4]", "100")
                break
            case "Food & Drinks":
                await this.uiElement.waitForElementVisible("//h1[text()='Price']")
                await this.setBasePrice(this.newServiceSettings.basePrice)
                break
            default:
                throw new Error("Bad service category!")
        }

        if (this.newServiceSettings.guestAmount) {
            await this.guestAmount(
                this.newServiceSettings.guestAmount.from,
                this.newServiceSettings.guestAmount.to)
        }
        await this.saveAndContinue()
    }

    private async setBasePrice(price: string): Promise<void> {
        await this.uiElement.input
            .setText("input[placeholder='Add base price'],input[placeholder='Price for duration']", price)
    }

    private async setNumberOfSets(sets: string): Promise<void> {
        await this.uiElement.input.setText("input[placeholder='How many?']", sets)
    }

    private async setDuration(setDuration: string): Promise<void> {
        await this.uiElement.input.setText("(//div[text()='Set’s duration:']/following::input)[1]", setDuration)
    }

    private async setBreak(breakeBetweenSets: string): Promise<void> {
        await this.uiElement.input.setText("(//div[text()='Break between sets:']/following::input)[1]",
            breakeBetweenSets)
    }

    private async setServiceDuration(duration: string): Promise<void> {
        await this.uiElement.input.setText("//div[text()='Minutes' or text()='day(s)']/preceding-sibling::input",
            duration)
    }

    private async guestAmount(from: string, to: string): Promise<void> {
        await this.uiElement.input.setText("//div[text()='From']/following-sibling::div/input", from)
        await this.uiElement.input.setText("//div[text()='To']/following-sibling::div/input", to)
    }

    private async setDescription(): Promise<void> {
        await this.uiElement.waitForElementVisible("//div[@class='active step']//a[text()='Description']", 45000)
        await this.setDescrOfService(this.newServiceSettings.serviceDescription)
        await this.setTellAboutService(this.newServiceSettings.tellAboutService)
        await this.setPromoteServiceText(this.newServiceSettings.promoteText)
        await this.saveAndContinue()
    }

    private async setDescrOfService(seviceDescr: string): Promise<void> {
        await this.uiElement.input.
            setText("//h2[text()='Describe your service']/following-sibling::div//textarea", seviceDescr)
    }

    private async setTellAboutService(text: string): Promise<void> {
        await this.uiElement.input.setText(
            "(//h2[text()='Tell us about your vehicle' or text()='Tell us about you']/following::div//textarea)[1]"
            , text)
    }

    private async setPromoteServiceText(text: string): Promise<void> {
        await this.uiElement.input.
            setText("(//h2[text()='Promote this service']/following::div//textarea)[1]", text)
    }

    private async fillQandA(): Promise<void> {
        await this.uiElement.waitForElementVisible("//h2[text()='Questions & Answers']", 15000)
        await this.fillArrayList()
        await this.fillListGroup()
        await this.setInputByName("Field", StringHelper.getRandomText(20))
        await this.chooseCheckBoxByText("Checkbox 1")
        await this.chooseRadioButton("Radio", "Yes")
        await this.fillDropDown()
        await this.fillTextArea()
        await this.fillNumberField()
        await this.saveAndContinue("SAVE ANSWERS & CONTINUE")
    }

    private async fillArrayList(arrValues = ["One", "Two", "Tree"]): Promise<void> {
        const arrInputSelector = "[data-tid='ArrayInput'] input[placeholder='Array']"
        for (const el of arrValues) {
            await this.setArrListValue(arrInputSelector, el)
        }
    }

    private async setArrListValue(selector: string, value: string): Promise<void> {
        await this.uiElement.input.setText(selector, value)
        await this.page.keyboard.press("Enter")
    }

    private async fillListGroup(): Promise<void> {
        const arrValues = ["One", "Two", "Tree"]
        await this.uiElement.input.setText("(//div[text()='ListGroup']/following::input)[1]",
            StringHelper.getRandomText(15))
        for (const el of arrValues) {
            await this.setArrListValue("//div[text()='ListGroup']/following::div[@data-tid='ArrayInput']//input", el)
        }
    }

    private async fillDropDown(): Promise<void> {
        await this.uiElement.clickOnElement("[data-tid='Dropdown'] [data-tid='Input']")
        const ddListSelector = "(//div[@data-tid='Dialog']//div[contains(@style,'user-select')]/div)[3]"
        await this.uiElement.clickOnElement(ddListSelector, 5000)
        expect(await this.uiElement.getAttribute("[data-tid='Dropdown'] [data-tid='Input']", "value"))
            .not.toEqual("")
    }

    private async fillTextArea(): Promise<void> {
        await this.uiElement.input.setText("textarea[placeholder='Text']", StringHelper.getRandomText(120))
    }

    private async fillNumberField(value = 5): Promise<void> {
        await this.uiElement.input.setText("[data-tid='Input'][placeholder='Number']", `${value}`)
    }

    private async setInputByName(inputName: string, text: string): Promise<void> {
        await this.uiElement.input.setText(`//div[text()='${inputName}']/following-sibling::div/input`, text)
    }

    private async chooseCheckBoxByText(featureName: string): Promise<void> {
        await this.uiElement.checkbox.checkByTextContains(featureName)
    }

    private async chooseRadioButton(text: string, valueLabel: string): Promise<void> {
        await this.uiElement.clickOnElement(
            `(//h3[text()='${text}']/following::div/div[@data-tid="SliderLabel"]/*[text()='${valueLabel}'])[1]`)
    }

    private async setExtras(): Promise<void> {
        await this.uiElement.waitForElementVisible("//h2[text()='Extra services available with this option']")
        await this.uiElement.clickOnElement("//button[text()='Save & Continue']")
    }

    private async setEvents(): Promise<void> {
        await this.uiElement.waitForElementVisible("//div[text()='What events would you like to work on?']")
        await this.uiElement.clickOnElement("//button[text()='Save & Continue']")
    }

    private async setCalendar(): Promise<void> {
        await this.uiElement.waitForElementVisible("//h2[text()='Tweak your price for certain days and dates']", 25000)
        await this.saveAndContinue()
    }

    private async setTravel(): Promise<void> {
        await this.setPostCode()
        await this.setFreeTravel()
        await this.setMaxTravel()
        await this.setPricePerMile()
        await this.uiElement.clickOnElement("//button[text()='Save & Continue']")
    }

    private async setPostCode(): Promise<void> {
        const postcode = this.newServiceSettings.postcode
            ? this.newServiceSettings.postcode.toUpperCase()
            : (await this.getPostCode()).toUpperCase()
        const normalizedPostcode =
            `${postcode.substring(0, postcode.length - 3)} ${postcode.slice(postcode.length - 3, postcode.length)}`
        const postCodeSelector = `//*[text()='${normalizedPostcode}']`
        const postCodeArr = []
        for (const c of postcode) {
            postCodeArr.push(c)
        }
        let index = 0
        if (await this.uiElement.getAttribute("[placeholder='Postal code']", "value") === "") {
            while (!(await this.uiElement.isElementDisplayed(postCodeSelector, 1000))) {
                await this.uiElement.input.typeText("[placeholder='Postal code']", postCodeArr[index])
                await this.uiElement.waitForElementVisible("[data-tid='Loader']", 15000, true)
                index = index + 1
            }
            await this.waitFor(2)
            await this.uiElement.clickOnElement(postCodeSelector, 20000)
        }
    }

    private async setFreeTravel(): Promise<void> {
        await this.uiElement.input.setText("input[name='freeMiles']",
            this.newServiceSettings.freeTravel)
    }

    private async setMaxTravel(): Promise<void> {
        await this.uiElement.input.setText("input[name='maxDistance']",
            this.newServiceSettings.maxTravel)
    }

    private async setPricePerMile(): Promise<void> {
        await this.uiElement.input.setText("input[name='pricePerMile']",
            this.newServiceSettings.pricePerMail)
    }

    private async setDepositAmount(): Promise<void> {
        await this.uiElement.input.setText("input[name='percent']",
            this.newServiceSettings.depositAmount)
        await this.uiElement.clickOnElement("//button[text()='Save & Continue']")
    }

    private async publish(user: IUser): Promise<SuppCalendarPage> {
        await this.uiElement.button.clickButtonByText("PUBLISH LISTING")
        const suppCalendarPage = await new SuppCalendarPage(this.page, this.isMobile).pageLoaded()
        await this.setPublishStatus(user)

        return suppCalendarPage
    }

    private async setPublishStatus(user: IUser): Promise<void> {
        const packList = await this.packageController.getPackList(user)
        const service = packList.services.filter((el) => el.title === this.newServiceSettings.serviceName)[0]
        await this.packageController.setPackStatus(service.pk, "PUBLISHED")
    }
}
