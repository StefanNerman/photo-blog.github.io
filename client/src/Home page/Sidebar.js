import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { userId, profile, changeProfile } from '../Login_page/Main'
import { pfpChanged } from '../Settings page/Profile'
import Axios from 'axios'
import { useCookies } from 'react-cookie';

const Sidebar = (props) => {
    
    const [profileImage, setProfileImage] = useState(null)
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name'])
    const [updateComponent, setUpdateComponent] = useState(false)
    let setPfp = props.setpfp
    let pfp = props.pfp

    useEffect(() => {
        setUpdateComponent(false)
        if(profile._name === 'anon') return
        addProfileVisualChanges() 
    }, [userId, pfpChanged])
    const addProfileVisualChanges = () => {
        if(userId==0) return
        if(profile._name === 'anon') return
        let loginLink = document.getElementsByClassName('login-link')
        loginLink[0].classList.add('full-collapse')
        let profileBox = document.getElementsByClassName('profilebox-container')[0] 
        profileBox.classList.add('profile-activated')
        profileBox.classList.remove('full-collapse')
        const profileName = document.getElementById('profile-name')
        profileName.innerText = profile._name
        let url = profile.imgurl.slice(71, 9999999)
        if(url==='p0.jpg') url = '0.jpg'
        setPfp(`http://localhost:3050/images/pfp${url}`)
    }

    const romoveProfileVisualChanges = () => {
        let loginLink = document.getElementsByClassName('login-link')
        loginLink[0].classList.remove('full-collapse')
        let profileBox = document.getElementsByClassName('profilebox-container')[0] 
        profileBox.classList.remove('profile-activated')
        profileBox.classList.add('full-collapse')
        const profileName = document.getElementById('profile-name')
        profileName.innerText = ''
    }

    const signOut = () => {
        terminateSession(profile.userId)
        changeProfile('reset')
        setCookie('sessiontoken', '')
        romoveProfileVisualChanges()
        setUpdateComponent(true)
    }

    const terminateSession = (ID) => {  
        Axios.defaults.withCredentials = false
        Axios.post('http://localhost:3050/api/terminate_session', {id:ID})
        .then(response => {
        })
    }


    return ( 
        <div className='sidebar'>
            {updateComponent && <p id='kek'>TROLOLO</p>}
            <div className='sidebar-profilebox'>
                <Link to='/login' className='login-link'>Log in</Link>
                <div className='profilebox-container full-collapse'>
                    <img className='pfp-frame' src={pfp}></img>
                    <p id='profile-name'>anon</p>
                </div>
            </div>
            <ul>
                <li>
                    {profile.userId == 0 && <div className='cover-links'><p>Sign in required</p></div>}
                    <Link to='/create_post' className='list-link'>Create post</Link>
                </li>
                <li>
                    <Link to='/settings' className='list-link'>Settings</Link>
                </li>
                <li>
                    {profile.userId == 0 && <div className='cover-links'><p>Sign in required</p></div>}
                    <Link to='/my_posts' className='list-link'>My profile</Link>
                </li>
                <li>
                    {profile.userId == 0 && <div className='cover-links'><p>Sign in required</p></div>}
                    <Link to={{pathname: '/other_users',search: `?infoId=${0}`,}}
                     className='list-link'>Other users</Link>
                </li>
            </ul>
            <div className='logout-container'>
                <div className='logout-link' onClick={signOut}>
                    Sign out
                </div>
            </div>
        </div>
    );
}
 
export default Sidebar;