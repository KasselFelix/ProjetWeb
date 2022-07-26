import React from 'react'
import axios from 'axios'

class Messages extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
      token: localStorage.getItem('token') + '',
      listMessage : [],
      listMessageUser:[],
      showResponses:false,
      response :''
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event = {}) {
    const name = event.target && event.target.name
    const value = event.target && event.target.value
    this.setState({ [name]: value })
  }

  
  

  componentDidMount(){
    
      this.getAllMessage()
      this.getMessageUser()
      
  }

  getMessageUser(){
    axios.get('http://localhost:4000/api/messages/'+localStorage.getItem('login')).then((res)=>{
      
      this.setState({listMessageUser : res.data})
      console.log(this.state.listMessageUser)
    }).catch((err)=>{

    })
  }
  getAllMessage(){
    axios.get('http://localhost:4000/api/messages').then((res)=>{
      
      this.setState({listMessage : res.data})
      console.log(this.state.listMessage)
    }).catch((err)=>{

    })
  }
  

  dateParser(date){
    function checkZero(data){
        if(data.length === 1){
            data = "0" + data;
        }
        return data;
        }
    var today = new Date(date);
    var day = today.getDate() + "";
    var month = (today.getMonth() + 1) + "";
    var year = today.getFullYear() + "";
    var hour = today.getHours() + "";
    var minutes = today.getMinutes() + "";
    var seconds = today.getSeconds() + "";

    day = checkZero(day);
    month = checkZero(month);
    year = checkZero(year);
    hour = checkZero(hour);
    minutes = checkZero(minutes);
    seconds = checkZero(seconds);

    return day + "/" + month + "/" + year + " " + hour + ":" + minutes + ":" + seconds;
    
    
  }
  sendMessage(){
    axios.post("http://localhost:4000/api/messages",{
      token:localStorage.getItem('token'),
      to_user:"all",
      msg:this.state.message,
      all:true
    }).then((res)=>{
      console.log(res.data)
      const msg = res.data
      this.setState({
        listMessage: [...this.state.listMessage, msg]
      })
      if(this.props.msgProfile){
        this.setState({
          listMessageUser: [...this.state.listMessageUser, msg]
        })
      }
      this.setState({message:''})
    }).catch((err)=>{
      console.log(err)
    })
  }

  deleteMessage(id){
    axios.delete("http://localhost:4000/api/messages",{data:{
      id:id,
      token:localStorage.getItem('token')
    }}).then((res)=>{
      console.log(res)
      this.getAllMessage()
    }).catch((err)=>{
      console.log(err);
    })
  }
  
  sendResponse(id_msg){
    axios.post('http://localhost:4000/api/messages/comment',{
      id: id_msg,
      token : localStorage.getItem('token'),
      msg: this.state.response
    }).then((res)=>{
      console.log(res)
    }).catch((err)=>{
      console.log(err)
    })
  }

  sendLike(id){
    axios.put("http://localhost:4000/api/messages/like",{
      id:id,
      token:localStorage.getItem('token')
    }).then((res)=>{
      
      let listMessageCopy = this.state.listMessage;
      console.log("copy : "+ JSON.stringify(listMessageCopy))
      listMessageCopy.map((msg)=>{
            if(msg._id === id){
              if(res.data == '1'){
                msg.like = msg.like + 1;
              }
              else{
                msg.like = msg.like - 1;
              }
            }
          })

          this.setState({listMessage:listMessageCopy})
      }).catch((err)=>{
      console.log(err);
    })
  }

  showResponse(msg){
    console.log(msg.listComment)
    msg.listComment.map((i)=><div>
      <div>{i.from}   {i.date}</div>
      <div>{i.msg}</div>
    </div>)
  }

  setShowResponse(){
    
    this.setState({showResponses: !this.state.showResponses})
  }

  render() {
    var msgs =<div>pas de message</div>
    if(this.props.msgProfile){
      msgs = this.state.listMessageUser.map(msg=>
        <div key={msg._id}>
            <div>{msg.from}     {this.dateParser(msg.date)}</div>
            <div style={{wordWrap: "break-word"}}>{msg.msg}</div>
            <div>@{msg.to}  like : {msg.like}</div>
            <button onClick={this.sendLike.bind(this,msg._id)}>like</button>
            {msg.from===localStorage.getItem('login')?<button onClick={this.deleteMessage.bind(this,msg._id)}>Delete</button>:<div></div>}
            <br />
        </div>)
    }
    else{
      msgs = this.state.listMessage.map(msg=>
        <div key={msg._id}>
            <div>{msg.from}     {this.dateParser(msg.date)}</div>
            <div>{msg.msg}</div>
            <div>@{msg.to}  like : {msg.like}</div>
            <button onClick={this.sendLike.bind(this,msg._id)}>like</button>
            <div>
            <input
            type="text"
            name="response"
            onChange={this.handleChange}
            value={this.state.response}
          /><button onClick={this.sendResponse.bind(this,msg._id)}>Repondre</button>
              </div>
            <button onClick={this.setShowResponse.bind(this)}>Voir les réponses</button>
            {msg.from===localStorage.getItem('login')?<button onClick={this.deleteMessage.bind(this,msg._id)}>Delete</button>:<div></div>}
            <br />
            {this.state.showResponses ? msg.listComment.map((i)=><div>
      <div>{i.from}   {this.dateParser(i.date)}</div>
      <div>{i.msg}</div>
    </div>):<div></div>}
        </div>)
    }
    
      return (
        <div>
          <input
            type="text"
            name="message"
            onChange={this.handleChange}
            value={this.state.message}
          />
          <button onClick={this.sendMessage.bind(this)}>Envoi</button>

          <div>
            {msgs}
          </div> 
        </div>
      )

    }
    
}

export default Messages
