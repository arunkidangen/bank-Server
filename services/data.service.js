//importing jwt
const jwt = require('jsonwebtoken')

const db = require('./db')

let user = {
  1000: { uname: "abhijith", acno: 1000, password: "userone", balance: 5000, tranasction: [] },
  1001: { uname: "akhil", acno: 1001, password: "usertwo", balance: 5000, tranasction: [] },
  1002: { uname: "nikhil", acno: 1002, password: "userthree", balance: 5000, tranasction: [] }
}


const register = (uname, acno, password, blnc) => {

  return db.User.findOne({ acno })
    .then(user => {
      if (user) {
        return {
          status: true,
          statusCode: 422,
          message: 'user already exists..',
        }

      } else {
        const newUser = new db.User({
          uname, acno, password, blnc, tranasction: []
        })

        newUser.save();

        return {
          status: true,
          statusCode: 200,
          message: 'user added sucessfully',
        }
      }
    })
}
const login = (acno, password) => {

  return db.User.findOne({ acno, password }).then(user => {

    if (user) {
      const token = jwt.sign({
        currentNo: acno
      }, 'supersecret123123')

      return {
        status: true,
        statusCode: 200,
        message: 'Logged in successfully..',
        token,
        currentUser:user.uname
      }
    } else {
      return {
        status: false,
        statusCode: 422,
        message: 'invalid username or password'
      }
    }
  })


}


const deposit = (acno, password, amount) => {
  var amt = parseInt(amount)
  return db.User.findOne({ acno, password })
    .then(user => {
      if (!user) {
        return {
          status: true,
          statusCode: 422,
          message: 'invalid credentials'

        }
      }
      user.balance += amt;
      user.transaction.push({
        amount: amt,
        type: "debit"
      })
      user.save();
      return {
        status: true,
        statusCode: 200,
        message: `${amt} deposited & current balance is  ${user.balance}`
      }

    })
}

const withdraw = (req,accno, password, amount) => {

  var amt = parseInt(amount)
console.log(req);

  return db.User.findOne({ accno, password }).then(user => {
    console.log(user);
    if (!user) {
      return {
        statusCode: 422,
        status: false,
        message: 'invalid credentials'
      }
    }
    if(req.currentAcno != user.acno){
      return {
        status: false,
        statusCode: 422,
        message: "Access denied"
      }
    }

    if (user.balance < amt) {
      return {
        status: false,
        statusCode: 422,
        message: "insufficent balance"
      }
    }
    user.balance -= amt;
    user.transaction.push({
      amount: amt,
      type: "debit"
    })
    user.save();
    return {
      status: false,
      statusCode: 422,
      message: `${amt} withdrawed & current balance is  ${user.balance}`
    }
  })
}


const transactionHistory = (acno) => {
 return db.User.findOne({acno}).then( user =>{
   if (!user){
    return {
      status: false,
      statusCode: 422,
      tranasction: "invalid operation"
    }
   }else{
    return {
      status: true,
      statusCode: 200,
      transaction: user.transaction
    }
   }
 }) 
  
}
const deleteAcc =(acno) =>{
return db.User.deleteOne({acno}).then(user =>{
  if(! user){
    return {
      status: false,
      statusCode: 422,
      tranasction: "invalid operation"
    }
  }
    return {
      status: true,
      statusCode: 200,
     message:"account deleted successfully"
    }
  })
}



module.exports = { register, login, deposit, withdraw, transactionHistory,deleteAcc }