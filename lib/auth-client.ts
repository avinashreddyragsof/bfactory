import { createAuthClient } from "better-auth/react"
import { phoneNumberClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: "https://bfactory.app",
    plugins: [
        phoneNumberClient()
    ]
})