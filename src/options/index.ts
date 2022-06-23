import { settingsKeys } from "../settings.js"

for (const select of document.querySelectorAll<HTMLSelectElement>("[data-range]")) {
    const [start, end] = select.dataset.range!.split(",").map(x => parseInt(x, 10))
    for (let i=start; i<=end; i++) {
        const option = document.createElement("option")
        option.innerText = i.toString()
        select.appendChild(option)
    }
}

(async () => {
    for (const inputter of document.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[data-optionskey],select[data-optionskey]")) {
        const key = inputter.dataset.optionskey!
        if (!settingsKeys.includes(key as any)) alert(`${key} isn't expected`)
        const value = (await browser.storage.sync.get(key))[key]
        if ("checked" in inputter) {
            inputter.checked = value as boolean
        } else {
            inputter.value = value as string
        }
        inputter.addEventListener("change", e => {
            const value = "checked" in inputter && inputter.type === "checkbox" ? inputter.checked : inputter.value
            browser.storage.sync.set({
                [key]: value,
            })
        })
    }    
})()
