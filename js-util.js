export const get = (key, obj) => {
    return obj && obj[key]
}

export const getIn = ([key, ...nextKeys], obj) => {
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

export const selectCore = (keyNames, obj) => {

    return keyNames.map((keyInput) => {
        const [key, nKey] = (typeof (keyInput) === "string") ? [keyInput, keyInput] : keyInput

        const keys = (typeof (key) === "string") ? [key] : key

        return [nKey, getIn(keys, obj)]
    })
}

export const select = (keyNames, obj) => {
    const selectedEntries = selectCore(keyNames, obj)

    return Object.fromEntries(selectedEntries)
}

export const selectFilter = (filterFn, ...args) => {
    return selectCore(...args).reduce((acc, [key, value]) => {
        return (filterFn(key, value)) ? assoc(acc, key, value) : acc
    }, {})
}

export const set = (x) => new Set(x)

export const toString = (x) => x.toString()

export const explodeIterable = (a) => [...a]

export const memoize = (func, returnCache) => {
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

export const isFunction = (x) => {
    return typeof(x) === "function"
}

export const isString = (x) => {
    return typeof(x) === "string"
}

export const isArray = (x) => {
    return Array.isArray(x)
}

export const evolve = (evolveMap, obj) =>{
    const evolutions = Object.entries(evolveMap)

    return evolutions.reduce((obj, [key, mutation])=>{
        const val = obj[key]

        if(val !== undefined){
            obj[key] = isFunction(mutation) ? mutation(val) : evolve(mutation, val)
        }

        return obj
    }, obj)

}

export const dissoc = (obj, key, ...nextKeys) => {
    delete obj[key]
    if(nextKeys.length){
        return dissoc(obj, ...nextKeys)
    } else {
        return obj
    }
}

export const assoc = (obj, key, val, ...keyVals) => {
    obj[key] = val

    if (keyVals.length) {
        return assoc(obj, ...keyVals)
    } else {
        return obj
    }

}

export const partition = (batchSize, items) => {

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

export const reMatch = (re, s) => {
    return re.exec(s)?.[0]
}

export const bind = (fn, ... args) => {
    return fn.bind(fn, ...args)
}

export const isError = (x) => {
    return Object.prototype.toString.call(x) === "[object Error]";
}

// composes fns given as arguments into a single fn, executes right to left (last arg first)
export const comp = (...fns) => {
    return (...args) => {
        const [firstFn, ...nextFns] = fns.reverse()

        return nextFns.reduce((acc, fn) => fn(acc), firstFn(...args))
    }
}

export const is = (x) => x !== null && x !== undefined

export const assocIf = (obj, key, val, ...keyVals) => {
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
export const middlewareBypass = (fn) => {
    return (x) => {
        fn(x)
        return x
    }
}

// two arities, can be called with only the map (id will be the key), or can be called with key and map
export const mapToArray = (keyOrMap, maybeMap) => {
    const [targetKey, map] = maybeMap ? [keyOrMap, maybeMap] : ["id", keyOrMap]

    return Object.entries(map).map(([key, val]) => {
        return assoc(val, targetKey, key)
    })
}
