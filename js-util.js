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

const selectIs = (...args) => {
    return selectFilter(identity, ...args)
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
    const prepdEvolve = prepEvolve(evolutionMap)
    return (x) => {
        return x.map(prepdEvolve)
    }
}

const evolveWrapObj = (evolutionMap) => {
    return prepEvolve(evolutionMap)
}

const evolveWrapMap = (map) => {
    const [_, evolutionMap] = map.entries().next().value
    const prepdEvolve = prepEvolve(evolutionMap)

    return (x) => {
        const entries = Object.entries(x)
        const evolvedEntries = entries.map(prepdEvolve)
        return Object.fromEntries(evolvedEntries)
    }
}

const isMap = (x) => (x instanceof Map)

const prepEvolve = (evolveMap) => {
    const evolutions = Object.entries(evolveMap)

    const prepdEvolutions = evolutions.map(([key, mutation]) => {

        const evolution = condp(mutation,
                                isFunction, identity,
                                isArray, evolveWrapArray,
                                isMap, evolveWrapMap,
                                constantly(true), evolveWrapObj)

        return [key, evolution]
    })

    return bind(evolvePrepd, prepdEvolutions)
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
    const prepdEvolve = prepEvolve(evolveMap)

    return prepdEvolve(obj)
}

const dissoc = (obj, key, ...nextKeys) => {
    delete obj[key]
    if(nextKeys.length){
        return dissoc(obj, ...nextKeys)
    } else {
        return obj
    }
}

const assoc = (obj = {}, key, val, ...keyVals) => {
    obj[key] = val

    if (keyVals.length) {
        return assoc(obj, ...keyVals)
    } else {
        return obj
    }

}

const assocIn = (map, [key, ...keys], value) => {
	const val = keys.length ? this.assocIn(this.get(key, map), keys, value) : value
	
	return this.assoc(map, key, val)
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
    return get(0, re.exec(s))
}

const reGroups = (re, s) => {
	const match = re.exec(s)
	
	if (match) {
		return match.slice(1)
	}
}

const reGroup = (re, s) => {
    return get(1, re.exec(s))
}

const bind = (fn, ... args) => {
    return fn.bind(fn, ...args)
}

const isError = (x) => {
    return Object.prototype.toString.call(x) === "[object Error]";
}

// composes fns given as arguments into a single fn, executes right to left (last arg first)
var comp = (...fns) => {
	const [firstFn, ...nextFns] = fns.slice().reverse()
    return (...args) => {

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

const append = (maybeArr = [], x) => {
    const arr = wrapArray(maybeArr)
    arr.push(x)
    return arr
}

const wrap = (wrapping, filling) => "" + wrapping + filling + wrapping

const appendToKey = (maybeArr, record) => {
    return ((maybeArr)
            ? append(maybeArr, record)
            : [record])
}

const groupBy = (getKey, arr) => {
    return arr.reduce((acc, x) => {
        const key = getKey(x)

        return update(acc, key, appendToKey, x)
    }, {})
}

const objMapEntries = (fn, obj) => {
    return Object.fromEntries(
        Object.entries(obj).map(fn)
    )
}

const objMapVals = (fn, obj) => objMapEntries(x => [x[0], fn(x)], obj)

const objMapKeys = (fn, obj) => objMapEntries(x => [fn(x), x[1]], obj)

const wrapArray = (...x) => [].concat(...x)

        
const _singletonCallsCache = new Map()

// function designed to provide some kind of 'batch' window before executions,
// only the last call for each key will be executed, with delay being the time window
// returns a fn that cancels the execution manually
const singletonCall = (key, delay, fn) => {
	const previousTimeout = _singletonCallsCache.get(key)
	
	clearTimeout(previousTimeout)
	const timeoutKey = setTimeout(fn, delay + 100)
	_singletonCallsCache.set(key, timeoutKey)
	
	return () => clearTimeout(timeoutKey)
}

const call = (fn, args = [], context = this) => {
	return fn && Reflect.apply(fn, context, args)
}

const capitalize = (x, firstOnly) => {
	const regex = firstOnly ? /\b\w/ : /\b\w/g
	
	return x && x.replace(regex, l => l.toUpperCase())
}

const voidFn = () => {}

// WILL mutate
const unproject = (unkeys, source) => {
    
    return source && unkeys.reduce((acc, key) => {

        if (isString(key)) {
            return dissoc(acc, key)
        } else {
            const unprojectNext = bind(unproject, key[1])
            const sourceValue = get(key[0], acc)

            const value = isArray(sourceValue)
                  ? sourceValue.map(unprojectNext)
                  : unprojectNext(sourceValue)

            return assocIf(acc, key[0], value)
        }

    }, source)
}


module.exports = {
    get, getIn, select, set, toString, explodeIterable, memoize, isFunction,
    isString, isArray, evolve, dissoc, assoc, partition, reMatch, bind, isError,
    selectCore, selectFilter, comp, is, assocIf, middlewareBypass, mapToArray,
    arrayToMap, project, timeout, range, arrSplit, second, minute, hour, day,
    reGroup, reGroups, constantly, bound, prepEvolve, update, append,
    wrap, groupBy, objMapKeys, objMapVals, objMapEntries, identity, wrapArray,
    singletonCall, assocIn, call, capitalize, voidFn, unproject, selectIs,
}
