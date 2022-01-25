//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://shinjini03:15JUly1969$@cluster0.skobf.mongodb.net/TodolistDB",{useNewUrlParser:true});

const itemSchema={
  name:String
};
const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Cook food"
});
const item2=new Item({
  name:"Eat Food"
});
const item3=new Item({
  name:"Do the dishes"
});
const defaultArray=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);

// Item.insertMany(defaultArray,function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Successfully saved the default items to TodolistDB")
//   }
// });

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultArray,function(err){
       if(err){
      console.log(err);
     }
      else{
    console.log("Successfully saved the default items to TodolistDB")
  }
  });
  res.redirect("/");
    }else{
    // console.log(foundItems);
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName=="Today")
  {item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundLists){
      foundLists.items.push(item);
      foundLists.save();
      res.redirect("/" + listName);
    })
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});
app.post("/delete",function(req,res){
  const checkedItemsId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName=="Today"){
  Item.findByIdAndRemove(checkedItemsId,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully deleted the checked item!")
      res.redirect("/");
    }
  })
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemsId}}},function(err,foundLists){
    if(!err){
      console.log("Successfully deleted the checked item from the particular list!");
      res.redirect("/" + listName);
    }
  });
}
})

app.get("/:customListName", function(req,res){
  // res.render("list", {listTitle: "Work List", newListItems: workItems});
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundLists){
    if(!err){
      if(!foundLists){
        // console.log("Doesnt exist");
        //create a new list
        const list=new List({
          name:customListName,
          items:defaultArray
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        // console.log("Exists!");
        //show an existing list
        res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started on port successfully");
});
