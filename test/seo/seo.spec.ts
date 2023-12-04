import { expect, test } from "@playwright/test"
import { Response } from "got"
import _ from "lodash"
import * as seoList from "../../seoList.json"
import { GotRequestClient } from "../../src/Api/apiClient/gotClient"
import { SeoCehcksModel } from "../../src/models/seoChecksModel"
import { isContainScript, isMetaDescription, isTitle } from "../../src/utils/seoHelper"

const seoPageList: Array<SeoCehcksModel> = []
const errorArray: Array<{ check: string, messageError: string }> = []
seoList.testomato.forEach((el) => seoPageList.push(el as SeoCehcksModel))

for (const page of seoPageList) {
    test(`Check ${page.url} @C64 @seo `, async () => {
        const gotClient = new GotRequestClient()
        const resp = await gotClient
            .method("GET")
            .url(`${page.url || "NO_BASE_URL"}`)
            .followRedirect(page.responseCode !== 200)
            .send() as Response
        if (page.responseCode === 200) {
            await test.step("Cehck response code", async() => {
                await errorHandler(resp.statusCode === page.responseCode, "Cehck response code",
                    `Acrual respCode ${resp.statusCode} !== ${page.responseCode}`)
            })
        }
        if (page.responseCode === 301) {
            await test.step("Cehck redirect", async() => {
                await errorHandler(resp.redirectUrls.includes(page.redirect), "Cehck redirect",
                    `Redirect ot  ${page.redirect} not works`)
            })
        }
        if (page.htmlContains) {
            await test.step("Cehck HTML source", async() => {
                page.htmlContains.forEach(async (str) =>
                    errorHandler(String(resp.body).includes(str), "Cehck HTML source",
                        `HTML source not contain ${str}`))

                return 1
            })
        }
        if (page.title) {
            await test.step("Cehck TITLE", async() => {
                await errorHandler(isTitle(String(resp.body), page.title), "Cehck TITLE",
                    `Title not contains ${page.title}`)
            })
        }
        if (page.description) {
            await test.step("Cehck DESCRIPTION", async () => {
                await errorHandler(isMetaDescription(String(resp.body), page.description), "Cehck DESCRIPTION",
                    `Description not contains ${page.description}`)
            })
        }
        if (page.schema) {
            await test.step("Cehck page schema", async () => {
                page.schema.forEach(async (el) =>
                    errorHandler(isContainScript(String(resp.body), el), "Cehck page schema",
                        `Page body not contains: ${el}`))

                return 1
            })
        }

        expect(errorArray.length, errorArray.map((e) => `\n${e.messageError}`).join(";")).toEqual(0)
    })
}

const errorHandler = async (result: boolean, check: string, messageError: string): Promise<void> => {
    await new Promise((resolve) => {_.delay(() => resolve("Done"), 1)})
    try {
        expect(result).toBeTruthy()
    } catch (error) {
        errorArray.push({ check, messageError })
    }
}
