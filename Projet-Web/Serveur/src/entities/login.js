const { rejects } = require('assert')
const { resolve } = require('path')

class Login {
  constructor(db) {
    this.db = db
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS login (\
        login VARCHAR(256) NOT NULL PRIMARY KEY, \
        token VARCHAR(256) NOT NULL);'
    )
  }

  add_login(login, token) {
    return new Promise((resolve, reject) => {
      const statement = this.db.prepare('INSERT INTO login VALUES(?,?)')
      statement.run([login, token], function (err) {
        if (err) {
          console.log('Erreur de login : ', err)
          reject(err)
        } else {
          resolve({
            id: this.lastID,
            token: token,
          })
        }
      })
    })
  }

  async is_connected(token) {
    return new Promise((resolve, reject) => {
      const statement = this.db.prepare('SELECT * FROM login WHERE token = ?')
      statement.get([token], (err, row) => {
        if (err) {
          console.error('Erreur: ', err)
          reject(err)
        } else {
          //console.log("row : " + JSON.stringify(row))
          resolve(row)
        }
      })
    })
  }

  del_login(token) {
    return new Promise((resolve, reject) => {
      const statement = this.db.prepare('DELETE FROM login WHERE token = ?')
      statement.run([token], function (err) {
        if (err) {
          console.log('Erreur suppression de login : ', err)
          reject(err)
        } else {
          resolve(this.changes)
        }
      })
    })
  }


  async is_connected_login(login) {
    return new Promise((resolve, reject) => {
      const statement = this.db.prepare('SELECT * FROM login WHERE login = ?')
      statement.get([login], (err, row) => {
        if (err) {
          console.error('Erreur: ', err)
          reject(err)
        } else {
          //console.log("row : " + JSON.stringify(row))
          resolve(row)
        }
      })
    })
  }


}









exports.default = Login
