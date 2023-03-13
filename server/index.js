const express = require('express')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const FORMDATA = require('form-data')
const cors = require('cors')
const fs = require('fs')
const sql = require('mysql')
const app = express()
const path = require('path')
const { resolve } = require('path')
const PORT = 3050



const db = sql.createPool({
    host:'localhost',
    user:'root',
    password:'password',
    database:'photo_website_database'
})

app.use(cors())
app.use(fileUpload())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/images', express.static('C:/users/ru7ro/documents/projects js/databases/photo_website/images'))
app.use(cookieParser())
//make middleware function that takes userid from 
//cookies and updates the session time in sessions table in database

const anonymus = {
    userId:0,
    _name:'anon',
    description:'anon account',
    imgurl:'C:/users/rur7ro/documents/projects js/databases/photo_website/images/pfp0.jpg'
}

//below port for testing purposes
app.post('/online_test/post/', (req, res) => {
	let message = req.body.message
	let sqlstr = `INSERT INTO onlinetest (message) VALUES ('${message}')`
	db.query(sqlstr, (err, result) => {res.send(200)})
})
app.get('/online_test/get/', (req, res) => {
	let sqlstr = `SELECT * FROM onlinetest`
    let send
	db.query(sqlstr, (err, result) => {send = JSON.stringify(result)})
    res.json(send)
})


app.get('/api/testing/', (req, res) => {
    let sql = `SELECT * FROM posts`
    db.query(sql, (err, result) => {
        res.send(result)
    })
})

setInterval(clearOldSessions, 7200000)
function clearOldSessions(){
    let sqlDelete = 
    `DELETE FROM sessions WHERE start_time < ${Math.floor(Date.now()/60000)-20}`
    db.query(sqlDelete, (err, result) => {
        if(err) console.log(err)
    })
}

function getUserIdByName(name){
    return new Promise((resolve) => {
        let sqlSelect = 
        `SELECT id FROM user_info WHERE name = '${name}'`
        db.query(sqlSelect, (err, result) => {
            if(result && result.length) resolve(result[0].id)
            resolve(0)
        })
    })
}

function getLikes(post){
    return new Promise(resolve => {
        let sqlSelect = 
        `SELECT likes FROM posts WHERE id = ${post}`
        db.query(sqlSelect, (err, result) => {
            if(err) console.log(err)
            resolve(result[0].likes)
        })
    })
}

app.post('/api/getprofilebyname', async (req, res) => {
    let sendObj = await getProfileInfo(await getUserIdByName(req.body.username))
    res.send(sendObj)
})

app.post('/api/getprofilebyid/', async (req, res) => {
    let profile = await getProfileInfo(req.body.id)
    res.send(profile)
})


app.get('/api/setsession/', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    res.header('Access-Control-Allow-Credentials', true)
    userId = req.query.id
    let token = generateToken()
    res.cookie('sessiontoken', token.toString())
    await addSessionToDatabase(userId, token)
    res.status(200).send('OK')
})
function generateToken(){
    let min=777777
    let max=999999999
    return Math.floor(Math.random() * (+max + 1 - +min)) + +min
}
function addSessionToDatabase(id, token){
    return new Promise(resolve => {
        let dateInMinutes = Math.floor(Date.now()/60000)
        let sqlInsert =
        `INSERT INTO sessions (userid, start_time, token) 
        VALUES (${id}, ${dateInMinutes}, ${token})`
        db.query(sqlInsert, (err, result) => {
            resolve(true)
        })
    })
}

app.post('/api/token_to_user_id/', async(req, res) => {
    userId = await getUserIdByToken(req.body.token)
    res.send(userId.toString())
})
function getUserIdByToken(token){
    return new Promise(resolve => {
        let sqlSelect = 
        `SELECT userid FROM sessions WHERE token = ${token}`
        db.query(sqlSelect, (err, result) => {
            result[0] && resolve(result[0].userid)
            resolve(0)
        })
    })
}

app.post('/api/terminate_session/', async (req, res) => {
    let userId = req.body.id
    await terminateSession(userId)
    res.send('OK')
})
function terminateSession(ID){
    return new Promise(resolve => {
        let sqlDelete = 
        `DELETE FROM sessions WHERE userid = ${ID}`
        db.query(sqlDelete, (err, result) => {
            resolve(true)
        })
    })
}



async function deleteUnusedImages(id, func){
    let filenames = await func(id)
    return new Promise(async (resolve) => {
        resolve(await deleteFilenames(filenames))
    })
}
function getPostImageFilenames(id){
    return new Promise(resolve => {
        let sqlSelect = 
        `SELECT imgurl FROM posts WHERE id = ${id}`
        db.query(sqlSelect, (err, result) => {
            resolve([result[0].imgurl])
        })
    })
}
function getUserImageFilenames(id){
    return new Promise(async (resolve) => {
        let pfpName = await getProfileImagePath(id)
        let postsNameList = await getAllUserPostPaths(id)
        let finalArr = [...pfpName, ...postsNameList]
        resolve(finalArr)
    })
}
function getProfileImagePath(id){
    return new Promise(resolve => {
        let sqlSelect = 
        `SELECT imgurl FROM profiles WHERE userid = ${id}`
        db.query(sqlSelect, (err, result) => {
            resolve([result[0].imgurl])
        })
    })
}
function getAllUserPostPaths(id){
    return new Promise(resolve => {
        let sqlSelect = 
        `SELECT imgurl FROM posts WHERE posterid = ${id}`
        db.query(sqlSelect, (err, result) => {
            let narr = []
            result.forEach(e => {
                narr.push(e.imgurl)
            })
            resolve(narr)
        })
    })
}
function deleteFilenames(arr){
    return new Promise(resolve => {
        arr.forEach(e => {
            fs.unlink(e, err => {
                err && console.log(err)
            })
        })
        resolve(true)
    })
}

app.post('/api/deletepost/', async (req, res) => {
    const post = req.body.post
    await deleteUnusedImages(post, getPostImageFilenames)
    await deletePost(post)
})
function deletePost(id){
    return new Promise(async (resolve) => {
        await deleteFromLikedList(id)
        await deleteFromPosts(id)
    })
}
function deleteFromLikedList(id){
    return new Promise(resolve => {
        let sqlDelete = 
        `DELETE FROM liked_list WHERE postid = ${id}`
        db.query(sqlDelete, (err, result) => {
            resolve(true)
        })
    })
}
function deleteFromPosts(id){
    return new Promise(resolve => {
        let sqlDelete = 
        `DELETE FROM posts WHERE id = ${id}`
        db.query(sqlDelete, (err, result) => {
            resolve(true)
        })
    })    
}


app.post('/api/deletealluserinfo/', async (req, res) => {
    let user = req.body.id
    await deleteUnusedImages(user, getUserImageFilenames)
    let deletePostsCheck = await deleteAllPosts(user)
    let deleteProfileCheck = await deleteProfile(user)
    let deleteUserCheck = await deleteUser(user)
    await terminateSession(user)
    let message = 'failure'
    if(deletePostsCheck & deleteProfileCheck & deleteUserCheck) message = 'success'
    res.send(message)
})
function deleteAllPosts(id){
    return new Promise(resolve => {
        let sqlDelete = 
        `DELETE FROM posts WHERE posterid = ${id}`
        db.query(sqlDelete, (err, result) => {
            err && resolve(false)
            resolve(true)
        })
    })
}
function deleteProfile(id){
    return new Promise(resolve => {
        let sqlDelete = 
        `DELETE FROM profiles WHERE userid = ${id}`
        db.query(sqlDelete, (err, result) => {
            err && resolve(false)
            resolve(true)
        })
    })
}
function deleteUser(id){
    return new Promise(resolve => {
        let sqlDelete = 
        `DELETE FROM user_info WHERE id = ${id}`
        db.query(sqlDelete, (err, result) => {
            err && resolve(false)
            resolve(true)
        })
    })
}

app.post('/api/getpostsbyuserid/', async (req, res) => {
    let posts = await getMyPosts(req.body.id)
    res.send(posts)
})

app.get('/api/myposts/', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Content-Type', 'multipart/formdata')
    let id = await getUserIdByToken(parseInt(req.cookies.sessiontoken))
    let posts = await getMyPosts(id)
    res.send(posts)
})
function getMyPosts(ID){
    return new Promise(resolve => {
        let sqlSelect = 
        `SELECT * FROM posts 
        WHERE posterid = ${ID}`
        db.query(sqlSelect, (err, result) => {
            resolve(result)
        })
    })
}


app.get('/api/getpost/', (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Content-Type', 'multipart/formdata')
    const cookie = req.cookies
    getPostFromDatabase(cookie, res)
})
function getPostFromDatabase(cookie, res){
    let seenitId = createSeenitList(cookie.seenit)
    let dateInHours = Math.floor(parseInt(Date.now())/3600000)
    let seenitSQLString = createSeenitSQLString(seenitId)
    let sqlRequirements = 
    `WHERE ${dateInHours}-date<48 AND id != 29 AND id != 1${seenitSQLString} LIMIT 1`
    let sqlSelect = 
    `SELECT * FROM posts ${sqlRequirements}`
    db.query(sqlSelect, (err, result)=>{
        sendPostPackage(result, res, cookie)
    })
}
function sendPostPackage(result, res, cookie){
    if(!result[0]) return res.status(404).send(`You've seen all the posts congrats faggot!`)
    let post = formatSendData(result[0])
    addPostIdToCookie(result[0].id, res, cookie)
    res.send(post)
}
function formatSendData(post){
    let postInfo = {
        id: post.id,
        posterid:post.posterid,
        imgurl:post.imgurl,
        title:post.title,
        likes:post.likes,
        date:post.date
    }
    return postInfo
}
function addPostIdToCookie(id, res, cookie){
    let seenitStr = cookie.seenit
    let date = (Math.floor(parseInt(Date.now())/3600000)+48).toString()
    seenitStr = seenitStr + `${id}_${date}-`
    res.cookie('seenit', seenitStr, {maxAge:120000000})
}
function createSeenitList(seenit) {
    if(seenit) {
        let arr =  []
        seenit.split('-').forEach(e=>{
            let temp = {
                value:parseInt(e.split('_')[0]), 
                expires:parseInt(e.split('_')[1])
            }
            if(temp.value > 0) arr.push(temp)
        })
        return arr
    }
    return [{
        value:1,
        expires:Math.floor(parseInt(Date.now())/3600000)+48
    }]
}
function createSeenitSQLString(seenitArr){
    let str = ''
    seenitArr.forEach(e => {
        str = str + ` AND id != ${e.value}`
    })
    return str
}



app.post('/api/post', async function(req, res) {
    const file = req.files.image
    const fileType = findImageFileType(file)
    const imgName = await generateNewImgId()
    const dir = 'C:/Users/ru7ro/Documents/projects js/databases/photo_website/images'
    const filePath = path.join(dir, `${imgName}.${fileType}`)
    const post = {
        userid:req.body.userid,
        title:req.body.title.replaceAll(`'`, '`'),
        date:req.body.date,
        likes:0,
        imgpath:filePath.toString().replaceAll('\\', '/')
    }
    file.mv(filePath, err => {if (err) return res.status(500).send(err)})
    addPostToMySQL(post)
    return false
})
function findImageFileType(file){
    const typeStr = file.mimetype.split('/')[1]
    if(typeStr==='jpeg') return 'jpg'
    if(typeStr==='png') return 'png'
}
function generateNewImgId(){
    let imgName = '0'
    const sqlSelect = 
    `SELECT id FROM posts ORDER BY id DESC LIMIT 1`
    return new Promise((resolve, reject)=>{
        db.query(sqlSelect, (err, result)=>{
            if(err) return reject(err)
            imgName = result[0].id+1
            resolve(imgName)
        })
    })
}
function addPostToMySQL(post){
    const sqlInsert = 
    `INSERT INTO posts (posterid,imgurl,title,likes,date) VALUES (${parseInt(post.userid)},'${post.imgpath}','${post.title}',${post.likes},'${post.date}')`
    db.query(sqlInsert, (err, result)=>{
        if(err) console.log(err)
    })
}



app.post('/api/login', async (req, res) => {
    const name = req.body.name
    const password = req.body.password
    const verify = await verifyLoginInfo(name, password)
    let message = verify.toString()
    if(verify === 'not able to find') message = 'not found'
    res.send(message)
})
function verifyLoginInfo(name, password){
    return new Promise((resolve) => {
        let sqlSelect = 
        `SELECT * FROM user_info WHERE name = '${name}' AND password = '${password}'`
        db.query(sqlSelect, (err, result) => {
            if(result && result.length) resolve(result[0].id)
            resolve('not able to find')
        })
    })
}

app.post('/api/signup', async (req, res) => {
    const name = req.body.name
    const password = req.body.password
    let message = ''
    const verify = await verifyUniqueUsername(name)
    if(!verify) message = 'username taken'
    if(verify) {
        message = await addUserToDatabase(name, password)
        await generateNewProfile(message)
    }
    res.send(message.toString())
})
function verifyUniqueUsername(name) {
    return new Promise((resolve) => {
        let sqlSelect = 
        `SELECT * FROM user_info WHERE name = '${name}'`
        db.query(sqlSelect, (err, result) => {
            if(result && result.length) resolve(false)
            resolve(true)
        })
    })
}
function addUserToDatabase(name, password){
    return new Promise((resolve) => {
        let sqlInsert = 
        `INSERT INTO user_info (name, password) VALUES ('${name}', '${password}')`
        db.query(sqlInsert, async (err, result) => {
            let userId = await getUserIdByName(name)
            if(err) console.log(err)
            resolve(userId)
        })
    })
}
function generateNewProfile(id){
    return new Promise(resolve => {
        let imgPath = 'C:/users/rur7ro/documents/projects js/databases/photo_website/images/pfp0.jpg'
        let sqlInsert = 
        `INSERT INTO profiles (userid, description, imgurl)
        VALUES (${id}, 'Hey I have default user settings', '${imgPath}')`
        db.query(sqlInsert, (err, result) => {
            if(err) resolve(console.log('Error occured while generating profile.'))
            resolve(true)
        })
    })
}


app.post('/api/getprofile', async (req, res) => {
    const id = req.body.id
    let profile = await getProfileInfo(id)
    res.send(profile)
})
function getProfileInfo(id){
    return new Promise(resolve => {
        id == 0 && resolve(anonymus)
        let sqlSelect = 
        `SELECT * FROM user_info INNER JOIN profiles
        ON user_info.id = profiles.userid WHERE user_info.id = ${id}`
        db.query(sqlSelect, (err, result) => {
            if(result && result.length) {
                resolve({
                    userId:id,
                    _name:result[0].name,
                    description:result[0].description,
                    imgurl:result[0].imgurl
                })
            }
            resolve(anonymus)
        })
    })
}



app.post('/api/changepfp', async (req, res) => {
    const description = req.body.description
    const userId = req.body.userId.toString()
    let OK = false
    if(req.body.image==='false') {
        OK = await setProfileDescription(userId, description)
    } else {
        const img = req.files.image
        const fileType = findImageFileType(img)
        const dir = 'C:/Users/ru7ro/Documents/projects js/databases/photo_website/images'
        const filePath = path.join(dir, `pfp${userId}.${fileType}`)
        img.mv(filePath, err => {if (err) return res.status(500).send(err)})
        OK = await setNewPfp(filePath, userId, description)
    }
    if(OK) OK = 'success'
    if(!OK) OK = 'error'
    res.send(OK)
})
function setProfileDescription(id, text){
    return new Promise(resolve => {
        let sqlUpdate = 
        `UPDATE profiles
        SET description = '${text.replaceAll(`'`, '`')}'
        WHERE userid = ${id}`
        db.query(sqlUpdate, (err, result) => {
            if(err) resolve(false)
            resolve(true)
        })
    })
}
function setNewPfp(path, id, text){
    return new Promise(resolve => {
        let sqlUpdate = 
        `UPDATE profiles
        SET description = '${text.replaceAll(`'`, '`')}', imgurl = '${path.replaceAll('\\', '/')}'
        WHERE userid = ${id}`
        db.query(sqlUpdate, (err, result) => {
            if(err) resolve(false)
            resolve(true)
        })
    })
}


app.post('/api/likepost/', async (req, res) => {
    const postId = parseInt(req.body.post)
    const user = parseInt(req.body.user)
    let message = 'failure'
    let canLike = await checkLikedList(user, postId)
    if(canLike){if(await addLikeToPost(user, postId)) message = 'success'}
    res.send(message)
})
function checkLikedList(user, post){
    return new Promise(resolve => {
        let sqlSelect = 
        `SELECT * FROM liked_list WHERE userid = ${user} AND postid = ${post}`
        db.query(sqlSelect, (err, result) => {
            if(result && result[0] && result[0].userid) resolve(false)
            resolve(true)
        })
    })
}
function addLikeToPost(user, post){
    return new Promise(async (resolve) => {
        await updateLikedList(user, post)
        let sqlUpdate = 
        `UPDATE posts SET likes = likes + 1 WHERE id = ${post}`
        db.query(sqlUpdate, (err, result) => {
            if(err) resolve(false)
            resolve(true)
        })
    })
}
function updateLikedList(user, post){
    return new Promise(resolve => {
        let sqlInsert = 
        `INSERT INTO liked_list (userid, postid)
        VALUES (${user}, ${post})`
        db.query(sqlInsert, (err, result) => {
            resolve(true)
        })
    })
} 



app.listen(PORT,()=>{
    console.log('running on port '+PORT)  
})