

import './App.scss'
import './App.css'
import Home from './Home page/Home'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Create_post from './Create page/Create_post'
import MyPosts from './My posts page/index'
import Settings from './Settings page/index'
import OtherUsers from './Other users page/index'
import Login, {profile, getUserIdBySessionToken, changeProfile} from './Login_page/Main'
import Axios from 'axios'

/*
window.addEventListener('beforeunload', function(event) { 
  Axios.post('http://localhost:3010/api/onclose/')
  .then(response => {
    console.log('nothing')
  })
});
*/
export function changeTheme(theme){
  theme === 'dark' && setThemeColors('rgb(25,25,25)', 'rgb(45,45,45)', 'rgb(66,66,66)', 
  'white', 'rgb(25,25,25)', 'linear-gradient(to top, rgb(42, 75, 64) -380%, rgb(22,22,22))')
  theme === 'light' && setThemeColors('rgb(250,250,250)', 'rgb(185,185,185)', 'rgb(220,220,220)',
  'black', 'rgb(220,220,220)', 'background: linear-gradient(to top, rgb(42, 75, 64) -380%, rgb(250,250,250))')
  theme === 'ocean' && setThemeColors('rgb(238,250,250)', 'rgb(195,235,245)', 'rgb(200,220,220)', 
  'rgb(22, 32, 32)', 'rgb(220,240,240)', 'linear-gradient(to top, rgb(49, 144, 182) 10%, rgb(253, 255, 222))')
}
function setThemeColors(c25, c45, c66, font, highlight ,background){
  let root = document.querySelector(':root')
  root.style.setProperty("--bg-post-25", c25)
  root.style.setProperty("--clr-45", c45)
  root.style.setProperty("--clr-66", c66)
  root.style.setProperty("--main-font-clr", font)
  root.style.setProperty("--highlighted", highlight)
  root.style.setProperty("--body-bg", background)
}

function App() {

  const configureTheme = () => {
    changeTheme(localStorage.getItem('settings_theme'))
  }
  localStorage.getItem('settings_theme') && configureTheme()

if(profile.userId === 0){
  let carr = document.cookie.split(';').map(e=>e.replaceAll(' ', ''))
  let token = ''
  carr.forEach(e => {if(e.split('=')[0]==='sessiontoken') token = e.split('=')[1]})
  if(parseInt(token) > 1000){
    (async () => {
      await changeProfile(await getUserIdBySessionToken(parseInt(token)))
      let url = profile.imgurl.slice(71, 999999)
      if(url==='p0.jpg') url = '0.jpg'
      setProfilePicture('http://localhost:3010/images/pfp'+url)
    })()
  }
}

const [backupArr, setBackupArr] = useState([])
const [profilePicture, setProfilePicture] = useState('')

return (
  <Router>
  <div className="App">
    <Routes>
      <Route exact path='/'>
        <Home arr={backupArr} setarr={setBackupArr} pfp={profilePicture} setpfp={setProfilePicture} />
      </Route>
      <Route exact path='/create_post'>
        <Create_post />
      </Route>
      <Route exact path='/my_posts'>
        <MyPosts pfp={profilePicture} setpfp={setProfilePicture} />
      </Route>
      <Route exact path='/settings'>
        <Settings />
      </Route>
      <Route path='/other_users'>
        <OtherUsers />
      </Route>
      <Route exact path='/login'>
        <Login />
      </Route>
    </Routes>
  </div>
  </Router>
);
}

export default App;