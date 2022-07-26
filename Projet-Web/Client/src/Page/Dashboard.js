import React from 'react'
import axios from 'axios'
import Messages from '../Component/Messages'
import Profile from '../Component/Profile'
import Friends from '../Component/Friends'

class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      token: localStorage.getItem('token') + '',
      connected : false,
      listMessage : [],
      msgProfile : false
    }
    this.handler = this.handler.bind(this)

    
  }

  

  printMsgProfile = (value) =>{
    console.log("passe")
    this.setState({msgProfile:value})
  }
  
  componentDidMount(){
    axios.post('http://localhost:4000/api/user/isConnected',{token:this.state.token}).then((res)=>{
      if(!res.data.isConnected){
        localStorage.removeItem('token')
        localStorage.removeItem('login')
        this.setState({connected : false})
      }
    }).catch((err)=>console.log(err))
    if(localStorage.getItem('token')!==null){
      this.setState({connected : true})
      this.getMessageUser()
    }
    else{
      this.setState({connected : false})
    }
  }

  handler() {
    this.setState({
      connected: false
    })
  }

  getMessageUser(){
    axios.get('http://localhost:4000/api/messages/'+localStorage.getItem('login')).then((res)=>{
      
      this.setState({listMessage : res.data})
      console.log(this.state.listMessage)
    }).catch((err)=>{

    })
  }



  render() {
    if(this.state.connected){
      return (
        <div style={{display:"flex"}}>
          <div style={{flexGrow:"1"}}>
             <Profile handler = {this.handler} printMsgProfile = {this.printMsgProfile}/>
          </div>
          <div style={{flexGrow:"2"}}>
             Message de {localStorage.getItem('login')}
             <Messages msgProfile = {this.state.msgProfile}/>
          </div>
          <div style={{flexGrow:"1"}}>
            <Friends/>
          </div>
          
          
        </div>
      )

    }
    else{
      return(
        <div>
          Utilisateur non connecté
        </div>
      )
    }
  }
}

export default Dashboard
