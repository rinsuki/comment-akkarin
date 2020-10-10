// @ts-check
browser.webRequest.onBeforeRequest.addListener(
    details => {
        if (details.method !== "POST") return
        const filter = browser.webRequest.filterResponseData(details.requestId)
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let str = ""
        filter.ondata = e => {
            str += decoder.decode(e.data)
        }
        filter.onstop = async () => {
            const settings = await browser.storage.sync.get([
                "EASYCOMMENT_NORMAL_AKKARIN",
                "EASYCOMMENT_NORMAL_SMALL",
                "EASYCOMMENT_OOSUGI_SECONDS",
                "EASYCOMMENT_OOSUGI_COUNT",
                "EASYCOMMENT_OOSUGI_HIDE",
                "EASYCOMMENT_OOSUGI_AKKARIN",
                "EASYCOMMENT_OOSUGI_SMALL",
                "EASYCOMMENT_OOSUGI_PREFIX",
            ])
            str += decoder.decode()
            const obj = JSON.parse(str)
            /** @type {{[key: string]: number[]}} */
            const kantanCommentDic = {}
            const res = obj.map((/** @type {any} */k) => {
                if (!("chat" in k)) return k
                if (k.chat.fork === 2) {
                    if (settings["EASYCOMMENT_NORMAL_AKKARIN"]) k.chat.mail += " _live"
                    if (settings["EASYCOMMENT_NORMAL_SMALL"]) k.chat.mail += " small"
                    if (kantanCommentDic[k.chat.user_id] == null) kantanCommentDic[k.chat.user_id] = []
                    kantanCommentDic[k.chat.user_id].push(k.chat.vpos)
                }
                return k
            })
            const ngUserIds = []
            const CNT = parseInt(settings["EASYCOMMENT_OOSUGI_COUNT"] ?? "9999", 10), SEC=parseInt(settings["EASYCOMMENT_OOSUGI_SECONDS"] ?? "9999", 10) * 1000
            for (const [userID, timestamps] of Object.entries(kantanCommentDic)) {
                const timestampsSorted = timestamps.sort((a, b) => a-b)
                
                for (let i=CNT; i<timestampsSorted.length; i++) {
                    const diff = timestampsSorted[i] - timestampsSorted[i-CNT]
                    if (diff < SEC) {
                        console.log("diff", diff)
                        ngUserIds.push(userID)
                        break
                    }
                }
            }
            for (const {chat} of res) {
                if (chat != null && ngUserIds.includes(chat.user_id)) {
                    if (chat.content == null) continue
                    if (settings["EASYCOMMENT_OOSUGI_AKKARIN"]) chat.mail += " _live"
                    if (settings["EASYCOMMENT_OOSUGI_SMALL"]) chat.mail += " small"
                    if (settings["EASYCOMMENT_OOSUGI_PREFIX"]) chat.content = "[かんコメ多すぎ] " + chat.content
                    if (settings["EASYCOMMENT_OOSUGI_HIDE"]) delete chat.content
                }
            }
            console.log("ng user", ngUserIds)
            // console.log(res)
            filter.write(encoder.encode(JSON.stringify(res)))
            filter.disconnect()
        }

        return {}
    },
    {urls: ["https://nmsg.nicovideo.jp/api.json/"], types: ["xmlhttprequest"]},
    ["blocking"]
)

/** @type {{[key: string]: any}} */
const defaultSettings = {
    "EASYCOMMENT_NORMAL_AKKARIN": true,
    "EASYCOMMENT_OOSUGI_AKKARIN": true,
    "EASYCOMMENT_OOSUGI_SMALL": true,
    "EASYCOMMENT_OOSUGI_PREFIX": true,
    "EASYCOMMENT_OOSUGI_SECONDS": 3,
    "EASYCOMMENT_OOSUGI_COUNT": 5,
}

browser.storage.sync.get(Object.keys(defaultSettings)).then(async value => {
    for (const key of Object.keys(defaultSettings)) {
        if (!(key in value)) {
            await browser.storage.sync.set({
                [key]: defaultSettings[key],
            })
        }
    }
})

for (const [key, value] of Object.entries(defaultSettings)) {
    
}