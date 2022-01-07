const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-api-3453f-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const express = require('express');
const authMiddleware = require('./authMiddleware');
const app = express();
const db = admin.firestore();
app.use(authMiddleware);
const cors = require('cors');
app.use(cors({origin: true}));

app.get('/hello', (req, res) => {
    return res.status(200).send('Hello world44');
});

app.post('/api/create', (req, res) => {
    (async ()=> {
        try {
            await db.collection('products').doc('/' + req.body.id + '/').create({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price
            })
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error)
        }
    })();
});
app.get('/api/read/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('products').doc(req.params.id);
            let product = await document.get();
            let response = product.data();
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error)
        }
    })();
});

app.get('/api/read', (req, res) => {
    (async () => {
        try {
            let query = db.collection('products');
            let response = [];
            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;

                for(let doc of docs)
                {
                    const selectedItem = {
                        id: doc.id,
                        name: doc.data().name,
                        description: doc.data().description,
                        price: doc.data().price
                    }
                    response.push(selectedItem);
                }
                return response;
            })
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error)
        }
    })();
});

app.put('/api/update/:id', (req, res) => {
    (async () => {
        try {
           const document = db.collection('products').doc(req.params.id);
           await document.update({
               name: req.body.name,
               description: req.body.description,
               price: req.body.price
           })
           
           return res.status(200).send()
        } catch (error) {
            console.log(error);
            return res.status(500).send(error)
        }
    })();
});

app.put('/api/delete/:id', (req, res) => {
    (async () => {
        try {
           const document = db.collection('products').doc(req.params.id);
           await document.delete();
           return res.status(200).send()
        } catch (error) {
            console.log(error);
            return res.status(500).send(error)
        }
    })();
});

exports.app = functions.https.onRequest(app);