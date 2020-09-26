const express = require ('express');
const path = require('path');
const cors = require('cors');
const dataStore = require('nedb');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require("axios");
const crypto = require("crypto");
const dns = require('dns');

//require('dotenv').config();

const app = express();
const dataBase = new dataStore({filename:'database.db', autoload:true});
const port = process.env.PORT || 3000;

let astroidGameHighscores = [];

//Load Astroid game highscores from database
dataBase.find({}, (err, data) =>{
    if(err){
        console.log('Cannot find data');
        console.log(err);
    }
    else{
        astroidGameHighscores = data;
    }
});

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname,'views/index.html'));
});

app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname,'views/projects.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/contact.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname,'views/game.html'));
});

app.get('/donation', (req, res) => {
    //res.sendFile(path.join(__dirname,'views/donation.html'));
    fs.readFile('items.json', (err, data) => {
        if(err){
            res.status(500).end();
        }
        else{
            res.render('donation.ejs', {
                items: JSON.parse(data)
            })
        }
    })
});

app.post('/getPaymentData', (req, res) => {
    fs.readFile('items.json', (err, data) => {
        if(err){
            res.status(500).end();
        }
        else{
            let itemList = JSON.parse(data).donations;
            let cartTotal = 0;
            let orderNr = '';
            for(let i = 0; i < req.body.items.length; i++){
                let quantity = parseInt(req.body.items[i].quantity);
                let id = parseInt(req.body.items[i].id);
                orderNr += id.toString() + ',' + quantity.toString() + ':';
                let price = 0;
                for(let j = 0; j < itemList.length; j++){
                    if(itemList[j].id == id){
                        price = itemList[j].price;
                    }
                }
                let amount = price * quantity;
                cartTotal += amount;
            }
            orderNr = orderNr.slice(0,orderNr.length-1);
            if(orderNr == ''){
                orderNr = 'emptyOrder';
            }

            const paymentData = {};

            //Set variables for online transactions with payfast

            // Merchant details
            paymentData["merchant_id"] = process.env.PAYFAST_MERCHANT_ID;
            paymentData["merchant_key"] = process.env.PAYFAST_MERCHANT_KEY;
            //......paymentData["return_url"] = "http://www.yourdomain.co.za/return_url";
            //......paymentData["cancel_url"] = "http://www.yourdomain.co.za/cancel_url";
            paymentData["notify_url"] = process.env.PAYFAST_NOTIFY_URL;
            // Buyer details
            if(req.body.data.first != 'optional' && req.body.data.first != ''){
                paymentData["name_first"] = req.body.data.first;
            }
            if(req.body.data.last != 'optional' && req.body.data.last != ''){
                paymentData["name_last"] = req.body.data.last;
            }
            if(req.body.data.email != 'optional@gmail.com' && req.body.data.email != ''){
                paymentData["email_address"] = req.body.data.email;
            }
            if(req.body.data.number != '0820000000' && req.body.data.number != ''){
                paymentData["cell_number"] = req.body.data.number;
            }
            // Transaction details
            //......paymentData["m_payment_id"] = "1234";
            paymentData["amount"] = (cartTotal/100).toString();
            paymentData["item_name"] = orderNr;
            // Transaction options
            paymentData["email_confirmation"] = '1';
            paymentData["confirmation_address"] = 'sfpienaar1990@gmail.com';
            // Payment methods
                // Used only to limmit payment methods
                //paymentData["payment_method"] = 'eft';

            // Generate signature
            paymentData["signature"] = generateSignature(paymentData);

            res.json(paymentData);
        }
    })
});

app.post('/itn', (req, res) => {
    res.status(200).end();

    const testingMode = false;
    const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";

    const pfData = JSON.parse(JSON.stringify(req.body));

    if(!pfData){
        return;
    }

    let pfParamString = "";
    for (let key in pfData) {
        if(pfData.hasOwnProperty(key) && key !== "signature"){
            pfParamString +=`${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
        }
    }
    // Remove last ampersand
    pfParamString = pfParamString.slice(0, -1);

    const check1 = pfValidSignature(pfData, pfParamString);
    const check2 = pfValidIP(req);
    const check3 = pfValidPaymentData(pfData);
    const check4 = pfValidServerConfirmation(pfHost, pfParamString);

    let itemList;
    let msg = '';
    let status = '';

    if(check1 && check2 && check3 && check4) {
        // All checks have passed, the payment is successful
        status = 'Payment successful'
    }
    else{
        // Some checks have failed, check payment manually and log for investigation
        if(!check1 || !check3){
            //Invallid data
            status = 'Invalid data!'
        }
        if(!check2 || !check4){
            //Invalid IP
            status = 'Invalid IP';
        }
    }

    fs.readFile('items.json', (err, data) => {
        if(err){
            itemList = [];
            console.error(err);
            msg = 'An error occured!\nPls check your server or contact the person in charge of maintaining your server\n\nGood day.';
        }
        else{
            itemList = JSON.parse(data).donations;
            let orderNr = pfData["item_name"];
            let itemInfo = orderNr.split(":");
            
            msg = '\t\t\tOrder\n\n';
            msg += 'Satus:\t\t\t\t' + status + '\n';
            msg += 'Order Nr:\t\t\t' + pfData["item_name"] + '\n';
            msg += 'Customer:\t\t\t' + pfData["name_first"] + ' ' + pfData["name_last"] + '\n';
            msg += 'Customer email:\t\t' + pfData["email_address"] + '\n';
            if(pfData["cell_number"]){
                msg += 'Customer cell nr:\t' + pfData["cell_number"] + '\n';
            }
            msg += 'Order:\t\t\t\t'
            for(let j = 0; j < itemInfo.length; j++){
                if(j != 0){
                    msg += '\t\t\t\t\t';
                }
                let info = itemInfo[j].split(",");
                let id = parseInt(info[0]);
                let quantity = parseInt(info[1]);
                for(let i = 0; i < itemList.length; i++){
                    if(itemList[i].id == id){
                        msg += quantity.toString() + ' of ' + itemList[i].name + '\n';
                        break;
                    }
                }
            }
            msg += 'Total:\t\t\t\t' + pfData["amount_gross"] + '\n';

            let transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                   user: process.env.EMAIL_ADDRESS,
                   pass: process.env.EMAIL_PASSWORD
                }
            });
            const message = {
                from: 'risingdev.server@gmail.com', // Sender address
                to: 'sfpienaar1990@gmail.com',      // List of recipients
                subject: 'Sales Order',             // Subject line
                text: msg                           // Plain text body
            };
            transport.sendMail(message, function(err, info) {
                if (err) {
                  //console.log(err)
                } else {
                  //console.log(info);
                }
            });
        }
    })
});

app.get('/highscores', (req, res) => {
    res.json(astroidGameHighscores);
});

app.post('/highscores', (req, res) => {
    let newScoresList = req.body;
    if(!(newScoresList instanceof Array)){
        res.json({msg:'Invalid request. Please check the url.'});
    }
    else{
        for(let i = 0; i < newScoresList.length; i++){
            if(!scoreExists(newScoresList[i])){
                addHighscore(newScoresList[i].name, newScoresList[i].score);
            }
        }
        for(let i = 0; i < astroidGameHighscores.length; i++){
            dataBase.update({_id: 'id'+(i+1)}, {$set:{name:astroidGameHighscores[i].name,score:astroidGameHighscores[i].score}}, {});
        }
        res.json({msg:'Successfully updated highscores'});
    }
});

app.listen(port, () => console.log(`Listening on port:${port}!`));

function generateSignature(data, passPhrase = null){
    // Create parameter string
    let pfOutput = "";
    for (let key in data) {
        if(data.hasOwnProperty(key)){
            if (data[key] !== "") {
                pfOutput +=`${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, " + ")}&`
            }
        }
    }
  
    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null) {
        getString +=`&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(getString).digest("hex");
}

function pfValidSignature(pfData, pfParamString, pfPassphrase = null ){
    // Calculate security signature
    let tempParamString = '';
    if (pfPassphrase !== null) {
        pfParamString +=`&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
    }
  
    const signature = crypto.createHash("md5").update(pfParamString).digest("hex");
    
    return pfData['signature'] === signature;
}

async function ipLookup(domain){
    return new Promise((resolve, reject) => {
        dns.lookup(domain, {all: true}, (err, address, family) => {
            if(err) {
                reject(err)
            }
            else{
                const addressIps = address.map(function (item){
                    return item.address;
                });
                resolve(addressIps);
            }
        });
    });
}
  
async function pfValidIP(req){
    const validHosts = [
      'www.payfast.co.za',
      'sandbox.payfast.co.za',
      'w1w.payfast.co.za',
      'w2w.payfast.co.za'
    ];
  
    let validIps = [];
    const pfIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
    try{
        for(let key in validHosts) {
            const ips = await ipLookup(validHosts[key]);
            validIps = [...validIps, ...ips];
        }
    }
    catch(err){
        console.error(err);
    }
  
    const uniqueIps = [...new Set(validIps)];
  
    if(uniqueIps.includes(pfIp)){
        return true;
    }
    return false;
}

function pfValidPaymentData(pfData){
    return parseFloat(pfData['amount_gross']) >= 1.00;
}

async function pfValidServerConfirmation(pfHost, pfParamString){
    const result = await axios.post(`https://${pfHost}/eng/query/validate`, pfParamString)
        .then((res) => {
            return res.data;
        })
        .catch((error) => {
            console.error(error)
        });
    return result === 'VALID';
}

function addHighscore(name, score){
    //If score to add is less than lowest score in existing highscores just return
    if(score <= astroidGameHighscores[astroidGameHighscores.length-1].score){
        return;
    }
    for(let i = 0; i < astroidGameHighscores.length; i++){
        //Else compare score to each astroidGameHighscore, add to appropriate
        //place and remove bottom score from old highscores.
        if(score > astroidGameHighscores[i].score){
            let obj = {name:name, score:score};
            astroidGameHighscores.splice(i, 0, obj);
            astroidGameHighscores.pop();
            break;
        }
    }
}

//Function to check if a score already exists in highscores
function scoreExists(scoreObj){
    for(let i = 0; i < astroidGameHighscores.length; i++){
        if(scoreObj.name === astroidGameHighscores[i].name && scoreObj.score === astroidGameHighscores[i].score){
            return true;
        }
    }
    return false;
}