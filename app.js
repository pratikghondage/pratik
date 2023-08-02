//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://pratikghondage:pr22ja1ghondage@cluster0.tmidzfq.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema ={
  name:String
};

const Item =mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"welcome to your todaolist"
});

const item2=new Item({
  name:"hit the button"
});
const item3=new Item({
  name:"hit the delete butoon"
});

const defaultItems=[item1,item2,item3];

const ListSchema={
  name:String,
  items:[itemsSchema]
};

const List =mongoose.model("List",ListSchema);

/*
Item.insertMany(defaultItems,).then (()=>console.log("sucessfuly saved in db "))
  .catch((err)=> {console.log(err);});*/
/*
app.get("/",(req, res) =>{
  Item.find({},).then(()=>function(foundItems){
  res.render("list.ejs", {listTitle:"Today", newListItems: foundItems})});
});*/

app.get("/", (req, res) => {
  Item.find({})
    .then((foundItems) => {
      if(foundItems.length==0){
        Item.insertMany(defaultItems,).then (()=>console.log("sucessfuly saved in db "))
        .catch((err)=> {console.log(err);});
        res.redirect("/");
      }else{
        res.render("list.ejs", { listTitle: "Today", newListItems: foundItems });
      }
    
    })
    .catch((err) => {
      console.error("Error finding items:", err);
      res.status(500).send("Internal Server Error");
    });
});


app.get("/:customListName", (req, res) => {
  const customListName=req.params.customListName;

  /*List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("doest 'exist");
      }else{
        console.log("exist");
      }
    }
  });*/

  const newListItems = [];
  async function findList(customListName) {
    try {
      const foundList = await List.findOne({ name:customListName });
  
      if (!foundList) {
        //console.log("doesn't exist");
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list.ejs", { listTitle: foundList.name, newListItems:foundList.Items});

      }
    } catch (err) {
      console.error(err);
    }
  }

  // Call the function with your customListName
  //const customListName = List;
  findList(customListName);

    
});



app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name:itemName
  });
  item.save();

  res.redirect("/");

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId,).then(()=>console.log("sucessfully deleted"),
  res.redirect("/"))
  .catch((err)=> {console.log(err);});
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
