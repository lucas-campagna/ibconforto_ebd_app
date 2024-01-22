const useSheets = (apiKey, userId)=>{
    apiKey = apiKey || localStorage.getItem('apiKey');
    userId = userId || localStorage.getItem('userId');
    if(!apiKey || !userId)
        return {}
    const url = `https://script.google.com/macros/s/${apiKey}/exec`
    const buildGet = name => (params={}) => fetch(buildUrl(url, {userId, action: {name, params}})).then(p=>p.json())
    const buildPost = name => (params={}) => fetch(url, {method: 'POST', mode:'cors', body: JSON.stringify({userId, action: {name, params}})}).then(p=>p.json())
    return Object.fromEntries([
        ...getRoutes.map(n => [n, buildGet(n)]),
        ...postRoutes.map(n => [n, buildPost(n)]),
    ])
}

const getRoutes = [
    'isValidUser',
    'getTeachers',
    'getDates',
    'getMyStudents',
    'getMyPresencesData',
    'getHistory',
    'checkIsValidDate',
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

export default useSheets;