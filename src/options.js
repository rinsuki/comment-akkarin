(async () => {
    for (const select of document.querySelectorAll("[data-range]")) {
        const [start, end] = select.dataset.range.split(",").map(x => parseInt(x, 10))
        for (let i=start; i<=end; i++) {
            const option = document.createElement("option")
            option.innerText = i
            select.appendChild(option)
        }
    }
    
    for (const inputter of document.querySelectorAll("[data-optionskey]")) {
        /** @type {string} */
        const key = inputter.dataset.optionskey
        const value = (await browser.storage.sync.get(key))[key]
        if (inputter.checked != null) {
            inputter.checked = value
        } else {
            inputter.value = value
        }
        inputter.addEventListener("change", e => {
            const value = e.currentTarget.checked ?? e.currentTarget.value
            browser.storage.sync.set({
                [key]: value,
            })
        })
    }    
})()
