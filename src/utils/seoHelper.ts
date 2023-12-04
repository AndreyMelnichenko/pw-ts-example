import { parse } from "node-html-parser"

export const isTitle = (page: string, expPageTitle: string): boolean => {
    const html = parse(page)
    const actTitle = html.querySelector("title")?.innerText
    // const regexp = new RegExp(expPageTitle, "gm")

    return actTitle === expPageTitle
}

export const isMetaDescription = (page: string, expMetaContent: string): boolean => {
    const html = parse(page)

    return html.querySelector("meta[name='description']")?.getAttribute("content") === expMetaContent
}

export const isContainScript = (page: string, expScript: string): boolean => {
    const htmlStr = page.replace(/(\r?\n|\n|\r|\s+)/gm, "")

    return htmlStr.includes(expScript)
}
