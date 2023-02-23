import './style.scss'
import { useLocation, Link } from "react-router-dom"
import Axios from 'axios'
import { getProfileByName, getProfileById } from '../Login_page/Main'
import NotMyPosts from './NotMyPosts'
import { useEffect, useState } from 'react'


const OtherUsers = (props) => {

    const { search } = useLocation();

    const { state: { infoId } = {} } = useLocation();

    useEffect(()=>{
        if(parseInt(infoId) === 0) return
        handleSearchParams(infoId)
    }, [])

    const handleSearchParams = async (id) => {
        let profile = await getProfileById(id)
        setFoundProfile(profile.data)
        setIsNameFound(true)
    }

    const [ isNameFound, setIsNameFound] = useState(false)
    const [ foundProfile, setFoundProfile ] = useState({})

    const onSubmit = async () => {
        const textarea = document.getElementById('others-input') 
        let text = textarea.value
        if(text=='') return alert('Add a name')
        let profile = await getProfileByName(text)
        if(profile === undefined) return
        setFoundProfile(profile.data)
        setIsNameFound(true)
    }




    return (
        <div>
            {
            !isNameFound &&
            <div className='others-wrapper'>
                <div className='others-container'>
                    <Link to='/' className='back-btn'>Go back</Link>
                    <h1>Find users</h1>
                    <div className='others-form'>
                        <textarea placeholder='Username' id='others-input'></textarea>
                        <button onClick={onSubmit}>Search</button>
                    </div>
                </div>
            </div>
            }
            {isNameFound && <NotMyPosts profile={foundProfile}/>}
        </div>
    );
}
 
export default OtherUsers;