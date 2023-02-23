import { changeTheme } from "../App";
import { useState, useEffect } from "react";

const Website = () => {

    const [darkSelect, setDarkSelect] = useState(false)
    const [lightSelect, setLightSelect] = useState(false)
    const [oceanSelect, setOceanSelect] = useState(false)

    const setTheme = (e) => {
        if(e.id === 'light-theme-radio') {
            changeTheme('light')
            localStorage.setItem('settings_theme', 'light')
            setLightSelect(true)
            setOceanSelect(false)
            setDarkSelect(false)
        }
        if(e.id === 'dark-theme-radio') {
            changeTheme('dark')
            localStorage.setItem('settings_theme', 'dark')
            setDarkSelect(true)
            setOceanSelect(false)
            setLightSelect(false)
        }
        if(e.id === 'ocean-theme-radio') {
            changeTheme('ocean')
            localStorage.setItem('settings_theme', 'ocean')
            setDarkSelect(false)
            setLightSelect(false)
            setOceanSelect(true)
        }
    }

    useEffect(()=> {
        localStorage.getItem('settings_theme') == 'dark' && setDarkSelect(true)
        localStorage.getItem('settings_theme') == 'light' && setLightSelect(true)
        localStorage.getItem('settings_theme') == 'ocean' && setOceanSelect(true)
    }, [])

    return (  
        <div className='settings-website'>
            <div className='settings-segment'>
                <p>Theme</p>
                <form className='settings-content settings-theme-content'>
                    <div className='checkbox-element-container'>
                        <input type='radio' id='dark-theme-radio' name='radioTheme' 
                        onChange={e => setTheme(e.target)} checked={darkSelect}></input>
                        <label htmlFor='dark-theme-radio'>Dark</label>
                    </div>
                    <div className='checkbox-element-container'>
                        <input type='radio' id='light-theme-radio' name='radioTheme' 
                        onChange={e => setTheme(e.target)} checked={lightSelect}></input>
                        <label htmlFor='light-theme-radio'>Light</label>
                    </div>
                    <div className='checkbox-element-container'>
                        <input type='radio' id='ocean-theme-radio' name='radioTheme' 
                        onChange={e => setTheme(e.target)} checked={oceanSelect}></input>
                        <label htmlFor='ocean-theme-radio'>Ocean</label>
                    </div>
                </form>
            </div>
        </div>
    );
}
 
export default Website;
<div>

</div>