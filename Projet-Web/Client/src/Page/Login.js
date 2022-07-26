import React from 'react'
import axios from 'axios'

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      login: '',
      password: '',
      status: '',
      connected:false
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event = {}) {
    const name = event.target && event.target.name
    const value = event.target && event.target.value
    this.setState({ [name]: value })
  }

  componentDidMount(){
    
    if(localStorage.getItem('token')!==null){
      this.setState({connected:true})
    }
  }

  

  send() {
    if(this.state.login === ""){
      this.setState({status:"Veuillez entrer un nom d'utilisateur"})
    }
    else{
      if(this.state.password === ""){
        this.setState({status:"Veuillez entrer un password"})
      }
      else{
        if(localStorage.getItem('token')!==null){
          console.log("utilisateur deja connecté")
          this.setState({status:"utilisateur deja connecté"})
          this.setState({connected:true})
        }
        else{
          axios.post('http://localhost:4000/api/user/login', {
            
              login: this.state.login,
              password: this.state.password,
          })
          .then((response) => {
            //this.response_login(response)
              console.log(response)
              localStorage.setItem('token', response.data.token)
              localStorage.setItem('login', this.state.login)
              this.setState({status:""})
              this.setState({connected:true})
          })
          .catch((err) => {
            console.log("mot de passe invalide")
            this.setState({status:"mot de passe invalide"})
          })
        }
      }
    }
    
  }

  

 




  render() {
    if(this.state.connected){
      return(
        <div>
          Utilisateur déja connecté
        </div>
      )
    }else{

      return (
        <nav>
          <div style={{ color: 'red' }}>
            {this.state.status}
          </div>
          <div>
            <span>
              <div>Login</div>
              <input
                type="text"
                name="login"
                onChange={this.handleChange}
                value={this.state.login}
              />
            </span>
            <span>
              <div>Password</div>
              <input
                type="password"
                name="password"
                onChange={this.handleChange}
                value={this.state.password}
              />
            </span>
          </div>
  
          <div key={this.state.status}>
            
            <button onClick={this.send.bind(this)}>Log In</button>
          </div>
        </nav>
      )
    }
  }
}

export default Login
