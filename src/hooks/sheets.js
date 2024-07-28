function useSheets(apiKey, userId) {
    if (apiKey && userId) {
        logout();
        storage.set('apiKey', apiKey)
        const userIds = storage.get('userIds') || [userId];
        if (!userIds.includes(userId)) {
            userIds.push(userId)
        }    
        storage.set('userIds', userIds)
        storage.set('userId', userId)
        return useSheets()
    }
    apiKey = storage.get('apiKey');
    userId = storage.get('userId');
    if (!apiKey || !userId) {
        return
    }
    const url = getURL(apiKey)
    const buildGet = (key, {action, actions}) =>
        fetchCached(key, url, {userId, action, actions})
    const buildPost = async (key, {action, actions}) =>{
        invalidate(key);
        const response = await fetchCached(key, url, {userId, action, actions})
        invalidate(key);
        return response;
    }
    const buildTable = function (name, hasGet, hasAdd, hasRm) {
        let ret = {}
        ret.invalidate = () => invalidate(name)
        const buildObject = content => {
            const obj = {};
            obj[name] = content;
            return obj;
        }
        if (hasGet) {
            ret.get = () => buildGet(name, {action: buildObject({get: {}})})
        }
        if (hasAdd) {
            ret.add = props => buildPost(name, {action: buildObject({add: props})})
            ret.adds = listOfProps => buildPost(name, {actions: listOfProps.map( props => buildObject({add: props}))})
        }
        if (hasRm) {
            ret.rm = props => buildPost(name, {action: buildObject({rm: props})})
            ret.rms = listOfProps => buildPost(name, {actions: listOfProps.map( props => buildObject({rm: props}))})
        }
        ret.error = () => storage.error.get(name)
        return ret
    }
    const fetchAllKeys = ['attendance', 'student', 'teacher']
    return {
        apiKey: () => storage.get('apiKey'),
        userId: () => storage.get('userId'),
        attendance: buildTable('attendance', true, true, true),
        requisition: buildTable('requisition', false, true, false),
        student: buildTable('student', true, false, false),
        teacher: buildTable('teacher', true, false, false),
        date: buildTable('date', true, false, false),
        fetchAll: () => fetchCachedMany(fetchAllKeys, url, {userId, actions: fetchAllKeys.map(k => {const obj = {}; obj[k] = {get: {}}; return obj})}), 
        isValidUser: async function(){
            const obj = await this.teacher.get()
            return obj && ['name', 'className', 'theme'].reduce((o,n) => o && (n in obj), true)
        },
        addUserId: userId => {
            const userIds = storage.get('userIds') || []
            if (!userIds.includes(userId)) {
                userIds.push(userId)
                storage.set('userIds', userIds)
            }
        },
        getUserIds: () => storage.get('userIds'),
        logout,
    }
}

const getURL = apiKey=>`https://script.google.com/macros/s/${apiKey}/exec`
const invalidate = key => {
    storage.cache.rm(key);
    storage.error.rm(key);
}
const logout = () => {
    const apiKey = storage.get('apiKey');
    const userId = storage.get('userId');
    if (apiKey && userId) {
        storage.clear();
    }
}

const fetchCachedMany = async (keys, url, body)=>{
    if (!keys) {
        throw "No keys provided to fetchCached"
    }
    keys.forEach(invalidate);
    try{
        const response = await fetch(url, {method: 'POST', mode:'cors', body: JSON.stringify(body)})
            .then(p=>p.json())
            .catch(e => e.message)
        response.forEach((resp,i) => {
            (resp.success ? storage.cache.set : storage.error.set)(keys[i], resp.message)
            return resp.message;
        });
    } catch(error) {
        console.log('[fetchCachedMany] Error:', error)
        return false;
    }
}
const fetchCached = async (key, url, body)=>{
    if (!key) {
        throw "No key provided to fetchCached"
    }
    const previousResult = storage.cache.get(key)
    if (previousResult) {
        return previousResult;
    }
    invalidate(key);
    try{
        const response = await fetch(url, {method: 'POST', mode:'cors', body: JSON.stringify(body)})
            .then(p=>p.json())
            .catch(e => e.message)
            .then(r => {if(r.success) return r.message; throw r.message})
        storage.cache.set(key, response);
        return response;
    } catch(error) {
        storage.error.set(key, error);
        return false;
    }
}

function Storage(moduleName){
    this.moduleName = moduleName;
    const storageType = localStorage;
    const iterateThrough = callback => Object.fromEntries(Object.keys(storageType).filter(k => k.startsWith(moduleName)).map(k => [k, callback(k)]))
    const _getKey = key => !key ? moduleName : (key.startsWith(moduleName) ? key : `${moduleName}.${key}`);
    this.get = key => {if(!key) return iterateThrough((k,i) => this.get(k)); const v = storageType.getItem(_getKey(key)); try{return JSON.parse(v)} catch {return v}};
    this.set = (key, item) => storageType.setItem(_getKey(key), JSON.stringify(item));
    this.rm = key => storageType.removeItem(_getKey(key));
    this.clear = key => {
        key = _getKey(key);
        iterateThrough(k => k.startsWith(key) ? storageType.removeItem(k) : null)
    }
    return this;
}

const storage = new Storage('sheets')
storage.cache = new Storage('sheets.cache')
storage.error = new Storage('sheets.error')

export default useSheets;

if (process.env.NODE_ENV === 'test') {
    const apiKey = process.env.REACT_APP_APIKEY;
    const userId = process.env.REACT_APP_USERID;
    const assert = console.assert;
    const sheet = useSheets(apiKey, userId);
    assert(sheet.apiKey() == apiKey);
    assert(sheet.userId() == userId);
    assert(await sheet.isValidUser());
    assert(sheet.getUserIds().includes(userId));
    const students = await sheet.student.get();
    assert(students)
    assert(students.length > 0);
    const mockStudentAttendance = students[0].name;
    assert(await sheet.attendance.add({name: mockStudentAttendance}));
    const attendances = await sheet.attendance.get();
    const lastAttendance = attendances.at(-1);
    assert(lastAttendance.name == mockStudentAttendance);
    assert(await sheet.attendance.rm({name: mockStudentAttendance}));
    assert(await sheet.requisition.add({description: 'unit teste description'}))
    assert(await sheet.date.get())
}