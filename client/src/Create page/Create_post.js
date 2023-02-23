import './create_page.scss'
import { Link } from 'react-router-dom'
import Axios from 'axios'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { profile } from '../Login_page/Main'

const Create_post = () => {

    const { register, handleSubmit } = useForm()
    const [image, setImage] = useState(null)
    const [imgSelected, setImgSelected] = useState(false)

    let pfp = profile.imgurl.slice(71, 999)
    if(pfp==='p0.jpg') pfp = '0.jpg'
    console.log(pfp)

    const onSubmit = (data) => {
        if(!handleAlerts(data)) return alert('Please fill all required information.')
        const formdata = new FormData();
        formdata.append('image', data.image[0])
        const post = formatPost(document.getElementsByClassName('create-title')[0].value)
        formdata.append('userid', post.userid)
        formdata.append('title', post.title)
        formdata.append('date', post.date)
        handleApi(formdata)
    }

    const handleAlerts = (e) => {
        const str = document.getElementsByClassName('create-title')[0].value
        if(imgSelected & str != '') return true 
        return false
    }

    const handleApi = (post) => {
        Axios({
            method: 'post',
            url: 'http://localhost:3050/api/post',
            data: post,
            headers: {'Content-Type': 'multipart/form-data' }
        }).then((response) => {
            console.log(response);
        }).catch((response) => {
            console.log(response);
        });
    }

    const formatPost = (str)=>{
        return {
            userid: profile.userId,
            title: str,
            likes: 0,
            date: Math.floor(parseInt(Date.now())/3600000)
        }
    }

    const addPhotoToPlaceholder = (img) => {
        setImgSelected(true)
        hidePlaceholderElements()
        if (img.target.files && img.target.files[0]) {
            setImage(URL.createObjectURL(img.target.files[0]));
        }
    }

    const hidePlaceholderElements = () => {
        const placeholder = document.getElementsByClassName('img-placeholder')[0]
        placeholder.style.visibility = 'collapse'
        placeholder.style.maxWidth = '0'
        const coverUpButton = document.getElementsByClassName('file-input-btn-coverup')[0]
        coverUpButton.style.maxWidth = '0'
        const fileInputButton = document.getElementsByClassName('file-input')[0]
        fileInputButton.style.maxWidth = '0'
        const coverupBtnText = document.getElementById('coverup-btn-text')
        coverupBtnText.style.maxWidth = '0'
    }

    return (  
        <div className='create-box'>
            <form className='create-post-frame' onSubmit={handleSubmit(onSubmit)}>
                <Link to='/' className='back-btn'>Go back</Link>
      
                <input className='create-title' type='text' name='titleInput' {...register(
                    'title', {required: false}
                )}/>
                <div className="create-img-frame">
                    <img id='create-post-image' src={image}></img>

                    <div className='img-placeholder'>
                        <div className="file-input">
                            
                            <input type='file' name='fileInput' {...register(
                                'image', {required: false}
                            )} onChange={addPhotoToPlaceholder}
                            accept="image/*"
                            />

                            <div className="file-input-btn-coverup">
                                <h2 id='coverup-btn-text'>Upload your image</h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='create-profile-box'>
                    <img src={'http://localhost:3050/images/pfp'+pfp}></img>
                    <p>{profile._name}</p>
                </div>
                <input type='submit' className='create-submit-btn' name='submitButton'/>
      
            </form>
        </div>
    );
}
 
export default Create_post;