import React from 'react'
import axios from 'axios'

class Profile extends React.Component {
  constructor(props) {
    super(props)
    
  }

  send() {
    axios
      .delete('http://localhost:4000/api/user/logout', {
        data: {
          token: localStorage.getItem('token'),
        },
      })
      .then((res) => {
        localStorage.removeItem('token')
        localStorage.removeItem('login')
        this.props.handler()
      })
      .catch((err) => {
        console.log(err)
      })
  }
  

  printMsgUser(){
    
    this.props.printMsgProfile(true);
  }

  printAllMsg(){
    this.props.printMsgProfile(false);
  }



  render() {
      return (
        <div>
         <div>
          {localStorage.getItem('login')}
         </div>
         <button onClick={(event)=> this.printAllMsg()}>Tout les messages</button>
          <button onClick={(event)=> this.printMsgUser()}>Mes messages</button>
          <button onClick={(event) => this.send()}>Log out</button>
          
        </div>
      )
    }
}

export default Profile
