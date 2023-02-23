import Content from './Content_page'
import Sidebar from './Sidebar'
import Nav from './Nav'

const Home = (props) => {

    return (  
        <div>
            <Nav />
            <div id='not-header'>
                <Sidebar setpfp={props.setpfp} pfp={props.pfp}/>
                <Content props={props}/>
            </div>
        </div>
    );
}
 
export default Home;