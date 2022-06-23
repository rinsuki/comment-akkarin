import { SETTINGS } from "../../settings";

// フィルタに必要なパラメータしか書いてないので他の目的への流用は非推奨
export type V1Comment = {
    vposMs: number,
    commands: string[],
    userId: string,
    score: number,
    no: number,
    body: string,
}

export function doItForV1ServerJSON(settings: SETTINGS, str: string) {
    const obj = JSON.parse(str)
    if (obj.data == null || obj.data.threads == null) {
        return str
    }
    const threads: {
        id: string,
        fork: string,
        comments: V1Comment[]
    }[] = obj.data.threads

    const kantanCommentDic: {[key: string]: number[]} = {}

    for (const thread of threads) {
        const isEasyThread = thread.fork === "easy"
        for (const comment of thread.comments) {
            if (!isEasyThread) {
                let shouldTreatAsEasyComment = false
                if (settings.include3DS && comment.commands.includes("device:3DS")) {
                    shouldTreatAsEasyComment = true
                }
                if (!shouldTreatAsEasyComment) continue
            }

            if (settings.normal.akkarin) comment.commands.unshift("_live")
            if (settings.normal.small) comment.commands.unshift("small")

            if (kantanCommentDic[comment.userId] == null) kantanCommentDic[comment.userId] = []
            kantanCommentDic[comment.userId].push(comment.vposMs / 1000)
        }
    }
    
    const ngUserIds = new Set<string>()
    const CNT = settings.oosugi.conditions.count, SEC = settings.oosugi.conditions.seconds
    for (const [userID, timestamps] of Object.entries(kantanCommentDic)) {
        const timestampsSorted = timestamps.sort((a, b) => a-b)
        
        for (let i=CNT; i<timestampsSorted.length; i++) {
            const diff = timestampsSorted[i] - timestampsSorted[i-CNT]
            if (diff < SEC) {
                console.log("diff", diff)
                ngUserIds.add(userID)
                break
            }
        }
    }


    for (const thread of threads) {
        const deleteComments = new Set<number>()
        for (const comment of thread.comments) {
            if (!ngUserIds.has(comment.userId)) continue
            if (settings.oosugi.akkarin) comment.commands.push("_live")
            if (settings.oosugi.small) comment.commands.push("small")
            if (settings.oosugi.prefix) {
                comment.body = "[かんコメ多すぎ] " + comment.body
            }
            if (settings.oosugi.hide) deleteComments.add(comment.no)
        }
        thread.comments = thread.comments.filter(c => !deleteComments.has(c.no))
    }

    return obj
}