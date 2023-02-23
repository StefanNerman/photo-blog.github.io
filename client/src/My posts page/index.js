import './style.scss'
import { useEffect, useState } from 'react';
import Post from './Post'
import Axios from 'axios'
import { profile } from '../Login_page/Main'
import { Link } from 'react-router-dom'
import { useCookies } from 'react-cookie';

export function deleteMyPost(post){
    return new Promise(resolve => {
        Axios.defaults.withCredentials = false
        Axios.post('http://localhost:3010/api/deletepost/', { post:post })
        .then(response => {
            console.log(response)
        })
    })
}

const MyPosts = (props) => {


    let pfp = props.pfp
    let setPfp = props.setpfp
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name'])
    const [postsLoaded, setPostsLoaded] = useState(false)
    const [myPosts, setMyPosts] = useState([])

    useEffect(() => {
        let url = profile.imgurl.slice(71, 999999)
        if(url==='p0.jpg') url = '0.jpg'
        loadMyPosts()
    }, [])

    const loadMyPosts = async () => {
        setMyPosts(...myPosts, await handleApi(profile.userId))
        setPostsLoaded(true)
    }

    const handleApi = () => {
        return new Promise(resolve => {
            Axios.defaults.withCredentials = true
            Axios({
                method: 'get',
                url: 'http://localhost:3010/api/myposts/',
                headers: {'Content-Type': 'multipart/formdata'}
            })
            .then((response) => {
                resolve(response.data)                  
            })
        })
    }



    return (  
        <div className='myposts-wrapper'>
            <div className='myposts-container'>
                <Link to='/' className='back-btn mypost-back-btn'>Go back</Link>
                <div className='myposts-profilebox'>
                    <img className='big-round-img' src={pfp}></img>
                    <div className='myposts-profilebox-text'>
                        <h3>{profile._name}</h3>
                        <p>
                            {profile.description}
                        </p>
                    </div>
                </div>
                <div className='myposts-contentbox'>
                    {
                    postsLoaded && myPosts.map((e) => {
                        return <Post key={e.id} post={e}/>
                    })
                    }
                </div>
            </div>
        </div>
    );
}
 
export default MyPosts;