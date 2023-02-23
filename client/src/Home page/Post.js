import Axios from 'axios'
import { useState, useEffect } from 'react'
import { useNavigate  } from "react-router-dom"
import { profile } from '../Login_page/Main'

export function likePost(user, post){
    return new Promise(resolve => {
        Axios.defaults.withCredentials = false
        Axios.post('http://localhost:3010/api/likepost', {user:user, post:post})
        .then(response => {
            resolve(response.data)
        })
    })
}

export function formatHoursSinceEpoch(hours){
    let hour = parseInt(hours)
    let dateInMills = Math.floor(hour*3600000)
    let date = new Date()
    date.setTime(dateInMills)
    return date
}

const Post = (props) => {


    const post = props.post
    const [name, setName] = useState('')
    const [pfp, setPfp] = useState('')
    const [postDate, setPostDate] = useState('0 hours ago')

    const history = useNavigate()

    const formatPostDate = (date) => {
        let _date = new Date()
        _date.setTime(Date.now())
        let dayDifference = getDayDifference(date, _date)
        if(dayDifference > 0) return setPostDate(dayDifference + ' days ago')
        let hourDifference = getHourDiffirence(date, _date)
        return setPostDate(hourDifference + ' hours ago')
    }

    const getDayDifference = (date1, date2) => {
        let day1 = date1.getDate()
        let day2 = date2.getDate()
        let difference = day1 - day2
        if(difference < 0) difference = difference * -1
        return difference
    }

    const getHourDiffirence = (hours1, hours2) => {
        let hour1 = hours1.getHours()
        let hour2 = hours2.getHours()
        let difference = hour1 - hour2
        if(difference < 0) difference = difference * -1
        return difference
    }

    useEffect(()=>{
        formatPostDate(formatHoursSinceEpoch(post.date))
        Axios.defaults.withCredentials = false
        Axios.post('http://localhost:3010/api/getprofilebyid', {id:post.posterid})
        .then(response => {
            setName(response.data._name)
            let url = response.data.imgurl.slice(71, 444)
            if(url === 'p0.jpg') url = '0.jpg'
            url = 'http://localhost:3010/images/pfp'+url
            setPfp(url)
            addEventListeners()
        })
    }, [])

    function addEventListeners(){
        let profileLink = document.getElementById('post-profile-'+post.id)
        profileLink.addEventListener('click', () => {
            history.push({
                pathname: '/other_users',
                search: `?infoId=${post.posterid}`,
            });
        })
        let updoot = document.getElementById('post-updoot-'+post.id)
        updoot.addEventListener('click', async () => {
            if(profile.userId === 0) return
            let message = await likePost(profile.userId, post.id)
            if(message === 'failure') return 
            const likeTag = document.getElementById('like-tag-'+post.id)
            likeTag.innerText = parseInt(likeTag.innerHTML) + 1
        })
    }

    return ( 
        <div className='post-frame'>
            <div className='post-top'>
                <p>{postDate}</p>
                <h1>{post.title}</h1>
            </div>
            <div className="image-frame">
                <img src={post.imgurl}></img>
            </div>
            <div className="post-bottom">
                <div className="left" id={'post-profile-'+post.id}>
                    <img src={pfp}></img>
                    <p>{name}</p>
                </div>
                <div className="right">
                    <img id={'post-updoot-'+post.id} src='http://localhost:3010/images/updoot.png'></img>
                    <p id={'like-tag-'+post.id}>{post.likes}</p>
                </div>
            </div>
        </div>                                 
    );
}
 
export default Post;