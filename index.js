
//import stmt in node
const express = require('express');

//importing session
const session =require('express-session')
 
// importing jwt
const jwt =require('jsonwebtoken')

const dataService=require('./services/data.service')

//create application using express

const app=express();


const cors=require('cors')
//to generate session id
app.use(session({
    secret:'randomSecretKey', // for creating id
    resave:false, //to save value which is not updated
    saveUninitialized : false //to save  saveUninitialized value
}))


//to parse json data
app.use(express.json());


app.listen(3000,'localhost',()=>{
    console.log('server is up..');
})


//setting cors
app.use(cors({
    origin:"http://192.168.1.6:8080",
    //origin:'http://localhost:4200',

    credentials:true
}))
//creating middleware


// creating jwt middlware

const jwtmiddleware =(req,res,next) =>{
  try{
    const token =req.headers['access-token']
    const data = jwt.verify(token,'supersecret123123');
    req.currentAcno =data.currentNo
    next()
  }  catch{
    const result = ({
        statusCode:401,
        status:false,
        message:'Please login'
      })
      res.status(result.statusCode).json(result);
  }
}



//jwt testing api

app.post('/token',jwtmiddleware,(req,res) =>{
    res.send('Current Acno : '+ req.currentAcno)
})

//Application specific middleware
app.use( (req,res,next) => {
console.log('middleware');
next();
})
 
//router specific middleware
const authMiddleWare=(req,res,next) =>{
    if(!req.session.currentNo){
    const result = ({
          statusCode:401,
          status:false,
          message:'Please login'
        })
        res.status(result.statusCode).json(result);

    }else{
        next();
    }
      
}




//resolving HTTP method

//GET method
app.get('/',(req,res)=>{
    res.status(401).send('GET Request resolved , only GET has view !!')
})

app.post('/',(req,res)=>{
    res.send('POST Request resolved')
})

app.delete('/',(req,res)=>{
    res.send('DELETE Request resolved')
})

app.put('/',(req,res)=>{
    res.send('PUT Request resolved')
})

app.patch('/',(req,res)=>{
    res.send('PATCH Request resolved')
})

//Bank APP 

//Register 
app.post('/register',(req,res) =>{

    console.log(req);
dataService.register(req.body.uname,req.body.acno,req.body.password,req.body.blnc)
.then(result =>{
    res.status(result.statusCode).json(result)
})


//res.send(result.message);
    //dataService.register(acno,password,uname)
});

app.post('/login',(req,res) => {
    console.log(req);
    dataService.login(req.body.acno,req.body.password).then(result =>{
        res.status(result.statusCode).json(result)
    })
    //res.send(result.message);
    // to get the response as json  // to set response statusCode 
    //res.status(result.statusCode).json(result);

})


app.post('/deposit',(req,res) =>{
    dataService.deposit(req.body.acno,req.body.password,req.body.amount).then(result =>{
        res.status(result.statusCode).json(result)
    })

})

app.post('/withdraw',jwtmiddleware,(req,res) =>{
    dataService.withdraw(req,req.body.acno,req.body.password,req.body.amount).then(result =>{
        res.status(result.statusCode).json(result)
    })

})

app.post('/transactionHistory',jwtmiddleware, ( req,res) => {
    dataService.transactionHistory(req.currentAcno).then(result=>{
        res.status(result.statusCode).json(result)
    } )
 

})

app.delete('/deleteAcc/:acno',jwtmiddleware, ( req,res) => {
    console.log("acno :"+req.params.acno);

    dataService.deleteAcc(req.params.acno).then(result=>{
        res.status(result.statusCode).json(result)
    } )
 

})

