import './style.scss'
import React from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Axios from 'axios'

export let profile = {
    userId:0,
    _name:'anon',
    description:'default description.',
    imgurl:'C:/users/rur7ro/documents/projects js/databases/photo_website/images/pfp0.jpg'
}
export let userId = 0

export function changeProfile(id){
    console.log(':::::::::PROFILE CHANGES::::::::')
    if(id==='reset'){
        userId = 0
        profile = {
            userId:0,
            _name:'anon',
            description:'default description.',
            imgurl:'C:/users/rur7ro/documents/projects js/databases/photo_website/images/pfp0.jpg'
        }
    }
    let ID = userId
    if(id != 0) ID = id
    return new Promise(async (resolve) => {
        Axios.defaults.withCredentials = false
        await Axios.post('http://localhost:3050/api/getprofile', { id:ID })
        .then((response) => {
            profile = response.data
            if(id != 0) userId = id
            resolve(true)
        })
    })
}

export function getUserIdBySessionToken(token){
    return new Promise(resolve => {
        Axios.defaults.withCredentials = false
        Axios.post('http://localhost:3050/api/token_to_user_id', { token:token })
        .then((response) => {
            resolve(response.data)
        })
    })
}

export function getProfileByName(str){
    return new Promise(resolve => {
        Axios.defaults.withCredentials = false
        Axios.post('http://localhost:3050/api/getprofilebyname', { username:str })
        .then(response => {
            if(response.data.userId == 0) resolve(alert(`Name: ${str} was not found.`))
            resolve(response)
        })
        .catch((response) => {
            resolve(alert(`Name: ${str} was not found.`))
        })
    })
}

export function getProfileById(id){
    return new Promise(resolve => {
        Axios.defaults.withCredentials = false
        Axios.post('http://localhost:3050/api/getprofilebyid', { id:id })
        .then(response =>  {
            resolve(response)
        })
    })
}

const Login = () => {

    let loginOperation = 'login'
    const { register, handleSubmit } = useForm()
    const history = useNavigate()


    const updateProfileObj = (ID) => {
        return new Promise(resolve => {
            if(ID == 0) resolve(false)
            Axios.defaults.withCredentials = false
            Axios.post('http://localhost:3050/api/getprofile', { id:ID })
            .then((response) => {
                profile.userId = ID
                profile = response.data
                resolve(true)
            })
        })
    }
    updateProfileObj()

    const selectOperation = (_target) => {
        document.getElementsByClassName('login-box')[0].style.visibility = 'collapse'
        document.getElementsByClassName('login-box')[0].style.maxHeight = '0'
        document.getElementsByClassName('form')[0].style.visibility = 'visible'
        if(_target===0) return document.getElementsByTagName('h1')[0].innerText = 'Log in'
        loginOperation = 'signup'
        return document.getElementsByTagName('h1')[0].innerText = 'Sign up'
    }

    const onSubmit = async (data) => {
        let willNavigate = false
        Axios.defaults.withCredentials = false
        await Axios.post(`http://localhost:3050/api/${loginOperation}`, {name:data.name,password:data.password})
        .then(async (response) => {
            willNavigate = await handleResponse(response)
        })
        if(willNavigate)  history('/')
    }
    function handleResponse(response){
        return new Promise(async (resolve) => {
            let willNavigate = false
            let message = response.data
            if(loginOperation==='login'){
                if(message === 'not found') alert('Usename or password incorrect.')
                if(parseInt(message) > 0) {
                    await updateProfileObj(parseInt(message))
                    userId = parseInt(message)
                    willNavigate = true
                    setSessionTokens(userId)
                }
            }
            if(loginOperation==='signup'){
                if(message==='username taken') alert('Username taken')
                if(message > 0){
                    await updateProfileObj(parseInt(message))
                    userId = parseInt(message)
                    willNavigate = true 
                    setSessionTokens(userId)                 
                }
            }
            resolve(willNavigate)
        })
    }

    const setSessionTokens = (id) => {
        Axios.defaults.withCredentials = true
        Axios({
            method: 'get',
            url: 'http://localhost:3050/api/setsession',
            params: {id:id},
        })
        .then((response) => {
        })
        .catch((response) => {
            console.log(response);
        })
    }

    return (  
        <div className='login-container'>
            <div className='login-wrapper'>
                <Link to='/' className='back-btn'>Go back</Link>
                <h1>Select operation</h1>
                <div className='login-box'>
                    <button onClick={()=>selectOperation(0)}>Logging in</button>
                    <button onClick={()=>selectOperation(1)}>Signing up</button>
                </div>
                <form className='form' onSubmit={handleSubmit(onSubmit)}>
                    <label>Username</label>
                    <input type='text' name='nameInput' id='name-input'
                    {...register('name', {required: false})}></input>
                    <label>Password</label>
                    <input type='password' name='passwordInput' id='password-input'
                    {...register('password', {required: false})}></input>
                    <input type='submit' className='submit-btn'></input>
                </form>
            </div>
        </div>
    );
}
 
export default Login;