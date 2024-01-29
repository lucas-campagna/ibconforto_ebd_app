const useSheets = (apiKey, userId)=>{
    if(apiKey || userId){
        if(apiKey) localStorage.setItem('apiKey', apiKey)
        if(userId) localStorage.setItem('userId', userId)
        const sheets = useSheets()
        if(!sheets) return null
        return sheets.isValidUser()
            .then(({message, status})=>status && message ? sheets : null)
            .catch(e=>{console.log('error on isValidUser');return null})
    }else{
        apiKey = localStorage.getItem('apiKey');
        userId = localStorage.getItem('userId');
    }
    if(!apiKey || !userId)
        return null
    const url = getURL(apiKey)
    const buildGet = name => (params={}) => fetchCached(buildUrl(url, {userId, action: {name, params}}))
    const buildPost = name => (params={}) => fetchCached(url, {method: 'POST', mode:'cors', body: JSON.stringify({userId, action: {name, params}})}).then(r=>{invalidateCache();return r})
    return {
        ...Object.fromEntries([
            ...getRoutes.map(n => [n, buildGet(n)]),
            ...postRoutes.map(n => [n, buildPost(n)]),
        ]),
        apiKey,
        userId,
    }
}

const getURL = apiKey=>`https://script.google.com/macros/s/${apiKey}/exec`

const getRoutes = [
    'isValidUser',
    'getDates',
    'getMyStudents',
    'getMyPresencesData',
    'getHistory',
    'checkIsValidDate',
    'getUserInfo',
]

const postRoutes = [
    'setHistory',
]

function buildUrl(url, params){
    return `${url}?${(new URLSearchParams(joinObject(params)).toString())}`
}

function joinObject(obj, parentKey = '') {
    let result = {};
    for (let key in obj) {
        let currentKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            let nested = joinObject(obj[key], currentKey);
            result = { ...result, ...nested };
        } else {
            result[currentKey] = obj[key];
        }
    }
    return result;
}

// var cache = {}
// const invalidateCache = ()=>cache={}
const invalidateCache = ()=>localStorage.setItem('cache','{}')
// invalidateCache()

const fetchCached = async (url, args)=>{
    const key = url + JSON.stringify(args)
    let cache = JSON.parse(localStorage.getItem('cache') || '{}')
    if(key in cache){
        return cache[key]
    }
    try{
        const response = await fetch(url, args).then(p=>p.json())
        cache[key] = Object.assign({}, response)
        localStorage.setItem('cache',JSON.stringify(cache))
        return response;
    } catch(err){
        localStorage.clear()
        return false
    }
}

export default useSheets;