const express = require('express')
const Users = require('./entities/users.js')
const Friends = require('./entities/friends.js')
const Messages = require('./entities/messages.js')
const Login = require('./entities/login.js')
const { default: login } = require('./entities/login.js')

function init(db, nedb) {
  const router = express.Router()
  // On utilise JSON
  router.use(express.json())
  // simple logger for this router's requests
  // all requests to this router will first hit this middleware
  router.use((req, res, next) => {
    console.log('API: method %s, path %s', req.method, req.path)
    console.log('Body', req.body)
    next()
  })

  //nos bd
  const users = new Users.default(db)
  const friends = new Friends.default(db)
  const messages = new Messages.default(nedb)
  const logins = new Login.default(db)






  //############# login #############//
  router.post('/user/login', async (req, res) => {
    try {
      const { login, password } = req.body
      console.log("login : " + login + " password : " + password)
      const id_sess = req.sessionID
      console.log('SESSION ID : ' + id_sess)
      const sess = await logins.is_connected_login(login)
      console.log(sess)
      

      if (sess !== undefined) {
        console.log('sess : ' + sess.login)
        res.status(400).json({
          status: 400,
          message: 'User deja connecté',
          token: sess.token,
          login: login,
        })
        return
      }
      // Erreur sur la requête HTTP
      if (!login || !password) {
        res.status(400).json({
          status: 400,
          message: 'Requête invalide : login et password nécessaires',
        })
        return
      }
      if (!(await users.exists(login))) {
        res.status(401).json({
          status: 401,
          message: 'Utilisateur inconnu',
        })
        return
      }
      let userid = await users.checkpassword(login, password)
      console.log("userid : " + userid)
      if (userid) {
        // Avec middleware express-session
        req.session.regenerate(function (err) {
          if (err) {
            res.status(500).json({
              status: 500,
              message: 'Erreur interne',
            })
          } else {
            // C'est bon, nouvelle session créée
            req.session.userid = userid
            //req.session.login = login;
            //console.log("req.session.userid :" + req.session.userid)
            logins.add_login(login, id_sess)
            res.status(200).json({
              status: 200,
              message: 'Login et mot de passe accepté',
              token: id_sess,
              login: login,
            })
          }
        })
        return
      }
      else{
        req.session.destroy((err) => {})
        console.log("mot de passe invalide")
        res.status(403).json({
          status: 403,
          message: 'login et/ou le mot de passe invalide(s)',
        })
        return

      }
      // Faux login : destruction de la session et erreur
    } catch (e) {
      // Toute autre erreur
      res.status(500).json({
        status: 500,
        message: 'erreur interne',
        details: (e || 'Erreur inconnue').toString(),
      })
    }
  })
  //############# logout #############//
  router.route('/user/logout').delete(async (req, res) => {
    const { token } = req.body
    const sess = await logins.is_connected(token)
    if (sess !== undefined) {
      logins.del_login(token)
      req.session.destroy((err) => {
        if (err) {
          res.status(400).send('Erreur logout')
        } else {
          res.status(200).send('Deconnecte')
        }
      })
    } else {
      res.status(403).send('User non connecte')
    }
  })

  //check if user is connected
  router.route('/user/isConnected').post(async (req, res) => {
    //console.log("sessionID : " + req.sessionID)
    
    const { token } = req.body
    console.log(token)
    try {
      const l = await logins.is_connected(token)
      if (l !== undefined) {
        res.status(200).json({ isConnected: true, data: l })
      } else {
        res
          .status(200)
          .json({ isConnected: false, data: "User id n'est pas connecte" })
      }
      res
        .status(404)
        .json({ isConnected: false, data: "User id n'est pas connecte" })
    } catch (e) {
      res.status(500).json({ isConnected: false, data: e })
    }
  })

  /*router.route("/user/isConnected2").get(async (req, res) => {
        try {
            //const l = await logins.is_connected(req.sessionID)
            if(req.session.userid){
                res.status(200).json({isConnected : req.session.userid});
            }
            else{
                res.sendStatus(404).json({isConnected : req.session.userid});
            }
        }
        catch (e) {
            res.status(500).json({isConnected : false,data:e});
        }
    })*/

  //user id exist
  router
    .route('/user/:user_id(\\d+)')
    .get(async (req, res) => {
      try {
        const user = await users.get_fromID(req.params.user_id)
        if (!user) res.sendStatus(404)
        else res.send(user)
      } catch (e) {
        res.status(500).send(e)
      }
    })
    .delete((req, res, next) => res.send(`delete user ${req.params.user_id}`))

  //get all user in database
  router
    .route('/user/all')
    .get(async (req, res) => {
      try {
        const user = await users.get_AllUser()
        //console.log(user)
        if (!user) res.sendStatus(404)
        else {
          console.log(user)
          res.send(user)
        }
      } catch (e) {
        res.status(500).send(e)
      }
    })
    .delete((req, res, next) => res.send(`delete user ${req.params.user_id}`))

  //############# USERS #############//
  //create user
  router.post('/user', (req, res) => {
    const { login, password, lastname, firstname } = req.body
    if (!login || !password || !lastname || !firstname) {
      res.status(400).send('Missing fields')
    } else {
      users
        .create(login, password, lastname, firstname)
        .then((user_id) => res.status(201).send({ id: user_id }))
        .catch((err) => res.status(500).send(err))
    }
  })

  //############# FRIENDS #############//

  //add friend
  router.post('/friends', async (req, res) => {
    const { to_user, token } = req.body
    if (!to_user) {
      res.status(400).send('Missing fields')
    } else {
      const sess = await logins.is_connected(token)

      if (sess == undefined) {
        res.status(400).send('not connected')
      }
      //check in the database if the user friend and the user login exist
      const friendExist = await users.exists(to_user)
      const userExist = await users.exists(sess.login)

      if (!friendExist) res.status(400).send('User ' + to_user + ' inexistant')
      if (!userExist) res.status(400).send('User ' + sess.login + ' inexistant')
      //Add in database the friend if they are not already friend
      else {
        const isfriend = await friends.is_friend(sess.login, to_user)
        if (!isfriend) {
          friends
            .add_friend(sess.login, to_user)
            .then(() => {
              res.status(201).send({ moi: sess.login, ami: to_user })
            })
            .catch((err) => res.status(500).send(err))
        } else {
          res.status(400).send('vous etes deja amis')
        }
      }
    }
  })

  //enlever un ami  #erreur "Unhandled promise rejection" quand "friendship not found"
  router.delete('/friends', async (req, res) => {
    const { to_user, token } = req.body

    const sess = await logins.is_connected(token)

    if (sess == undefined) {
      res.status(400).send('not connected')
    }

    if (!to_user) {
      res.status(400).send('Missing fields')
    } else {
      const friendExist = await users.exists(to_user)
      const userExist = await users.exists(sess.login, to_user)

      if (!friendExist) res.status(400).send('User ' + to_user + ' inexistant')
      if (!userExist)
        res.status(400).send('User ' + sess.login, to_user + ' inexistant')

      const isfriend = await friends.is_friend(sess.login, to_user)
      if (isfriend) {
        friends
          .rem_friend(sess.login, to_user, to_user)
          .then((retour) => {
            if (retour == 0) {
              res.status(404).send('friendship not found')
            }
            res.status(201).send({ status: 201, msg: "vous n'etes plus amis" })
          })
          .catch((err) => res.status(500).send(err))
      } else {
        res.status(400).send("vous n'etes pas ami")
      }
    }
  })

  //récupérer toutes les amitiés
  router.route('/friend/all').get(async (req, res) => {
    try {
      const friend = await friends.get_all_friends()
      if (!friend) res.sendStatus(404)
      else res.status(200).send(friend)
    } catch (e) {
      res.status(500).send(e)
    }
  })

  router.route('/friend').get(async (req, res) => {
    const { user } = req.body
    try {
      const friend = await friends.get_friends(user)
      if (!friend) res.sendStatus(404)
      else res.status(200).send(friend)
    } catch (e) {
      res.status(500).send(e)
    }
  })


  //############# MESSAGES #############//

  router.post('/messages', async (req, res) => {
    const { token, to_user, msg , all} = req.body
    if (!token || !to_user || !msg) {
      res.status(400).send('Missing fields')
    } else {
      try {
        const sess = await logins.is_connected(token)

        if (sess == undefined) {
          res.status(400).send('not connected')
        }
        const userExist = await users.exists(sess.login)
        if (!userExist) res.status(400).send('User ' + sess.login + ' inexistant')
        if(all==true){
          const message = await messages.create_message(sess.login, "all", msg)
          res.status(201).send(message)
        }
        else{
          const friendExist = await users.exists(to_user)
          const userExist = await users.exists(sess.login)
          if (!friendExist) res.status(400).send('User ' + to_user + ' inexistant')
          
    
          const message = await messages.create_message(sess.login, to_user, msg)
          res.status(201).send(message)
        }
      } catch (e) {
        res.status(500).send(e)
      }
    }
  })

  router.get('/messages', async (req, res) => {
    try {
      const message = await messages.get_all_message()
      res.status(201).send(message)
    } catch (e) {
      res.status(500).send(e)
    }
  })

  router.get('/messages/:username', async (req, res) => {
    const user = req.params.username
    try {
      const existUser = await users.exists(user)

      if (!existUser) res.status(400).send('user inexistant')
      else {
        const message = await messages.find_message_by_username(user)
        res.status(201).send(message)
      }
    } catch (e) {
      res.status(500).send(e)
    }
  })

  router.delete('/messages', async (req, res) => {
    const { id, token } = req.body
    try {
      const sess = await logins.is_connected(token)
        console.log(sess)
        if (sess == undefined) {
          res.status(400).send('not connected')
        }
        const userExist = await users.exists(sess.login)
        if (!userExist) res.status(400).send('User ' + sess.login + ' inexistant')
        const message = await messages.find_message_by_id(id)
        console.log(message.length)
        if (message.length == 0) res.status(400).send('message inexistant')
        else{
          const deleted = await messages.delete_message_by_id(id,sess.login)
          console.log(deleted)
          res.status(201).send('message supprimée')
        }
          
        
      } catch (e) {
        res.status(500).send(e)
      }
  })

  /*router.delete('/messages/:username', async (req, res) => {
    const user = req.params.username
    try {
      const existUser = await users.exists(user)

      if (!existUser) res.status(400).send('user inexistant')
      else {
        const listMesage = await messages.find_message_by_username(user)
        if (listMesage.length == 0) res.status(400).send('pas de message')
        else {
          await messages.delete_message_by_username(user)
          res.status(201).send('messages de ' + user + ' supprimé')
        }
      }
    } catch (e) {
      res.status(500).send(e)
    }
  })*/

  router.post('/messages/comment', async (req,res)=>{
    const { id, token, msg } = req.body
    try {
      const sess = await logins.is_connected(token)

        if (sess == undefined) {
          res.status(400).send('not connected')
        }

      else {
        
        if (msg.length == 0) res.status(400).send('pas de message')
        else {
          const messageID = await messages.find_message_by_id(id);
          console.log(messageID)
          const result = await messages.create_comment(id, sess.login, msg)
          const messageID2 = await messages.find_message_by_id(id);
          
          messageID2.map((i)=>{
            console.log(i.listComment)
          })
          console.log(result)
          res.status(201).send("message envoyer")
        }
      }
    } catch (e) {
      console.log(e)
      res.status(500).send(e)
    }
  })

  router.put('/messages/like', async (req, res) => {
    const { id, token } = req.body
    try {
      const sess = await logins.is_connected(token)

        if (sess == undefined) {
          res.status(400).send('not connected')
        }

      else {
        const listMesage = await messages.find_message_by_id(id)
        if (listMesage.length == 0) res.status(400).send('pas de message')
        else {
          const result = await messages.add_like(id, sess.login)
          console.log(result)
          res.status(201).send(result)
        }
      }
    } catch (e) {
      res.status(500).send(e)
    }
  })

  router.get('/messages/comment', async (req, res) => {
    const { id, user } = req.body

    try {
      const existUser = await users.exists(user)

      if (!existUser) res.status(400).send('test')
      else {
        const listMesage = await messages.find_message_by_id(id)

        if (listMesage.length == 0) res.status(400).send('pas de message')
        else {
          const message = await messages.is_in_comment(id, user)
          res.status(201).send(message)
        }
      }
    } catch (e) {
      res.status(500).send(e)
    }
  })

  return router
}
exports.default = init
