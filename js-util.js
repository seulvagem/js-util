const get = (key, obj) => {
    return obj && obj[key]
}

const getIn = ([key, ...nextKeys], obj) => {
    if (obj === undefined) {
        return undefined
    }

    const value = get(key, obj)
    if (nextKeys.length) {
        return getIn(nextKeys, value)
    } else {
        return value
    }
}

const select = (keyNames, obj) => {

    const selectedEntries = keyNames.map((keyInput) => {
        const [key, nKey] = (typeof (keyInput) === "string") ? [keyInput, keyInput] : keyInput

        const keys = (typeof (key) === "string") ? [key] : key

        return [nKey, getIn(keys, obj)]
    })

    return Object.fromEntries(selectedEntries)
}

const set = (x) => new Set(x)

module.exports = {
    get, getIn, select, set
}