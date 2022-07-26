const { rejects } = require("assert")
const { resolve } = require("path")

 /*TO DO
    - test rem/get_friends -> dans l'api
    - test get_all_friends
    x is_friend
    x addfriend

*/

class Friends{
    constructor(db){
        this.db = db
        this.db.exec("CREATE TABLE IF NOT EXISTS friends ( \
            from_user INTEGER NOT NULL, \
            to_user INTEGER NOT NULL, \
            since TIMESTAMPS NOT NULL, \
            PRIMARY KEY (from_user, to_user), \
            FOREIGN KEY (from_user) REFERENCES users(rowid), \
            FOREIGN KEY (to_user) REFERENCES users(rowid) )"
            //flag VARCHAR(256) NOT NULL, \
        )
    }

    add_friend(from_user, to_user){
        return new Promise((resolve,reject) => {
            const statement = this.db.prepare("INSERT INTO friends VALUES(?,?,DATETIME())");
            statement.run([from_user, to_user], function(err){
                if (err){
                    console.log("Erreur ajout d'amis : ", err);
                    reject(err);
                }else{
                    resolve(this.lastID);
                }
            });
        });
    }

    rem_friend(userid, friendid){
        return new Promise((resolve,reject) => {
            const statement = this.db.prepare("DELETE FROM friends WHERE from_user = ? AND to_user = ?");
            statement.run([userid, friendid], function(err){
                if (err){
                    console.log("Erreur suppression d'amis : ", err);
                    reject(err);
                }else{
                    resolve(this.changes);
                }
            });
        });
    }



    /*
    block_friend(userid, friendid){
        return new Promise((resolve, reject)=> {
            const statement = this.db.prepare("UPDATE friends SET flag = 'blocked' WHERE from_user = ? AND to_user = ?");
            statement.run([userid, friendid], function(err){
                if (err){
                    console.log("Erreur bloquage d'amis : ", err);
                    reject(err);
                }else{
                    resolve(this.lastID);//??
                }
            });
        });
    }*/
    
    get_friends(login){
        return new Promise((resolve, reject) =>{
            const statement = this.db.prepare("SELECT * FROM friends WHERE from_user = ?");
            statement.all([login],function(err, row){
                if(err){
                    console.error("Erreur: ", err);
                    reject(err);
                  }else{
                    resolve(row);
                  }
            })
        })
    }


    get_all_friends(){
        return new Promise((resolve, reject) =>{
            const statement = this.db.prepare("SELECT * FROM friends");
            statement.all((err,row)=> {
                if(err){
                    console.error("Erreur: ", err);
                    reject(err);
                  }else{
                    resolve(row);
                  }
            })
        })
    }


    is_friend(userid, friendid){
        return new Promise((resolve, reject) =>{
            const statement = this.db.prepare("SELECT * FROM friends WHERE from_user = ? AND to_user = ?");
            statement.get([userid,friendid],function(err,row){
                if(err){
                    console.log("Erreur is_friends")
                    reject(err)
                }else{
                    resolve(row)
                }
            })
        })
    }

    
}

exports.default = Friends;