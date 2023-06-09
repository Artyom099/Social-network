import {runDb} from "./db/db";
import express from "express";
import {applyAppSettings} from "./app";

const port = process.env.PORT || 3000
export const app = express()
applyAppSettings(app)

const startApp = async() => {
    await runDb()
    app.listen(port, () => {
        console.log(`Server running on: http://localhost:${port}`)
    })
}
startApp()