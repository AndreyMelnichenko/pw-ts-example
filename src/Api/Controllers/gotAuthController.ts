// tslint:disable: no-unsafe-any
import { Headers, Response } from "got"
import { IUser } from "../../models/user"
import { GotRequestClient } from "../apiClient/gotClient"

export class GotAuthController {
    // url = "https://api.stage.gigmngr.com/v1/graphql"
    url = `https://api${process.env.BASE_URL?.split("//www")[1]}/v1/graphql`
    private readonly gotClient = new GotRequestClient()
    private Cookies: Array<string> | undefined
    private headers: Headers

    async checkEmail(user: IUser): Promise<void> {
        const reqBody: string = JSON.stringify({
            query: `
                query emailCheck($email: String!) {
                checkMail(email: $email)
                }`,
            variables: {
                    email: user.email,
            },
        })
        const resp = await this.gotClient
            .method("POST")
            .url(this.url)
            .body(reqBody)
            .send() as Response
        const body = JSON.parse(resp.body).data as { checkMail: boolean }
        if (body.checkMail) {
            this.Cookies = resp.headers["set-cookie"]
            this.headers = { Cookie: this.Cookies }
        } else {
            throw new Error("Email verivifaction filed")
        }
    }

    async loginAs(user: IUser): Promise<Headers> {
        await this.checkEmail(user)
        const reqBody: string = JSON.stringify({
            query: `
                mutation loginOrSignup($email: String!, $password: String!, $fullName: String, $phoneNumber: String, $marketingMessagingAgreement: Boolean) {
                clientAuthenticate(
                    email: $email
                    name: $fullName
                    password: $password
                    phone: $phoneNumber
                    receiveNewsletters: $marketingMessagingAgreement
                    ) {
                        errors
                    }
                }`,
            variables: {
                    email: user.email,
                    password: user.password,
            },
        })
        const resp = await this.gotClient
            .method("POST")
            .url(this.url)
            .headers(this.headers)
            .body(reqBody)
            .send() as Response
        const body = JSON.parse(resp.body).data.clientAuthenticate as { errors: boolean }
        if (String(body.errors) === "null") {
            this.Cookies = resp.headers["set-cookie"]
            this.headers = { Cookie: this.Cookies }
        } else {
            throw new Error("Login verivifaction filed")
        }

        return { Cookie: this.Cookies }
    }
}
