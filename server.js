var app = require("express")();
var http = require("http").createServer(app);
const io = require("socket.io")(http);
const _ = require("lodash");

const productsData = require("./data/productsData.json");
const balanceData = require("./data/balanceData.json");

let newBalanceData = { ...balanceData };
let newTopProductsData = {};
let topCategories = { ...balanceData.top_categories };
let topProducts = { ...productsData.top_selling_products };
let categories = _.map(balanceData.top_categories, cat => {
  return { id: cat.id, name: cat.name };
});

// Changing specific datas per a min.
setInterval(() => {
  // Setting top categories data
  for (let i in topCategories) {
    topCategories[i] = {
      ...topCategories[i],
      total_sold_products_count:
        topCategories[i].total_sold_products_count +
        Math.floor(Math.random() * 100)
    };
  }

  newBalanceData = {
    ...balanceData,
    total_endorsement: newBalanceData.total_endorsement + 10000,
    total_order_count: newBalanceData.total_order_count + 2,
    total_profit:
      newBalanceData.total_profit + Math.floor(Math.random() * 10000),
    top_categories: { ...topCategories }
  };

  // Setting top products data
  for (let i in topProducts) {
    topProducts[i] = {
      ...topProducts[i],
      total_order_count:
        topProducts[i].total_order_count + Math.floor(Math.random() * 10)
    };
  }
  newTopProductsData = { ...topProducts };

   // Display log on server screen
   let time = new Date();
   console.log(
     ("0" + time.getHours()).slice(-2) +
       ":" +
       ("0" + time.getMinutes()).slice(-2) +
       ":" +
       ("0" + time.getSeconds()).slice(-2) +
       " Data was changed. Endorsement: " + newBalanceData.total_endorsement
   );
}, 5000);

// *****************************
// Socket.io Functions
// *****************************

io.on("connection", socket => {
  // When new user was connected
  console.log("New user connected:", socket.id);

  socket.on("fetchData", () => {
    io.emit("allData", newTopProductsData, newBalanceData);
    let timer = new Date();
    console.log(
      ("0" + timer.getHours()).slice(-2) +
        ":" +
        ("0" + timer.getMinutes()).slice(-2) +
        ":" +
        ("0" + timer.getSeconds()).slice(-2) +
        " DATA HAS ALREADY SENT!"
    );
  })

  socket.on('fetchCategories', () => {
    io.emit('getCategories', categories);
    console.log("CATEGORIES WERE SENT.")
  })

  // When user was disconnected
  socket.on("disconnect", reason => {
    console.log("Disconnected:", reason);
  });
});

// *****************************
// Server Main Functions
// *****************************

app.get("/products", function(req, res) {
  res.send(productsData);
});

app.get("/balance", function(req, res) {
  res.send(balanceData);
});

http.listen(process.env.PORT || 3010, function() {
  console.log("Listening on 3010 port..");
});
