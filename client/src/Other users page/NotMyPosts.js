import Post from '../My posts page/Post'
import '../My posts page/style.scss'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Axios from 'axios'



const NotMyPosts = (props) => {

    let profile = props.profile

    let url = profile.imgurl.slice(71, 999999)
    if(url==='p0.jpg') url = '0.jpg'
    url = 'http://localhost:3050/images/pfp'+url



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
            Axios.defaults.withCredentials = false
            Axios.post('http://localhost:3050/api/getpostsbyuserid', {id:profile.userId})
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
                    <img className='big-round-img' src={url}></img>
                    <div className='myposts-profilebox-text'>
                        <h3>{profile._name}</h3>
                        <p>{profile.description}</p>
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
 
export default NotMyPosts;