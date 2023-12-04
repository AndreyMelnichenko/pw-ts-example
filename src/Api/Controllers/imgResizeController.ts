// tslint:disable: no-unsafe-any
import { Locator, Page } from "@playwright/test"
import { ImageProps } from "../../models/imageProps"

export class ImgResizeController {
    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    getImgSize = async (imgNode: Locator): Promise<ImageProps> => {
        return {
            height: Number(await this.getImgProp(imgNode, "height")),
            width: Number(await this.getImgProp(imgNode, "width")),
        }
    }

    getImageSize = async (imgNode: Locator): Promise<ImageProps> => {
        return {
            height: Number(await this.getImgProp(imgNode, "clientHeight")),
            width: Number(await this.getImgProp(imgNode, "clientWidth")),
        }
    }

    getImgNaturalSize = async (imgNode: Locator): Promise<ImageProps> => {
        return {
                    height: Number(await this.getImgProp(imgNode, "naturalHeight")),
                    width: Number(await this.getImgProp(imgNode, "naturalWidth")),
                }
    }

    getImgProp = async (imgNode: Locator, prop: string): Promise<string> => {
        return imgNode.first().evaluate((e, p) => e[p], prop)
    }

    getResizedImgLink = async (imgNode: Locator): Promise<string> => {
        const style = await imgNode.first().getAttribute("style")
        const styleProps = style?.split(";").map((el) => el.trim())
        const row = styleProps?.find((el) => el.includes("poptop.uk.com"))
        const regexp = /.*(http.*\.[gif|jpe?g|tiff?|png|webp|bmp].*)\).*/gm
        const parsedStr = regexp.exec(row?.replace(new RegExp("\"", "gm"), "") || "UNDEFINED LINK STRING")

        return parsedStr[1] || "UNDEFINED LINK STRING"
    }
}
