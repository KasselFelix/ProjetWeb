import React from 'react'
import axios from 'axios'
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

class Friends extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listFriend : [],//liste des ami du compte
      listAll : [],//liste de tout les user
      textFieldValue:'',
      affichage:<div></div>,
      clicked:false,
      cpt:0
    }
  }

  componentDidMount(){
    
    axios.get('http://localhost:4000/api/friend/all')
      .then((res) => {
        const m = []
        res.data.map((s)=>{
          if(s.from_user === localStorage.getItem('login')){
            m.push(s.to_user)
          }
        })
        this.setState({listFriend:m})
        console.log(this.state.listFriend)
      })
      .catch((err) => {
        console.log(err)
      })
      axios
      .get('http://localhost:4000/api/user/all')
      .then((res) => {
        const m = [];
        res.data.map((s)=>{
          if(s.login!==localStorage.getItem('login')){
            m.push({'account':s.login})
        }
      });
        this.setState({listAll:m})
        
      })
      .catch((err) => {
        console.log(err)
      })
      
  }

  printer(){
    var listAmi = this.state.listFriend.map((friend)=><div key={friend}>
    <div>{friend}</div>
    <button onClick={this.removeFriend.bind(this,friend)}>Supprimer</button>
    </div>)
    if(this.state.clicked){
      
      if(this.isFriend(this.state.textFieldValue.account)){
        console.log("ami")
        listAmi = <div>{this.state.textFieldValue.account}<button onClick={this.removeFriend.bind(this,this.textFieldValue.account)}>Supprimer</button></div>
      }
      else{
        console.log("non ami")
        listAmi = <div>{this.state.textFieldValue.account}<button onClick={this.addFriend.bind(this,this.state.textFieldValue.account)}>Ajouter</button></div>
      }
    }
    
    return listAmi
  }

  isFriend(user){
    var bool = false;
    this.state.listFriend.map((s)=>{
      if(s == user){
        
        bool = true;
      }
    })
    return bool;
  }

  clicked(){
    this.setState({clicked: true})
  }


  addFriend(user){
    axios.post("http://localhost:4000/api/friends",{
      to_user:user,
      token:localStorage.getItem('token')
    }).then((res)=>{
      console.log(res);
    }).catch((err)=>{
      console.log(err);
    })
  }

  removeFriend(user){
    axios.delete("http://localhost:4000/api/friends",{data:{
      to_user:user,
      token:localStorage.getItem('token')
    }}).then((res)=>{
      console.log(res);
    }).catch((err)=>{
      console.log(err);
    })
  }


  
  render() {

      return (
        <div>
          
          
          <div>
          <Autocomplete
            id="Search_user"
            options={this.state.listAll}
            getOptionLabel={(option) => option.account}
            style={{ width: 300 }}
            onChange={(e,v) => {if(v===null){
              this.setState({textFieldValue:''})
            }
            else{
              this.setState({textFieldValue:v})}
            }
              
            }
            renderInput={(params) =>
            <TextField {...params}
                label="Search user"
                variant="outlined"
                onClick={this.clicked.bind(this)}
                />}
          />
          </div>
          
          
          {this.printer()}
          
            

        </div>
      )
    }
}

export default Friends
