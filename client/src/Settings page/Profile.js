import { useEffect, useState } from 'react'
import { profile, changeProfile } from '../Login_page/Main'
import { useForm } from 'react-hook-form'
import Axios from 'axios'

let imageSubmitted = false
export let pfpChanged = false

const Profile = () => {



    const { register, handleSubmit } = useForm()
    const [ pfpImg, setPfpImg ] = useState(null)


    useEffect(() => {
        let url = profile.imgurl.slice(71, 9999999)
        if(url==='p0.jpg') url = '0.jpg'
        setPfpImg(`http://localhost:3010/images/pfp${url}`)
    }, [])

    const addPfpToPlaceholder = (img) => {
        imageSubmitted = true
        if (img.target.files && img.target.files[0]) {
            setPfpImg(URL.createObjectURL(img.target.files[0]));
        }
    }

    const onSubmit = (data) => {
        const textArea = document.getElementsByClassName('textfield-input')[0]
        let formdata
        if(imageSubmitted) formdata = formSendFiles(data.image[0], textArea.value)
        if(!imageSubmitted) formdata = formSendFiles(false, textArea.value)
        handleApi(formdata)
    }
    const formSendFiles = (img, text) => {
        let fd = new FormData()
        fd.append('description', text)
        fd.append('userId', profile.userId)
        if(img === false) fd.append('image', 'false')
        else {fd.append('image', img)}
        return fd
    } 
    const handleApi = (formdata) => {
        Axios.defaults.withCredentials = false
        Axios({
            method: 'post',
            url: 'http://localhost:3010/api/changepfp',
            data: formdata,
            headers: {'Content-Type': 'multipart/form-data' }
        }).then(async (response) => {
            await changeProfile(0)
            pfpChanged = true
        }).catch((response) => {
            console.log(response);
        });
    }

    const deleteProfile = () => {
        if(window.confirm('Are you sure you want to delete your profile? All data will be deleted.')){
            Axios.defaults.withCredentials = false
            Axios.post('http://localhost:3010/api/deletealluserinfo', { id:profile.userId })
            .then(response => {
                document.cookie = 'sessiontoken=0; expires=Thu, 18 Dec 2024 12:00:00 UTC; path=/'
                changeProfile('reset')
            })
        } 
    }

    return (  
        <form className="profile-settings-wrapper" onSubmit={handleSubmit(onSubmit)}>
            {profile.userId == 0 && <div id='signin-coverup'><p>Sign in required</p></div>}
            <p>{profile._name+`'s profile`}</p>
            <img className='big-round-img' id='big-pfp' src={pfpImg}></img>
            <input className='pfp-file-input' type='file' name='pfpFileInput'
            {...register('image', {required: false})}
            onChange={addPfpToPlaceholder}
            accept="image/*"
            ></input>

            <div className="file-input-coverup">
                <p>New image</p>
            </div>
            <textarea type='text' name='description' className="textfield-input" defaultValue={profile.description}></textarea>
            <button className="grey-btn" onClick={deleteProfile}>Delete profile</button>
            <input type='submit' name='submit-btn' className="grey-btn"></input>
        </form>
    );
}
 
export default Profile;