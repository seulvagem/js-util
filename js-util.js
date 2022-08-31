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

const selectCore = (keyNames, obj) => {

    return keyNames.map((keyInput) => {
        const [key, nKey] = (typeof (keyInput) === "string") ? [keyInput, keyInput] : keyInput

        const keys = (typeof (key) === "string") ? [key] : key

        return [nKey, getIn(keys, obj)]
    })
}

const select = (keyNames, obj) => {
    const selectedEntries = selectCore(keyNames, obj)

    return Object.fromEntries(selectedEntries)
}

const selectFilter = (filterFn, ...args) => {
    return selectCore(...args).reduce((acc, [key, value]) => {
        return (filterFn(key, value)) ? assoc(acc, key, value) : acc
    }, {})
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
    return typeof(x) === "function"
}

const isString = (x) => {
    return typeof(x) === "string"
}

const isArray = (x) => {
    return Array.isArray(x)
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

const bind = (fn, ... args) => {
    return fn.bind(fn, ...args)
}

const isError = (x) => {
    return Object.prototype.toString.call(x) === "[object Error]";
}

// composes fns given as arguments into a single fn, executes right to left (last arg first)
var comp = (...fns) => {
    return (...args) => {
        const [firstFn, ...nextFns] = fns.reverse()

        return nextFns.reduce((acc, fn) => fn(acc), firstFn(...args))
    }
}

const is = (x) => x !== null && x !== undefined

const assocIf = (obj, key, val, ...keyVals) => {
    if (is(val)) {
        obj[key] = val
    }

    if (keyVals.length) {
        return assocIf(obj, ...keyVals)
    } else {
        return obj
    }
}

// allows you to do some action (presumably) with side effects, in a chain
const middlewareBypass = (fn) => {
    return (x) => {
        fn(x)
        return x
    }
}

// two arities, can be called with only the map (id will be the key), or can be called with key and map
const mapToArray = (keyOrMap, maybeMap) => {
    const [targetKey, map] = maybeMap ? [keyOrMap, maybeMap] : ["id", keyOrMap]

    return Object.entries(map).map(([key, val]) => {
        return assoc(val, targetKey, key)
    })
}

module.exports = {
    get, getIn, select, set, toString, explodeIterable, memoize, isFunction, isString, isArray, evolve, dissoc,
    assoc, partition, reMatch, bind, isError, selectCore, selectFilter, comp, is, assocIf, middlewareBypass, mapToArray
}
