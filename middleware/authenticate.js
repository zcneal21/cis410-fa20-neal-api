const jwt = require("jsonwebtoken")
const config = require("../config")

const db = require("../dbConnectExec")

const auth = async(req, res, next) => {
    // console.log(req.header('Authorization'))
    try{
        //1. Decode token

        let myToken = req.header('Authorization').replace('Bearer ', '')
        // console.log(myToken)
        let decodedToken = jwt.verify(myToken, config.JWT)
        // console.log(decodedToken)

        let CustomerID = decodedToken.pk
        // console.log(CustomerID)

        //2. Compare with db token

        let query = `SELECT CustomerID, FirstName, LastName, email
        FROM Customer
        WHERE CustomerID = ${CustomerID} and Token = '${myToken}'
          `


         let myReturnedUser = await  db.executeQuery(query)

        //  console.log(myReturnedUser)
        //3. save user information in req

        if(myReturnedUser[0]){
            req.customer = myReturnedUser[0]
            next()
        }
        else{
            res.status(401).send("Authentication Failed")
        }

    }catch(myError){
        res.status(401).send("Authentication failed")
    }
}

module.exports = auth