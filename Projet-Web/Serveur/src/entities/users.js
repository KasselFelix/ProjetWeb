/*
  TO DO
    -delete user
  
*/

class Users {
  constructor(db) {
    this.db = db
    this.db.exec("CREATE TABLE IF NOT EXISTS users (\
    login VARCHAR(256) NOT NULL PRIMARY KEY, \
    password VARCHAR(256) NOT NULL, \
    lastname VARCHAR(256) NOT NULL, \
    firstname VARCHAR(256) NOT NULL)\
    ;");
  }
  
  create(login, password, lastname, firstname) {
    return new Promise((resolve,reject) => {
      const statement = this.db.prepare("INSERT INTO users VALUES(?,?,?,?);");
      statement.run([login, password, lastname, firstname], function(err){ 
        if (err){
          console.error("Erreur a la creation : ", err);
          reject(err);
        }else{
          resolve(this.lastID);
        }
      });
    });
  }
  
  get_fromID(userid) {
    return new Promise((resolve, reject) => {
      const statement = this.db.prepare("SELECT * FROM users WHERE rowid = ?;");
      statement.get([userid], (err,row)=> {
        if(err){
          console.error("Erreur: ", err);
          reject(err);
        }else{
          resolve(row);
        }
      });
    });
  }

  get_AllUser() {
    return new Promise((resolve, reject) => {
      const statement = this.db.prepare("SELECT * FROM users;");
      console.log(statement)
      statement.all((err,row)=> {
        if(err){
          console.error("Erreur: ", err);
          reject(err);
        }else{
          resolve(row);
        }
      });
    });
  }

  async exists(login) {
    return new Promise((resolve, reject) => {
      const statement = this.db.prepare("SELECT * FROM users WHERE login = ?;");
      statement.get([login], (err,row)=> {
        if(err){
          console.error("Erreur: ", err);
          reject(err);
        }else{
          resolve(row !== undefined);
        }
      });
    });
  }

  checkpassword(login, password) {
    return new Promise((resolve, reject) => {
      const statement = this.db.prepare("SELECT * FROM users WHERE login = ? AND password = ?;");
      statement.get([login,password], function (err, row){
        if (err) {
          console.error("Erreur SQL checkpassword : ", err);
          reject();
        }else{
          resolve(row !== undefined);
        }
      });
    });
  }
    

}

exports.default = Users;

