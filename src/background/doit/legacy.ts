import { SETTINGS } from "../../settings"

export function doItForLegacyServerJSON(settings: SETTINGS, str: string) {
    const obj = JSON.parse(str)
    const kantanCommentDic: {[key: string]: number[]} = {}
    const res = obj.map((k: any) => {
        if (!("chat" in k)) return k
        if (k.chat.fork === 2 || (settings.include3DS && k.chat.mail != null && k.chat.mail.includes("device:3DS"))) {
            if (settings.normal.akkarin) k.chat.mail += " _live"
            if (settings.normal.small) k.chat.mail += " small"
            if (kantanCommentDic[k.chat.user_id] == null) kantanCommentDic[k.chat.user_id] = []
            kantanCommentDic[k.chat.user_id].push(k.chat.vpos / 100)
        }
        return k
    })
    const ngUserIds = []
    const CNT = settings.oosugi.conditions.count, SEC = settings.oosugi.conditions.seconds
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
            if (settings.oosugi.akkarin) chat.mail += " _live"
            if (settings.oosugi.small) chat.mail += " small"
            if (settings.oosugi.prefix) chat.content = "[かんコメ多すぎ] " + chat.content
            if (settings.oosugi.hide) delete chat.content
        }
    }

    console.log("ng user", ngUserIds)
    console.log(res)

    return res
}