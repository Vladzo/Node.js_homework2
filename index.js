const express = require('express');
const expressHbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');

const app = express();

app.listen(3000, () => {
    console.log('App listen 3000');
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.engine('.hbs', expressHbs({
    defaultLayout: false
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'static'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/users', (req, res) => {
    _getUsers().then(users => {
        res.render('users', {users});
    })
});

app.get('/users/:userId', (req, res) => {
    const {userId} = req.params;

    _getUsers().then(data => {
        const user = data.find(user => user.id.toString() === userId);

        res.render('singleUser', {user});
    })
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.post('/login', (req, res) => {
    const {email, password} = req.body;

    _getUsers().then( users => {
        const user = users.find(user => user.email === email);

        if (!user || user.password !== password) {
            res.render('error', {errorMassage: "This user not found. You need to register!"});
            return;
        }

        res.redirect(`users/${user.id}`);
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const {email, password, phone, website, name} = req.body;

    _getUsers().then(users => {
        const user = users.find(user => user.email === email);
        const newUser = {
            id: users.length + 1,
            email,
            name,
            password,
            phone,
            website
        };

        if (user) {
            res.render('error', {errorMassage: "This email address already exists"});
            return;
        }

        users.push(newUser);

        fs.writeFile(path.join(__dirname, 'dbUsers.txt'), JSON.stringify(users), err => {
            if (err) {
                return;
            }
        });

        res.redirect(`users/${newUser.id}`);
    });
});

function _getUsers() {
    return new Promise(resolve => {
        fs.readFile(path.join(__dirname, "dbUsers.txt"), (err, data) => {
            if (err) {
                console.log(err);
                return;
            }

            resolve(JSON.parse(data.toString()));
        })
    })
}
