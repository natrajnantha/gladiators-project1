
// Firebase API key and config info
var config = {
    apiKey: "AIzaSyDU0-8TCPFJZ0plW8FpNbol_2ASEi2P9no",
    authDomain: "mytestproject-a9444.firebaseapp.com",
    databaseURL: "https://mytestproject-a9444.firebaseio.com",
    projectId: "mytestproject-a9444",
    storageBucket: "mytestproject-a9444.appspot.com",
    messagingSenderId: "607170265615"
  };
  
firebase.initializeApp(config);

var database = firebase.database();
var expenseReport = database.ref('expensedb/expense');
var runningTotal = 0;
var expenseRepObj = [];
var numberofentries= 0;

// The child_added event triggers first time during page load and then everytime when a expense object is added to the firebase db. 
expenseReport.on("child_added", function(childSnapshot) {

  // Store everything into a variable.
  var roommateName = childSnapshot.val().name;
  var item = childSnapshot.val().item;
  var purchasedate = childSnapshot.val().dop;
  var storeName = childSnapshot.val().store;
  var storeLocation = childSnapshot.val().location
  var itemRate = childSnapshot.val().rate;


// The expense object data structure that captures the room user expense info and stores to the firebase database. The same is received in this child_added event and 
// gets stored in the array
  var newExpense = {
    name: roommateName,
    item: item,
    dop: purchasedate,
    store: storeName,
    location: storeLocation,
    rate: itemRate
  };


  console.log("Adding to the array");
  expenseRepObj.push(newExpense);
  numberofentries++;

  // Employee Info
  console.log(roommateName);
  console.log(item);
  console.log(purchasedate);
  console.log(storeName);
  console.log(storeLocation);
  console.log(itemRate);

  var dopFormated = moment.unix(purchasedate).format("MM/DD/YYYY");

  runningTotal += parseFloat(itemRate);
  console.log(runningTotal);

  // Create the new row========================================
  var newRow = $("<tr>").append(
    $("<td>").text(roommateName),
    //added class for gif api(Arsh)----------------------------------------------------------
    $('<a href="#ex1" rel="modal:open" class="listItem"></a>').text(item),
    //added class for gif api(Arsh)----------------------------------------------------------
    $("<td>").text(dopFormated),
    $("<td>").text(storeName),
    $("<td>").text(storeLocation),
    $("<td>").text(itemRate),
    $("<td>").text(runningTotal)
  );

  

  // Append the new row to the table
  $("#roommate-table > tbody").append(newRow);



  // (Arsh)Giphy api-----------------------------------------------------------------
//on click variable to retrieve celebrity name from button for query URL
var name = $(".listItem").click(function () {
  console.log(this.innerHTML);
  name = this.innerHTML;

  var queryURL = "https://api.giphy.com/v1/gifs/search?q=" +
      name + "&api_key=8hSW7KTGpdnQtB2M4voxHQE9E9pscp04&limit=1";

  // AJAX call
  $.ajax({
      url: queryURL,
      method: "GET"
  }).then(function (response) {
      console.log(response);
      var results = response.data;

      // clear gifs off the page
      $("#gifs-appear-here").empty();
      for (var i = 0; i < results.length; i++) {
          var gifDiv = $("<div>");
          var itemImage = $("<img>");
            itemImage.attr("src", results[i].images.fixed_height.url); 
          
            //   appends gif and rating
          gifDiv.append(itemImage);
          $("#gifs-appear-here").append(gifDiv);
      }
      // When the user clicks on report item, open the gif popup(module)
  function myFunction() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}
  });
});
// (Arsh)Giphy api-----------------------------------------------------------------


});
