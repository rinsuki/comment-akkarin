export const settingsKeys = [
    "EASYCOMMENT_NORMAL_AKKARIN",
    "EASYCOMMENT_NORMAL_SMALL",
    "EASYCOMMENT_OOSUGI_SECONDS",
    "EASYCOMMENT_OOSUGI_COUNT",
    "EASYCOMMENT_OOSUGI_HIDE",
    "EASYCOMMENT_OOSUGI_AKKARIN",
    "EASYCOMMENT_OOSUGI_SMALL",
    "EASYCOMMENT_OOSUGI_PREFIX",
    "EASYCOMMENT_INCLUDES_DEVICE3DS",
] as const

type STORAGE_KEY = typeof settingsKeys[number]

export async function getSettings() {
    const settings: { [key in STORAGE_KEY]: browser.storage.StorageValue } = await browser.storage.sync.get([...settingsKeys])

    return {
        ...settings,
        include3DS: !!settings["EASYCOMMENT_INCLUDES_DEVICE3DS"],
        normal: {
            akkarin: !!settings["EASYCOMMENT_NORMAL_AKKARIN"],
            small: !!settings["EASYCOMMENT_NORMAL_SMALL"],
        },
        oosugi: {
            akkarin: !!settings["EASYCOMMENT_OOSUGI_AKKARIN"],
            small: !!settings["EASYCOMMENT_OOSUGI_SMALL"],
            prefix: !!settings["EASYCOMMENT_OOSUGI_PREFIX"],
            hide: !!settings["EASYCOMMENT_OOSUGI_HIDE"],
            conditions: {
                seconds: parseInt(settings["EASYCOMMENT_OOSUGI_SECONDS"] as string ?? "9999", 10),
                count: parseInt(settings["EASYCOMMENT_OOSUGI_COUNT"] as string ?? "9999", 10),
            }
        }
    }
}

export type SETTINGS = Awaited<ReturnType<typeof getSettings>>


const defaultSettings: {[key in STORAGE_KEY]?: browser.storage.StorageValue} = {
    "EASYCOMMENT_NORMAL_AKKARIN": true,
    "EASYCOMMENT_OOSUGI_AKKARIN": true,
    "EASYCOMMENT_OOSUGI_SMALL": true,
    "EASYCOMMENT_OOSUGI_PREFIX": true,
    "EASYCOMMENT_OOSUGI_SECONDS": 3,
    "EASYCOMMENT_OOSUGI_COUNT": 10,
}

browser.storage.sync.get(Object.keys(defaultSettings)).then(async value => {
    for (const key of Object.keys(defaultSettings) as STORAGE_KEY[]) {
        if (!(key in value)) {
            await browser.storage.sync.set({
                [key]: defaultSettings[key],
            })
        }
    }
})
