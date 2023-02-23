import './style.scss'
import { useState, useEffect } from 'react'
import { likePost } from '../Home page/Post'
import { useNavigate } from "react-router-dom"
import Axios from 'axios'
import { profile } from '../Login_page/Main'
import { deleteMyPost } from './index'
import { formatHoursSinceEpoch } from '../Home page/Post'

const Post = (props) => {

    let post = props.post
    let url = post.imgurl.slice(68, 66699)

    const [name, setName] = useState('')
    const [pfp, setPfp] = useState('')
    const [postDate, setPostDate] = useState('13/2/2023')

    const history = useNavigate()

    const formatPostDate = (date) => {
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        setPostDate(day+'/'+month+'/'+year)
    }

    useEffect(()=>{
        formatPostDate(formatHoursSinceEpoch(post.date))
        Axios.defaults.withCredentials = false
        Axios.post('http://localhost:3050/api/getprofilebyid', {id:post.posterid})
        .then(response => {
            setName(response.data._name)
            let imgurl = response.data.imgurl.slice(71, 444)
            if(imgurl === 'p0.jpg') imgurl = '0.jpg'
            imgurl = 'http://localhost:3050/images/pfp'+imgurl
            setPfp(imgurl)
            addEventListeners()
        })
    }, [])

    function addEventListeners(){
        let profileLink = document.getElementById('mypost-profile-'+post.id)
        profileLink.addEventListener('click', () => {
            history.push({
                pathname: '/other_users',
                search: `?infoId=${post.posterid}`,
            });
        })
        let updoot = document.getElementById('mypost-updoot-'+post.id)
        updoot.addEventListener('click', async () => {
            if(profile.userId === 0) return
            let message = await likePost(profile.userId, post.id)
            if(message === 'failure') return 
            const likeTag = document.getElementById('mylike-tag-'+post.id)
            likeTag.innerText = parseInt(likeTag.innerHTML) + 1
        })
    }

    const postMenuClicked = () => {
        if(profile.userId != post.posterid) return
        applyVisualChanges()
    }
    const applyVisualChanges = () => {
        const dropdown = document.getElementById('post-menu-'+post.id.toString())
        const close = document.getElementById('close-menu-btn-'+post.id.toString())
        const deltePostBtn = document.getElementById('dlete-post-li-'+post.id.toString())
        deltePostBtn.innerText = 'Delete post'
        close.style.visibility = 'visible'
        dropdown.style.visibility = 'visible'
    }
    const closePostMenu = () => {
        const dropdown = document.getElementById('post-menu-'+post.id.toString())
        const close = document.getElementById('close-menu-btn-'+post.id.toString())
        close.style.visibility = 'collapse'
        dropdown.style.visibility = 'collapse'
    }

    const deletePostClicked = (e) => {
        if(e.target.innerText == 'Are you sure') {
            const postMain = document.getElementById('post-main-'+post.id.toString())
            postMain.style.visibility = 'collapse'
            postMain.style.maxHeight = '0'
            closePostMenu()
            deleteMyPost(post.id)
        }
        e.target.innerText = 'Are you sure'
    }


    return (  
        <div className='post-frame narrow-post-frame' id={'post-main-'+post.id.toString()}>
            <div className='post-titlebox'>
                <div className='post-top'>
                    <p>{postDate}</p>
                    <h1>{post.title}</h1>
                </div>
                <div className='post-title-menu-container' id={'post-menu-btn-'+post.id.toString()}>
                    <div className='menu-dot'></div>
                    <div className='menu-dot'></div>
                    <div className='menu-dot'></div>
                    <div className='post-menu-coverup' id={'open-menu-btn-'+post.id.toString()} 
                    onClick={postMenuClicked}></div>
                    <div className='close-menu-coverup' id={'close-menu-btn-'+post.id.toString()} 
                    onClick={closePostMenu}></div>
                    <div className='post-menu-content' id={'post-menu-'+post.id.toString()}>
                        <ul>
                            <li onClick={deletePostClicked} id={'dlete-post-li-'+post.id.toString()}>
                                Delete post
                            </li>
                            <li>
                                Do stuff
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <img src={'http://localhost:3050/images/'+url}></img>
            <div className="post-bottom">
                <div className="left" id={'mypost-profile-'+post.id}>
                    <img src={pfp}></img>
                    <p>{name}</p>
                </div>
                <div className="right">
                    <img id={'mypost-updoot-'+post.id} src='http://localhost:3050/images/updoot.png'></img>
                    <p id={'mylike-tag-'+post.id}>{post.likes}</p>
                </div>  
            </div>
        </div>
    );
}
 
export default Post;