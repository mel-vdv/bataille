
'use strict';
const app = require('express')();
const http = require('http').Server(app);
const serveurIo = require('socket.io')(http, {
    cors: {
        origin: "*",
        "Access-Control-Allow-Origin": "*"
    }
});
//const port = process.env.PORT || 3456;
const port = 3456;
const MongoClient = require('mongodb').MongoClient;
//const urldb = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const urldb = "mongodb://127.0.0.1:27017";
//--------------------------------------------
const session = require('express-session');
app.use(session({
    secret: 'secretpasswordblog',
    resave: false,
    saveUninitialized: true
}));
let datas = {};
app.use((req, res, next) => {
    datas = app.locals;
    app.locals = {};
    datas.session = req.session;
    next();
})
//--------------

//********************************************************** */
serveurIo.on("connection", socket => {
    console.log("connexion socket");

    //////////////////////////////////////////////////////////////
    //   component CONNECT et STAT  : LA COLLECTION  JOUEURS
    /////////////////////////////////////////////////////////////
   //******************************************************* */
   socket.on('co', quiestco => {
    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('cartes').collection('joueurs');
        coll.find({ pseudo: quiestco }).toArray((e, d) => {
            let reponse;
            if (d.length > 0) {
                reponse = true;
                coll.updateOne({ pseudo: quiestco }, { $set: { "coOrNot": 'co' } });
            }
            else {
                reponse = false;
                console.log('joueur inconnu, merci de vous inscrire.');
            }
            socket.emit("coS", reponse);
            serveurIo.emit('majlistJoueurs');
        });

    });
});
//******************************************************* */
socket.on('deco', quiestco => {
    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('echecs').collection('joueurs');

        coll.updateOne({ "pseudo": quiestco }, { $set: { "coOrNot": "deco" } });

    });
    serveurIo.emit('majlistJoueurs');
});
//******************************************************* */  
    socket.on('autresJoueurs', quiestco => {
        MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
            const coll = cli.db('cartes').collection('joueurs');
            coll.find({ pseudo: { $ne: quiestco } }).toArray((e, d) => {
                let list = d;
                socket.emit('autresJoueursS', list);
            });
            
        });
    });
//******************************************************* */
     socket.on('nouveau', quiestco => {
        MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
            const coll = cli.db('cartes').collection('joueurs');
            coll.find({ pseudo: quiestco }).toArray((e, d) => {
                let reponse;
                if (d.length > 0) {
                    reponse = false;
                }
                else {
                    reponse = true;
                    coll.insertOne(
                        {
                            "pseudo": quiestco,
                            "coOrNot": "deco",
                            "demandeA": [],
                            "invitePar": [],
                            "jeuEnCours": [],
                            "win": [],
                            "lost": [],
                        }
                    );
                }
                socket.emit('nouveauS', reponse);
            });
        });
    });

 //******************************************************* */
 socket.on('inviter', prop => {
    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('cartes').collection('joueurs');
        coll.updateOne({ "pseudo": prop.quiestco }, { $push: { "demandeA": prop.joueurB } });
        coll.updateOne({ "pseudo": prop.joueurB }, { $push: { "invitePar": prop.quiestco } });

        socket.emit('inviterS');
        serveurIo.emit('majEtatsS', prop);

    });
});
//******************************************************* */
socket.on('accepter', duo => {
    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('cartes').collection('joueurs');
        coll.updateOne({ "pseudo": duo.joueurB }, { $pull: { "demandeA": duo.quiestco } });
        coll.updateOne({ "pseudo": duo.quiestco }, { $pull: { "invitePar": duo.joueurB } });
        coll.updateOne({ "pseudo": duo.quiestco }, { $push: { "jeuEnCours": duo.joueurB } });
        coll.updateOne({ "pseudo": duo.joueurB }, { $push: { "jeuEnCours": duo.quiestco } });

        socket.emit('accepterS');
        serveurIo.emit('majEtatsS', duo);
    });
});
//************************************************************************************* */
socket.on('creer', duo => {
    let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    let un = Math.floor(Math.random() * 24);
    let deux = Math.floor(Math.random() * 24);
    let trois = Math.floor(Math.random() * 24);
    let numeroAleatoire = alphabet[un] + alphabet[deux] + alphabet[trois];

    console.log(numeroAleatoire);

    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('cartes').collection('parties');

        coll.insertOne({
            "statut": 'enCours', //'finie'
            "numero": numeroAleatoire, 
            "joueur1": duo.joueur1,
            "joueur2": duo.joueur2,
            "auTourDe": duo.joueur1,
            "score1": 0,
            "score2": 0,
            "clics":0,
            "tas" : [
            '2coeur', '2trefle', '2pique', '2carreau',
            '3coeur', '3trefle', '3pique', '3carreau',
            '4coeur', '4trefle', '4pique', '4carreau',
            '5coeur', '5trefle', '5pique', '5carreau',
            '6coeur', '6trefle', '6pique', '6carreau',
            '7coeur', '7trefle', '7pique', '7carreau',
            '8coeur', '8trefle', '8pique', '8carreau',
            '9coeur', '9trefle', '9pique', '9carreau'
            ],
            "sixCartes": []
        }
        );
    });
});
//*************************************************************************** */
socket.on('quelCode', duo => {
    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('cartes').collection("parties");
        coll.find({ joueur1: { $in: [duo.joueurB, duo.quiestco] }, joueur2: { $in: [duo.joueurB, duo.quiestco] }, statut: 'enCours' }).toArray((e, d) => {
            let code = d[0].numero;
            socket.emit('quelCodeS', code);
        });
    });
});
//*************************************************** */
socket.on('rejoindre', num=> {
    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('cartes').collection("parties");
        coll.find({numero: num}).toArray((e,d)=>{
            let partie = d[0];
            socket.emit('rejoindreS', partie);
        });
    });
});
//*************************************************** */
socket.on('retourner', x=> {
    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('cartes').collection("parties");
        coll.updateOne({numero: x.num}, {$set: {
            score1: x.score1,
            score2 : x.score2,
            sixCartes: x.sixCartes
        }});    
            serveurIo.emit('maj', x.num);
            socket.emit('retournerS');
        });
    });

//*************************************************** */
socket.on('auSuivant', x=> {
    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('cartes').collection("parties");
        coll.updateOne({numero: x.num}, {$set: {'auTourDe': x.adv}});    
            serveurIo.emit('maj', x.num);
        });
    });
    //*************************************************** */
socket.on('renouveller', x => {
    MongoClient.connect(urldb, { UseUnifiedTopology: true }, (er, cli) => {
        const coll = cli.db('cartes').collection("parties");
        coll.updateOne({numero: x.num}, {$set: {
            'sixCartes': x.sixCartes,
            'tas': x.tas
        }});    
            serveurIo.emit('maj', x.num);
        });
    });

//*************************************************** */
});

http.listen(port, () => {
    console.log(`port ${port} sur écoute`);
});