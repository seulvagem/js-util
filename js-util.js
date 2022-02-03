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

const toString = (x) => x.toString()

const explodeIterable = (a) => [...a]

const memoize = (func, returnCache) => {
    // [args, result]
    const cache = new Map()
    const memodFn = (...args) => {

        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)
        } else {
            try {
                const newResult = func(...args);
                cache.set(key, newResult)
                return newResult
            } catch (err) {
                console.error(err)
            }
        }
    }

    return (returnCache) ? [memodFn, cache] : memodFn
}

const isFunction = (x) => {
    return !!(x && x.constructor && x.call && x.apply);
}

const evolve = (evolveMap, obj) =>{
    const evolutions = Object.entries(evolveMap)

    return evolutions.reduce((obj, [key, mutation])=>{
        const val = obj[key]

        if(val !== undefined){
            obj[key] = isFunction(mutation) ? mutation(val) : evolve(mutation, val)
        }

        return obj
    }, obj)
}

const dissoc = (obj, key, ...nextKeys) => {
    delete obj[key]
    if(nextKeys.length){
        return dissoc(obj, ...nextKeys)
    } else {
        return obj
    }
}

const assoc = (obj, key, val, ...keyVals) => {
    obj[key] = val

    if (keyVals.length) {
        return assoc(obj, ...keyVals)
    } else {
        return obj
    }

}

const partition = (batchSize, items) => {
    
    let batch = []

    let batches = []
    for(var i = 0, l = items.length; i < l;){

        const item = items[i]
        i += 1

        batch.push(item)

        if (i % batchSize === 0) {
            batches.push(batch)
            batch = []
        }
    }

    if (batch.length){
        batches.push(batch)
    }

    return batches
}

const reMatch = (re, s) => {
    return re.exec(s)?.[0]
}

module.exports = {
    get, getIn, select, set, toString, explodeIterable, memoize, isFunction, evolve, dissoc,
    assoc, partition, reMatch
}

