

//Copyright @Rhythm113


var express = require('express');
const { Telegraf, Markup } = require('telegraf')
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
var db = new JsonDB(new Config("api_data", true, true, '/'));
var db2 = new JsonDB(new Config("users", true, true, '/'));
const app = express()
var CryptoJS = require("crypto-js");
const res = require('express/lib/response');

//ENCRYPTION PART

const key = "PeShVmYq3t6w9z$B";
//const iv = "UkXp2s5v8y/B?E(H";
var limit_api = Number('20');

//Configs 
const bot = new Telegraf("5390079950:AAFBvuCd9zR6aiXt7aT2o3WXfpd5pC7-Lfk");
//const bot = new Telegraf(process.env.BOT_TOKEN);

//------------------------Functions----------
/*
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
*/
function enc(text) {
  var ciphertext = CryptoJS.AES.encrypt(text, key).toString();
  return ciphertext;
}

function dec(text) {
  var bytes = CryptoJS.AES.decrypt(text, key);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText

}


//add calls 
function addAPICount(user_api_key) {
  /*Params :
  api_calls , limit , user , appid
 */
  var jsond = db.getData(`/main/${user_api_key}/api/`)
  jsond.api_calls = Number(jsond.api_calls) + 1
  db.push(`/main/${user_api_key}/api`, jsond)
  console.log("ADD COUNT OK ")
  if (jsond.api_calls == jsond.limit || jsond.api_calls > jsond.limit) {
    return false;
  }
  return true;
}
//Error handler
function error(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return `{"error" : "${msg}"}`;
}
//Key gen
function keygen(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

//OTPGEN
function otpgen(length) {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}


//String session gen
function GeenarateString(id) {
  var data = enc(id.toString());
  return data;
}

//Register an user with API 
/**
 * Datasets : 
 * /main/users/TG_UID/ (API KEY WILL BE Stored here) {key:keyi,vip:false}
 * /API_KEY/api { api_calls: "0", limit: limit_api, user: userid, appid : 0 }
 * /APP_ID/users/ {"user" : "U2FsdGVkX18IZzIsMqv+IHl9C6EkajZhb2NPANlqsXk=","time":"3000",tel:telid}
 */


function addUser(userid, apiKey) {
  try {
    var chk = db.getData(`/main/users/${userid}`);
  } catch (err) {
    console.log('data error')
  }
  if (typeof chk == 'undefined') {
    db.push(`/main/users/${userid}`, { key: apiKey , vip:false})
    db.push(`/miain/${apiKey}/api/`, { api_calls: "0", limit: limit_api, user: userid, appid: 0 });
    //db2.push(`/${apiKey}/users/dummy`, { called: true })
    return apiKey;
  } else {
    return "false"
  }
}

//Create an APP 
function CreateAPP(apiKey,telID,isVIP){
  var AppID = otpgen(16)
  try{var OldData = db.getData(`/${apiKey}/api/`)} catch(err){return 'error'}
  if(typeof OldData == 'undefined'){return ' error'}
  if(Number(OldData.appid) > 0 && !isVIP){return 'duplicate'}else{
  OldData.appid = Number(AppID);
  try{db.push(`/mian/${apiKey}/api/`,OldData)}catch(err){return 'error'}
  try{db2.push(`/mian/${AppID}/users/`,{user:GeenarateString(telID),time:'999999',tel:Number(telID)})}catch(err){return 'error'}
  return 'done';
}
}

//-----------------BOT------------------------------------------------------------

/**
bot.command('mykey', ctx => {
if (ctx.chat.id == '-1001613498889') { bot.telegram.sendMessage(ctx.chat.id, "This Action not allowed here !", {}) }
else {}})
*/

bot.command('start', ctx => {
  bot.telegram.sendMessage(ctx.chat.id, "Hi welcome to Auth Server by infinity Creators ! Type /help for available options ", {
  })
})

//id
bot.command('id', ctx => {
  console.log(ctx)
  bot.telegram.sendMessage(ctx.chat.id, ctx.chat.id, {
  })
})

//help
bot.command('help', ctx => {
  bot.telegram.sendMessage(ctx.chat.id, "List of Available commands :\n/id --Recieve Current Chat ID \n/mykey --To show your API Key\n/register --To register as a client \n/generate --Session generator (Use this to get temp key to register with your required app", {
  })
})

//Register Command
bot.command('register', ctx => {
  if (ctx.chat.id == '-1001613498889') { bot.telegram.sendMessage(ctx.chat.id, "This Action not allowed here !", {}) }
  else {
    var key = addUser(ctx.chat.id, keygen(32));
    if (key == 'false') {
      bot.telegram.sendMessage(ctx.chat.id, `User already registered !`, {
      })
    } else {
      bot.telegram.sendMessage(ctx.chat.id, `User added to Database Sucessfully ! Welcome to the AUTH System. Create an app to continue.`, {
      })
      bot.telegram.sendMessage(ctx.chat.id, `API Key : ${key}\nCalls Left : ${limit_api}`, {})
    }
  }
})

//mykey
bot.command('mykey', ctx => {
  if (ctx.chat.id == '-1001613498889') { bot.telegram.sendMessage(ctx.chat.id, "This Action not allowed here !", {}) }
  else {
    try {
      var key = db.getData(`/main/users/${ctx.chat.id}/`)
    } catch (err) {
      console.log('Fucker here bruhh..')
    }
    if (typeof key == 'undefined') {
      bot.telegram.sendMessage(ctx.chat.id, "OPS ! You are not registered yet :) ", {})
    } else {
      bot.telegram.sendMessage(ctx.chat.id, `Your API Key : ${key.key}`, {})
    }
  }
})


/*
//LOgin
bot.command('login', ctx => {
  if (ctx.chat.id == '-1001613498889') { bot.telegram.sendMessage(ctx.chat.id, "This Action not allowed here !", {}) }
  else {
    bot.telegram.sendMessage(ctx.chat.id, `To login simply type login:APIKEY`, {
    })
    bot.telegram.sendMessage(ctx.chat.id, `Example : login:CWaHrHctROoGlIMX`, {})
  }
})*/


//generate
bot.command('generate', ctx => {
  if (ctx.chat.id == '-1001613498889') { bot.telegram.sendMessage(ctx.chat.id, "This Action not allowed here !", {}) }
  else {
    var key = GeenarateString(ctx.chat.id)
    bot.telegram.sendMessage(ctx.chat.id, `${key}`, {
    })
    bot.telegram.sendMessage(ctx.chat.id, `This is your session key. Send this key to Your vendor.`, {})
  }
})

//newapp
bot.command('newapp', ctx => {
  if (ctx.chat.id == '-1001613498889') { bot.telegram.sendMessage(ctx.chat.id, "This Action not allowed here !", {}) }
  else {
  }})

//Filters
bot.on('message', (ctx) => {
  if (typeof ctx.message.text == 'undefined') {
    console.log("Bruh")
  } else {
    /*if (ctx.message.text.includes('login:')) {
      var data = ctx.message.text.replace('login:', '')
      bot.telegram.sendMessage(ctx.chat.id, "Coming Soon.!", {
      })
    }*/
    if (ctx.message.text.includes('an:') && ctx.chat.id == Number('695274605')) {
      maiinGRP = '-1001613498889';
      var data2 = ctx.message.text.replace('an:', '')
      bot.telegram.sendMessage(maiinGRP, data2, {
      })
    }
  }
})



//Launch
bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

//----------------------------------------------------------------------------

//basic get on home page 
app.get('/', (req, res) => {
  res.send('Server UP & Running ')
})

app.get('/api', (req, res, next) => {
  var user_key = req.query['key']
  var datas = req.query['data']
  var action = req.query['action']
  var only_user = req.query['user']
  var ootp = req.query['otp']
  //Param Check
  if (!user_key) return next(error(400, 'invalid api call'));
  //DB Work 
  try {
    var data = db.getData(`/${user_key}/api/`);
  } catch (err) {
    console.log('data error')
  }
  if (data == null) return next(error(401, 'invalid api key'))
  if (!addAPICount(user_key)) {
    bot.telegram.sendMessage(data.user, `Your API Limit is over. Contact @Rhythm113 for Renewal or Wait till next month`, {
    }); return next(error(401, 'api expired please renew'));
  }
  //Usage Data
  if (action == 'GETUsage') {
    res.send(`Current Calls : ${data.api_calls} Limit : ${limit_api}`)
  }
  //Add User
  if (action == 'ADDUser') {
    if (!datas) return next(error(400, 'Data is missing'));
    try {
      var raw = JSON.parse(atob(datas))
    } catch (err) {
      console.log(err)
      res.send("Data Error..")
    }
    try {
      var pays = db2.getData(`/${user_key}/users/${raw.user}`);
    } catch (err) {
      console.log('Nothing..')
    }
    if (typeof pays == 'undefined') {
      console.log(raw)
      keuu = dec(raw.user)
      try {
        db2.push(`/mian/${user_key}/users/${raw.user}`, { tel: keuu, time: raw.time, otp: 0 })
        res.send("User Added Successfully..")
      } catch (err) {
        console.log(err)
        res.send("Data Error..")
      }
    } else {
      res.send('User Exists !')
    }
  }
  //Delete
  if (action == 'DELUser') {
    if (!only_user) return next(error(400, 'User is Missing'));
    var todel = atob(only_user);
    console.log(todel)
    try {
      db2.delete(`/mian/${user_key}/users/${todel}`)
      res.send('User Deleted')
    } catch (err) {
      res.send('Delete Failed')
    }
  }
  //Auth
  if (action == 'Auth') {
    if (!only_user) return next(error(400, 'User is Missing'));
    var input_key = atob(only_user)
    try {
      fetch_data = db2.getData(`/${user_key}/users/${input_key}`);
    } catch (err) {
      res.send('Invalid key');
    }
    if (typeof fetch_data == 'undefined') { next(error(400, 'User Not Found')) }
    else {
      var num = otpgen(6);
      db2.push(`/mian/${user_key}/users/${input_key}`, { tel: fetch_data.tel, time: fetch_data.time, otp: Number(num) })
      bot.telegram.sendMessage(fetch_data.tel, `Your OTP is : ${num}. `, {
      })
      res.send('OTP sent OK')
    }
  }
  //OTP Verify
  if (action == 'VerifyOTP') {
    if (!only_user) return next(error(400, 'User is Missing'));
    var input_key = atob(only_user)
    if (!ootp) return next(error(400, 'OTP is Missing'));
    try {
      fetch_data = db2.getData(`/mian/${user_key}/users/${input_key}`);
    } catch (err) {
      res.send('500');
    }
    if (typeof fetch_data == 'undefined') { next(error(400, 'User Not Found')) }
    else {
      if (fetch_data.otp == ootp) {
        db2.push(`/mian/${user_key}/users/${input_key}`, { tel: fetch_data.tel, time: fetch_data.time, otp: 0 })
        res.send('{"status":"true"}')
      } else {
        res.send('{"status":"false"}')
      }
    }
  }
  //res.send(data)

})

app.listen(process.env.PORT || 3000);
console.log('Express started on port 3000');


///Input sampe
//{"user" : "U2FsdGVkX18IZzIsMqv+IHl9C6EkajZhb2NPANlqsXk=","time":"3000"}
