import React from 'react'
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom'

import Login from './Page/Login'
import Dashboard from './Page/Dashboard'
import Home from './Page/Home'
import Register from './Page/Register'


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div>
          <div className="header">
            <NavLink exact activeClassName="active" to="/">
              Home
            </NavLink>
            <NavLink activeClassName="active" to="/login">
              Login
            </NavLink>
            <NavLink activeClassName="active" to="/register">
              Register
            </NavLink>
            <NavLink activeClassName="active" to="/dashboard">
              Dashboard
            </NavLink>
            
          </div>
          <div className="content">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/dashboard" component={Dashboard} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App
