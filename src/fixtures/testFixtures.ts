import { test as base } from "@playwright/test"

export const test = base.extend({
    browser: async ({ browser }, use) => {
        await use(browser)
    },
})
