import Post from './Post'
import { useState, useEffect, createElement } from 'react'
import { useCookies } from 'react-cookie';
import Axios from 'axios'
import { profile } from '../Login_page/Main'

let firstPhotoLoaded = false

const Content = (props) => {

    let postArr = props.props.arr
    let setPostArr = props.props.setarr

    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name'])

    const getPosts = async () => {
        firstPhotoLoaded = true
        Axios.defaults.withCredentials = true
        for(let i=0;i<1;i++) await makeRequest()
        function makeRequest(){
            return new Promise(resolve => {
                Axios({
                    method: 'get',
                    url: 'http://localhost:3010/api/getpost/',
                    headers: {'Content-Type': 'multipart/formdata' }
                })
                .then((response) => {
                    resolve(addPostToPostArray(response))                
                })
                .catch((response) => {
                    console.log(response);
                })
            })
        }
    }
    const addPostToPostArray = async (response) => {
        let imgName = response.data.imgurl.slice(68, 999999)
        let sendObj = {
            id:response.data.id,
            posterid:response.data.posterid,
            imgurl:`http://localhost:3010/images/${imgName}`,
            title:response.data.title,
            likes:response.data.likes,
            date:response.data.date
        }
        setPostArr([...postArr, sendObj])
    }



    const cleanCookies = ()=>{
        let carr = document.cookie.split(';').map(e=>e.replaceAll(' ', ''))
        let seenit = ''
        carr.forEach(e => {if(e.split('=')[0]==='seenit') seenit = e.split('=')[1]})
        let seenitArr =  cleanCookiesFormatArray(seenit)
        seenitArr = removeOldCookies(seenitArr)
        let newSeenit = parseArrayToCookieString(seenitArr)
        setCookie('seenit', newSeenit, {maxAge:120000000})
    }

    const cleanCookiesFormatArray = (seenit) => {
        let arr =  []
        seenit.split('-').forEach(e=>{
            let temp = {
                value:parseInt(e.split('_')[0]), 
                expires:parseInt(e.split('_')[1])
            }
            arr.push(temp)
        })
        return arr
    }

    const removeOldCookies = (arr) => {
        let date = Math.floor(parseInt(Date.now())/3600000)
        let narr = []
        arr.map(e => {
            if(date - e.expires < 0) narr.push({value:e.value,expires:e.expires})
            return false
        })
        return narr
    }

    const parseArrayToCookieString = (arr) => {
        let cookieStr = ''
        arr.forEach(e => {
            cookieStr = cookieStr + `${e.value}_${e.expires}-`
        })
        return cookieStr
    }


    useEffect(()=>{
        cleanCookies()
        if(firstPhotoLoaded) return
        getPosts()
    }, [])


    return ( 
        <div className='content-page'>
            {
            postArr.map((e) => {
                return <Post key={e.id} post={e}/>
            })
            }
            <button onClick={getPosts} className='see-more-btn'>see more</button>   
        </div>
    );
}
 
export default Content;