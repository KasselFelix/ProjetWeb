import React from 'react'
import axios from 'axios'

export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      login: '',
      password: '',
      lastname: '',
      firstname: '',
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event = {}) {
    const name = event.target && event.target.name
    const value = event.target && event.target.value
    this.setState({ [name]: value })
  }

  response_login(response) {
    if (response['status'] !== 200) {
      const message = response.data['message']
      this.setState({ status: message })
    } else {
      this.setState({ status: '' })
    }
  }

  send() {
    const api = axios.create({
      baseURL: 'http://localhost:4000/api/',
      timeout: 1000,
    })
    api
      .post('/user/', {
        login: this.state.login,
        password: this.state.password,
        lastname: this.state.lastname,
        firstname: this.state.firstname,
      })
      .then(
        (response) => this.response_login(response),
        console.log(this.state.status)
      )
      .catch((error) => this.response_login(error.response))
  }

  render() {
    if(localStorage.getItem('token')!==null){
      return(
        <div>
          Utilisateur déja connecté
        </div>
      )
    }else{
      return (
        <div>
          <form onSubmit={this.handleSubmit}>
            <label>
              login{' '}
              <input
                type="text"
                name="login"
                onChange={this.handleChange}
                value={this.state.login}
              />
              password{' '}
              <input
                type="password"
                name="password"
                onChange={this.handleChange}
                value={this.state.password}
              />
              lastname{' '}
              <input
                type="text"
                name="lastname"
                onChange={this.handleChange}
                value={this.state.lastname}
              />
              firstname{' '}
              <input
                type="text"
                name="firstname"
                onChange={this.handleChange}
                value={this.state.firstname}
              />
            </label>
          </form>
          <button value="Envoyer" onClick={this.send.bind(this)}>
            Envoyer
          </button>
          <div>{this.state.id}</div>
        </div>
      )
    }
  }
}
