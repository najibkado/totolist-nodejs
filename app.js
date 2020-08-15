const express = require("express");
const parser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(parser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true  });

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Item=  mongoose.model("Item", itemsSchema);

const newItem = new Item ({
    name: "Cook"
});

const newItem1 = new Item ({
    name: "Cook"
});

const newItem2 = new Item ({
    name: "Cook"
});

const defaultItem = [newItem, newItem1, newItem2];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find({}, function (err, results) {

        if (err) {
            console.log(err);

        } else if (results.length === 0) {

            Item.insertMany(defaultItem, function (err) {
                if (err) {
                    console.log(err);

                } else {
                    console.log("Successfull!");

                }
            });

            res.redirect("/");
        } else {

            res.render("list", {
                listTitle: "Today",
                newListItems: results
            });

        }


    });


});

app.post("/", function (req, res) {
    const todoItem = req.body.todoItem;
    const listName = req.body.list;

    const item = new Item({
        name: todoItem
    });

    if (listName === "Today") {

    item.save();
    res.redirect("/");

    } else{
        List.findOne({name: listName}, function (err, results) {
            results.items.push(item);
            results.save();
            res.redirect("/" + listName);
        });
    }



});

app.post("/delete", function (req, res) {
    const itemToDelete = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findOneAndDelete(itemToDelete, function (err) {
            if (!err) {
                res.redirect("/");

            }
        });
    } else {
        List.findOneAndUpdate(
            { name: listName,},
            {$pull: {items: {_id: itemToDelete}}},
            function (err, results) {
                if (!err) {
                    res.redirect("/" + listName);
                }
            }
        )
    }

});

app.get("/:dynamicList", function (req, res) {
    const link = req.params.dynamicList;

    List.findOne({name: link}, function (err, results) {

        if (!err) {

            {  if (results) {
                console.log("Exist!");

                res.render("list", {listTitle: results.name, newListItems: results.items });

            } else {

                const list = new List({
                    name: link,
                    items: defaultItem
                });

                list.save();

                res.redirect("/" + list.name);

            }
            }
        }

    });

});

app.post("/:dynamicList", function (req, res) {
    const item = req.body.todoItem;
    customLists.push(item);
    res.redirect("/");
});

app.get("/about", function (req, res) {
    res.render("about");
})

app.listen("3000", function (req, res) {
    console.log("server runing on port 3000");
});
