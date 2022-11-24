const second = 1000
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour


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

// use constantly(true) for default
const condp = (ref, pred, resfn, ...nextClauses) => {
    return pred(ref) ? resfn(ref)
        : nextClauses.length ? condp(ref, ...nextClauses) : undefined
}

const identity = (x) => x

const evolveWrapArray = ([evolutionMap]) => {
    const evolutions = prepEvolve(evolutionMap)
    return (x) => {
        return x.map(bind(evolvePrepd, evolutions))
    }
}

const evolveWrapObj = (evolutionMap) => {
    const evolutions = prepEvolve(evolutionMap)
    return (x) => {
        return evolvePrepd(evolutions, x)
    }
}

const evolveWrapMap = (map) => {
    const [_, evolutionMap] = map.entries().next().value
    const evolutions = prepEvolve(evolutionMap)

    return (x) => {
        const entries = Object.entries(x)
        const evolvedEntries = entries.map(u.bind(evolvePrepd, evolutions))
        return Object.fromEntries(evolvedEntries)
    }
}

const isMap = (x) => (x instanceof Map)

const prepEvolve = (evolveMap) => {
    const evolutions = Object.entries(evolveMap)

    return evolutions.map(([key, mutation]) => {

        const evolution = condp(mutation,
                                isFunction, identity,
                                isArray, evolveWrapArray,
                                isMap, evolveWrapMap,
                                constantly(true), evolveWrapObj)

        return [key, evolution]
    })
}

const evolvePrepd = (evolutions, obj) => {

    return evolutions.reduce((obj, [key, evolution])=>{
        const val = obj[key]

        if(val !== undefined){
            obj[key] = evolution(val)
        }

        return obj
    }, obj)
}

const evolve = (evolveMap, obj) =>{
    const evolutions = prepEvolve(evolveMap)

    return evolvePrepd(evolutions, obj)
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

const reGroups = (re, s) => {
    return re.exec(s)?.slice?.(1)
}

const reGroup = (re, s) => {
    return re.exec(s)?.[1]
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

// by MGomes-Dev
const arrayToMap = (key, funcOrArray, maybeArray) => {
    const [arr, func] = maybeArray ? [maybeArray, funcOrArray] : [funcOrArray]
    return arr.reduce((map, item) => {
        return func ?
            assoc(map, item[key], func(item)) :
            assoc(map, item[key], item);
    }, {});
};

// returns another obj with only the 'keys' from 'source'. A key may be
// a string or a tuple: [key, keysArray], enabling deep obj support, also
// in this case, it will map the projection if the source value is an array
const project = (keys, source) => {
    return source && keys.reduce((acc, key) => {

        if (isString(key)) {
            return assocIf(acc, key, get(key, source))
        } else {
            const projectNext = bind(project, key[1])
            const sourceValue = get(key[0], source)

            const value = isArray(sourceValue)
                  ? sourceValue.map(projectNext)
                  : projectNext(sourceValue)

            return assocIf(acc, key[0], value)
        }

    }, {})
}

// returns a promise that resolves with the 'val' after 'ms' milliseconds
const timeout = (ms, val = "TIMEOUT") => {
    return new Promise((res) => {
        setTimeout(res, ms, val)
    })
}

// returns an array from 'start' inclusive to 'end' exclusive in increments of 'step'
const range = (endOrStart, maybeEnd, step = 1) => {
    const [start, end] = maybeEnd ? [endOrStart, maybeEnd] : [0, endOrStart]

    var arr = []
    for (var n = start; n < end; n += step) {
        arr.push(n)
    }

    return arr
}

// splits the array in 2 at the given index, nth item will be on the left array
const arrSplit = (arr, n) => {
    return [arr.slice(0, n), arr.slice(n)]
}

const constantly = (x) => () => x

// returns n bound by min and max, works with most js types, min and max can also
// be undefined leaving that side unbounded
const bound = (min, n, max) => {
    return (min > n) ? min
        : (max < n) ? max
        : n
}

const update = (obj, key, fn, ...args) => {
    obj[key] = fn(obj[key], ...args)
    return obj
}

const append = (arr, x) => {
    arr.push(x)
    return arr
}

module.exports = {
    get, getIn, select, set, toString, explodeIterable, memoize, isFunction,
    isString, isArray, evolve, dissoc, assoc, partition, reMatch, bind, isError,
    selectCore, selectFilter, comp, is, assocIf, middlewareBypass, mapToArray,
    arrayToMap, project, timeout, range, arrSplit, second, minute, hour, day,
    reGroup, reGroups, constantly, bound, prepEvolve, evolvePrepd, update, append,
}
