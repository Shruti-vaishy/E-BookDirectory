const express = require("express");
const bookmodel = require("./models/bookmodel.js");
const usermodel = require("./models/usermodel.js");
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require("path");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const { error } = require("console");


app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());

 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images');
    },
    filename: function (req, file, cb) {
      crypto.randomBytes(12,function(err,name){
        const fn  = name.toString("hex") + path.extname(file.originalname);      
      cb(null, fn);
    });
}
});
const upload = multer({ storage: storage })

app.get('/',(req,res) => {
    res.redirect('/registration');
})

app.get('/registration',(req,res) => {
    res.render("registration");
})
app.get('/login',(req,res) => {
    res.render("login");
})

app.get("/addbook",isLoggedIn,async(req,res) => {
    const user = await usermodel.findOne({username:req.body.user})
    res.render("addbook");
})

app.get("/homepage",isLoggedIn,async (req,res) => {
    const user =
    await usermodel.
    findOne({username:req.body.user})
    .populate("books");
    res.render('homepage',{user});

 });

 app.get('/show/posts',isLoggedIn,async function(req,res,next){
    const user = 
    await userModel.
    findOne({username:req.body.user})
    .populate("books")    
    res.render('show');
});

app.get('/logout',(req,res) => {
    res.cookie("token","");
    res.redirect("/registration");
});

app.post('/registration',async function(req,res){    
    let {email,password,username}= req.body;    
    let checked_user = await usermodel.findOne({email});
    if(checked_user) return res.redirect("/login");

    bcrypt.genSalt(10,(err,salt) => {
        bcrypt.hash(password,salt, async(err,hash) => {
            let user = await usermodel.create({
                username,
                email,
                password: hash
            });
            let token = jwt.sign({email:email,userid:user._id},"shhhh");
            res.cookie("token",token);           
             
            res.redirect('/login');          
        });
    })
})

app.post('/login',async function(req,res){
    let {email,password}= req.body;    
    let user = await usermodel.findOne({email});
    if(!user) return res.status(500).send("Something went wrong");
    bcrypt.compare(password,user.password,function(err,result){
        if(result) {
            let token = jwt.sign({email,userid:user._id},"shhhh");
            
            res.cookie("token",token);
            res.status(200).redirect("/homepage");
        }
        else {  
            res.render("login",{error:"Invalid username or password"});
           }        
    })         
});

app.post('/bookpost',isLoggedIn,upload.single('image'),async function(req,res) {
    const user = await usermodel.findOne({username:req.body.user});
    const Book = await bookmodel.create({
        user: user._id,
        publisheddate: req.body.publisheddate,
        book: req.body.book,
        image:req.file.filename
    })
    user.books.push(Book._id);
    await user.save();
        res.redirect("/homepage");
});

function isLoggedIn(req,res,next){
    if(req.cookies.token === ""){
        res.redirect("/registration");
    }
    else{
       let data = jwt.verify(req.cookies.token,"shhhh");
       req.user = data;
       next();
    }

    
}

app.listen(process.env.PORT || 3000);