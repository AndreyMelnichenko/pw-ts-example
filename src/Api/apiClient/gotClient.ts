// tslint:disable: no-any
import got, { Headers, Method, Options } from "got"
import { URL } from "url"

export class GotRequestClient {
    protected apiUrl: string | URL = "NO_URL_DEFINED"
    protected options: Options = {
        https: {
            rejectUnauthorized: false,
        },
        retry: {
            limit: 3,
            methods: ["GET"],
            statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
        },
        throwHttpErrors: false,
        timeout: {
            response: 3000,
        },
    }

    followRedirect(followRedirect = true): this {
        if (!followRedirect) {
            this.options = {...this.options, followRedirect: false }
        }

        return this
    }

    url(url: string | URL): this {
        this.apiUrl = url

        return this
    }

    method(method: Method): this {
        this.options = {
            ...this.options,
            method,
        }

        return this
    }

    searchParams(searchParams?: Options["searchParams"]): this {
        this.options = {
            ...this.options,
            searchParams,
        }

        return this
    }

    headers(headers?: Headers): this {
        this.options = {
            ...this.options,
            headers,
        }

        return this
    }

    body(body: string): this {
        this.options = {
            ...this.options,
            body,
        }

        return this
    }

    async send(): Promise<any> {
        return got(this.apiUrl, {
            ...this.options,
            hooks: {
                afterResponse: [
                    (response) => {
                        // console.log(`RESPONSE CODE ${response.statusCode}`)
                        // console.log(`RESPONSE HEADERS ${JSON.stringify(response.headers, undefined, 2)}`)
                        if (response.body) {
                            const body: string = response.body as string
                // console.log(`RESPONSE BODY: \n${JSON.stringify(body.replace(/[\n\r\t\\"]/g, ""), undefined, 2)}`)
                        } else {
                        // console.log(response)
                        }

                        return response
                    },
                ],
                beforeRequest: [
                    (options) => {
                        if (!options.headers["user-agent"]) options.headers["user-agent"] = "Automation tests"
                        // console.log(`REQUEST URL: ${options.method} ${String(options.url)}`)
                        // console.log(`REQUEST HEADERS: \n${JSON.stringify(options.headers, undefined, 2)}`)
                        if (options.body) {
                            // console.log(`REQUEST BODY: \n${String(options.body)}`)
                        } else {
                        // console.log("{}")
                        }
                    },
                ],
            },
        })
    }
}
