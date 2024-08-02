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
    const buildGet = (key, {action, actions}) => fetchCached(key, url, {userId, action, actions})
    const buildPost = (key, {action, actions}) => {
        invalidate(key);
        if (action || (Array.isArray(actions) && actions.length > 0)) {
            return fetchCached(key, url, {userId, action, actions})
        }
    }
    const buildTable = function (name, hasGet, hasAdd, hasRm) {
        let ret = {}
        ret.invalidate = () => invalidate(name)
        const buildObject = (content, n=name) => {
            const obj = {};
            obj[n] = content;
            return obj;
        }
        const buildPostActions = (action, props) => [...(Array.isArray(props) ? props.map( prop => buildObject(buildObject(prop, action))) : [buildObject(buildObject(props, action))]), buildObject({get: {}})]
        if (hasGet) {
            ret.get = () => buildGet(name, {action: buildObject({get: {}})})
        }
        if (hasAdd) {
            ret.add = props => buildPost(name, {actions: buildPostActions('add', props)})
        }
        if (hasRm) {
            ret.rm = props => buildPost(name, {actions: buildPostActions('rm', props)})
        }
        ret.call = operations => buildPost(name, {actions: [buildObject(operations), buildObject({get: {}})]})
        ret.error = () => storage.error.get(name)
        return ret
    }
    const fetchAllKeys = ['attendance', 'student', 'teacher', 'date']
    return {
        apiKey: () => storage.get('apiKey'),
        userId: () => storage.get('userId'),
        attendance: buildTable('attendance', true, true, true),
        requisition: buildTable('requisition', false, true, false),
        student: buildTable('student', true, false, false),
        teacher: buildTable('teacher', true, false, false),
        date: buildTable('date', true, false, false),
        fetchAll: (force = false) => {
            const keys = force ? fetchAllKeys : fetchAllKeys.filter(k => storage.cache.get(k) === null)
            if(keys.length > 0) {
                fetchCachedMany(keys, url, {userId, actions: keys.map(k => {const obj = {}; obj[k] = {get: {}}; return obj})})
            }
        }, 
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

const fetchCachedMany = (keys, url, body)=>{
    return new Promise(async (resolve, reject) => {
        if (!keys) {
            throw "No keys provided to fetchCached"
        }
        keys.forEach(invalidate);
        try{
            let response = await fetch(url, {method: 'POST', mode:'cors', body: JSON.stringify(body)})
                .then(p=>p.json())
                .catch(e => ({sucess: false, message: e.message}))
            if(!Array.isArray(response)) {
                response = [response]
            }
            response.forEach((resp,i) => {
                if(resp.success) {
                    storage.cache.set(keys[i], resp.message);
                } else {
                    storage.error.set(keys[i], resp.message);
                }
            });
            resolve()
        } catch(error) {
            console.log('[fetchCachedMany] Error:', error)
            reject(error);
        }
    })
}
const fetchCached = (key, url, body)=>{
    return new Promise(async (resolve, reject) => {
        if (!key) {
            throw "No key provided to fetchCached"
        }
        const previousResult = storage.cache.get(key)
        if (previousResult) {
            resolve(previousResult);
            return;
        }
        invalidate(key);
        try{
            const response = await fetch(url, {method: 'POST', mode:'cors', body: JSON.stringify(body)})
                .then(p=>p.json())
                .catch(e => e.message)
                .then(r => {if(r.success) return r.message; throw r.message})
            storage.cache.set(key, response);
            resolve(response);
        } catch(error) {
            storage.cache.rm(key);
            storage.error.set(key, error);
            reject(error);
        }
    })
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