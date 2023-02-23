import { Link } from 'react-router-dom'


const Nav = () => {

    let isSidebarOpen = false

    const openSidebar = () => {
        if(isSidebarOpen) return closeSidebar()
        document.getElementById('opensidebar-btn').innerText = 'Close'
        let sidebar = document.getElementsByClassName('sidebar')[0]
        sidebar.style.visibility = 'visible'
        sidebar.style.position = 'absolute'
        sidebar.style.minWidth = '100vw';
        sidebar.style.maxWidth = '100vw'
        sidebar.style.translate = '0 60px'
        isSidebarOpen = true
    }

    const closeSidebar = () => {
        document.getElementById('opensidebar-btn').innerText = 'Menu'
        let sidebar = document.getElementsByClassName('sidebar')[0]
        sidebar.style.visibility = 'collapse'
        sidebar.style.position = 'sticky'
        sidebar.style.minWidth = '0';
        sidebar.style.maxWidth = '0'
        sidebar.style.translate = '0 0'
        isSidebarOpen = false
    }

    return ( 
        <header id='navbar'>
            <div className="opensidebar-div">
                <button id='opensidebar-btn' onClick={openSidebar}>Menu</button>
            </div>
        </header>
    );
}
 
export default Nav;