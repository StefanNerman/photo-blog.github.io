import './style.scss'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import Profile from './Profile'
import Website from './Website'

const Settings = () => {

    const [showWebSettings, setShowWebSettings] = useState(false)
    const [showUserSettings, setShowUserSettings] = useState(false)


    const openProfileSettings = () => {
        setShowUserSettings(true)
        const settingsUl = document.getElementById('settings-ul')
        settingsUl.classList.add('full-collapse')
    }
    const openWebsiteSettings = () => {
        setShowWebSettings(true)
        const settingsUl = document.getElementById('settings-ul')
        settingsUl.classList.add('full-collapse')
    }


    return (  
        <div className='settings-wrapper'>
            <div className='settings-container'>
                <Link to='/' className='back-btn'>Go back</Link>
                <h1>Settings</h1>
                <ul id='settings-ul'>
                    <li onClick={openWebsiteSettings}>
                        Website settings
                    </li>
                    
                    <li onClick={openProfileSettings}>
                        Profile settings
                    </li>
                </ul>
                {showUserSettings && <Profile />}
                {showWebSettings && <Website />}
            </div>
        </div>
    );
}
 
export default Settings;