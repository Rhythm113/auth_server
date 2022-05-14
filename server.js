var express = require('express');
const { Telegraf, Markup } = require('telegraf')
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
var db = new JsonDB(new Config("api_data", true, false, '/'));
var db2 = new JsonDB(new Config("users", true, false, '/'));
const app = express()
var CryptoJS = require("crypto-js");

//ENCRYPTION PART

const key = "PeShVmYq3t6w9z$B";
const iv = "UkXp2s5v8y/B?E(H";
var limit_api = Number('10000');

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
  var count = Number(db.getData(`/${user_api_key}/api/api_calls`))
  var limits = Number(db.getData(`/${user_api_key}/api/limit`))
  var usr = Number(db.getData(`/${user_api_key}/api/user`))
  count = count + 1
  db.push(`/${user_api_key}/api`, { api_calls: count, limit: limits, user: usr })
  console.log("ADD COUNT OK ")
  if (count == limits || count > limits) {
    return false;
  }
  return true;
}
//Error handler
function error(status, msg) {
  /*var err = new Error(msg);
  err.status = status;*/
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
function addUser(userid, apiKey) {
  try {
    var chk = db.getData(`/main/users/${userid}`);
  } catch (err) {
    console.log('data error')
  }
  if (typeof chk == 'undefined') {
    db.push(`/main/users/${userid}`, { exists: 'true' })
    db.push(`/${apiKey}/api/`, { api_calls: "0", limit: limit_api, user: userid });
    db2.push(`/${apiKey}/users/dummy`, { called: true })
    return apiKey;
  } else {
    return "false"
  }
}

//-----------------BOT------------------------------------------------------------
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
  bot.telegram.sendMessage(ctx.chat.id, "List of Available commands :\n/id --Recieve Current Chat ID \n/login --To login as a Client\n/register --To register as a client \n/generate --Session generator (Use this to get temp key to register with your required app", {
  })
})

//Register Command
bot.command('register', ctx => {
  if (ctx.chat.id == '-1001613498889') { bot.telegram.sendMessage(ctx.chat.id, "This Action not allowed here !", {}) }
  else {
    var key = addUser(ctx.chat.id, keygen(16));
    if (key == 'false') {
      bot.telegram.sendMessage(ctx.chat.id, `User already registered !`, {
      })
    } else {
      bot.telegram.sendMessage(ctx.chat.id, `User added to Database Sucessfully !`, {
      })
      bot.telegram.sendMessage(ctx.chat.id, `API Key : ${key}\nCalls Left : ${limit_api}`, {})
    }
  }
})

//LOgin
bot.command('login', ctx => {
  if (ctx.chat.id == '-1001613498889') { bot.telegram.sendMessage(ctx.chat.id, "This Action not allowed here !", {}) }
  else {
    bot.telegram.sendMessage(ctx.chat.id, `To login simply type login:APIKEY`, {
    })
    bot.telegram.sendMessage(ctx.chat.id, `Example : login:CWaHrHctROoGlIMX`, {})
  }
})

bot.command('generate', ctx => {
  if (ctx.chat.id == '-1001613498889') { bot.telegram.sendMessage(ctx.chat.id, "This Action not allowed here !", {}) }
  else {
    var key = GeenarateString(ctx.chat.id)
    bot.telegram.sendMessage(ctx.chat.id, `${key}`, {
    })
    bot.telegram.sendMessage(ctx.chat.id, `This is your session key. Send this key to Your vendor.`, {})
  }
})

//Filters
bot.on('message', (ctx) => {
  if (typeof ctx.message.text == 'undefined') {
    console.log("Bruh")
  } else {
    if (ctx.message.text.includes('login:')) {
      var data = ctx.message.text.replace('login:', '')
      bot.telegram.sendMessage(ctx.chat.id, "Coming Soon.!", {
      })
    }
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
        db2.push(`/${user_key}/users/${raw.user}`, { tel: keuu, time: raw.time, otp: 0 })
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
      db2.delete(`/${user_key}/users/${todel}`)
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
      res.send('500');
    }
    if (typeof fetch_data == 'undefined') { next(error(400, 'User Not Found')) }
    else {
      var num = otpgen(6);
      db2.push(`/${user_key}/users/${input_key}`, { tel: fetch_data.tel, time: fetch_data.time, otp: Number(num) })
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
      fetch_data = db2.getData(`/${user_key}/users/${input_key}`);
    } catch (err) {
      res.send('500');
    }
    if (typeof fetch_data == 'undefined') { next(error(400, 'User Not Found')) }
    else {
      if (fetch_data.otp == ootp) {
        db2.push(`/${user_key}/users/${input_key}`, { tel: fetch_data.tel, time: fetch_data.time, otp: 0 })
        res.send('{"status":"true"}')
      } else {
        res.send('{"status":"false"}')
      }
    }
  }
  //res.send(data)

})

app.listen(3000);
console.log('Express started on port 3000');


///Input sampe
//{"user" : "U2FsdGVkX18IZzIsMqv+IHl9C6EkajZhb2NPANlqsXk=","time":"3000"}