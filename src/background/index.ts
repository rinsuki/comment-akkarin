import { getSettings } from "../settings"
import { doItForLegacyServerJSON } from "./doit/legacy"
import { doItForV1ServerJSON } from "./doit/v1"

function textReader(replacer: (str: string) => Promise<string>) {
    return (details: { method: string, requestId: string }) => {
        if (details.method !== "POST") return
        const filter = browser.webRequest.filterResponseData(details.requestId)
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let str = ""
        filter.ondata = e => {
            str += decoder.decode(e.data, {stream: true})
        }
        filter.onstop = async () => {
            str += decoder.decode()
            const replaced = await replacer(str)
            filter.write(encoder.encode(replaced))
            filter.disconnect()
        }
        return {}
    }
}

browser.webRequest.onBeforeRequest.addListener(
    textReader(async str => {
        const settings = await getSettings()
        return JSON.stringify(doItForLegacyServerJSON(settings, str))
    }),
    {urls: [
        "https://nmsg.nicovideo.jp/api.json/",
        "https://nmsg.nicovideo.jp/api.json",
        "https://nvcomment.nicovideo.jp/legacy/api.json/",
        "https://nvcomment.nicovideo.jp/legacy/api.json",
    ], types: ["xmlhttprequest"]},
    ["blocking"]
)

browser.webRequest.onBeforeRequest.addListener(
    textReader(async str => {
        const settings = await getSettings()
        return JSON.stringify(doItForV1ServerJSON(settings, str))
    }),
    {urls: [
        "https://nvcomment.nicovideo.jp/v1/threads",
    ], types: ["xmlhttprequest"]},
    ["blocking"]
)

