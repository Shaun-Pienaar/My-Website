const express = require ('express');
const path = require('path');
const cors = require('cors');
const dataStore = require('nedb');
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

app.use(cors());
app.use(express.json());
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