const { rejects } = require("assert");
const { resolve } = require("path");

class Messages {
    constructor(db){
        this.nedb = db;
    }

    async create_message(from_user, to_user, message){
        
        const doc = {
            from: from_user,
            to: to_user,
            msg: message,
            date: Date.now(),
            like: 0,
            listComment : [],
            listLike : []
        };
        return new Promise((resolve, reject)=> {
            this.nedb.insert(doc, function(err, newDoc){
                if (err){
                    reject(err)
                }else{
                    resolve(newDoc)
                }
            })
        })
    }
    async get_all_message(){
        return new Promise((resolve, reject)=> {
            this.nedb.find({},function (err, docs) {
                if (err){
                    reject(err)
                }else{
                    resolve(docs)
                }
            })
        })
    }

    async create_comment(id, login, message){
        const document = {
            from: login,
            msg: message,
            date: Date.now(),
            like: 0,
            listLike : []
        };
        
        
        return new Promise((resolve, reject)=>{
            this.nedb.update({ _id: id },{ $push: { listComment:  document}  },{}, function (err, doc) {
                if (err){
                    console.log(err)
                    reject(err)
                }else{
                    
                    console.log(doc)
                    resolve(doc) 
                }
            })
        })
    }


    async remove_message(id){
        return new Promise((resolve, reject)=> {
            this.nedb.remove({_id : id}, {}, function (err, numRemoved) {
                if (err){
                    reject(err)
                }else{
                    resolve(numRemoved)
                }
            })
        })
    }

    async find_message_by_id(id){
        return new Promise((resolve, reject)=> {
            this.nedb.find({_id : id}, function (err, doc) {
                if (err){
                    reject(err)
                }else{
                    resolve(doc)
                }
            })
        })
    }


    async find_message_by_username(username){
        return new Promise((resolve, reject)=> {
            this.nedb.find({from : username}, function (err, doc) {
                if (err){
                    reject(err)
                }else{
                    resolve(doc)
                }
            })
        })
    }

    async delete_message_by_id(id,login){
        const document = await this.find_message_by_id(id);
        console.log(document[0])
        return new Promise((resolve, reject)=> {
            if(document[0].from == login){
                this.nedb.remove({ _id: id }, {}, function (err, doc) {
                    if (err){
                        reject(err)
                    }else{
                        resolve(doc)
                    }
                })
            }
            else{
                reject();
            }
            
        })
    }

    async delete_message_by_username(username){
        return new Promise((resolve, reject)=> {
            this.nedb.remove({ from: username }, { multi: true }, function (err, doc) {
                if (err){
                    reject(err)
                }else{
                    resolve(doc)
                }
            })
        })
    }
    
    /*async is_in_comment(id,login){
        return new Promise((resolve, reject)=> {
            this.nedb.find({ _id: id, from: [login]},{}, function (err, doc) {
                if (err){
                    reject(err)
                }else{
                    resolve(doc) 
                }
            })
        })
    }*/

    async utils_id_msg(id){
        return new Promise((resolve, reject)=> {
            this.nedb.find({_id : id}, function (err, doc){
                if (err){
                    reject(err)
                }else{
                    resolve(doc) 
                }
            })
        })
    }

    async add_like(id,login){
        var bool = false;
        const document = await this.utils_id_msg(id);
        return new Promise((resolve, reject)=> {

            document[0].listLike.map((s)=>{
                console.log(s);
                if(s == login){
                    bool = true;
                }
            })

            if(!bool){
                
                this.nedb.update({ _id: id },{ $inc: { like: 1 }, $push: { listLike:  login}  },{}, function (err, doc) {
                    if (err){
                        reject(err)
                    }else{
                        console.log(doc)
                        resolve("1") 
                    }
                })
            }
            else{
                
                this.nedb.update({ _id: id },{ $inc: { like: -1 }, $pull: { listLike:  login}  },{}, function (err, doc) {
                    console.log("ici : " + doc)
                    if (err){
                        reject(err)
                    }else{
                        console.log(doc)
                        resolve("-1") 
                    }
                })
            }
            
        })
    }
    
    
}

exports.default = Messages;
