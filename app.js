//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//create new dB,
const uri = `mongodb+srv://aakash-admin:${process.env.mongo_pass}@cluster0.xbhj9.mongodb.net/todolistDB`;
// console.log("here",process.env.mongo_pass);
mongoose.connect(uri, {
  useNewUrlParser: true
});
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
// //schema
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
//add items
const item1 = new Item({
  name: "Welcome to your todolist!!!"
});

const item2 = new Item({
  name: "Hit the + button to add items !!!"
});

const defaultItems = [item1, item2];
//insert into db
//listSchema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);

        } else {
          console.log('done ...!!');
        };
      });
      res.redirect('/');
    } else {
      //get items
      if (err) {
        console.log(error);
      } else {
        //pass items from db to newListitem
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      }
    }
  });
});

app.post("/", function(req, res) {


  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName == "Today")
  {item.save();
  res.redirect("/");}
  else{
    List.findOne({name : listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post('/delete', function(req, res) {
  // console.log('triggered');
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == 'Today'){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  }
  else {
    List.findOneAndUpdate({name: listName},{$pull: {items : {_id : checkedItemId}}},function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }



});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // console.log('NO');
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        // console.log('exists');
        // show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// app.listen(port);

app.listen(port, function() {
  console.log("Server started on port 3000");
});
