
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
var expenseRef = database.ref('expensedb/expense');
var runningTotal = 0;
var expenseArrayObj = [];
var numberofentries = 0;
// The roommates info master Array. This could be modified to dynamically populate once from the firebase db. Can be used thru out 
// the web application to populate Name dropdown in Mike's routine and also in the chart sections from Arsh routine. Lets keep this
// as a hard coded array for now and later depending on time we can always convert to read once during load from firebase.
var roomUserArray = [{name:"Arsh",amtSpent:0,owes:0},{name:"Raj",amtSpent:0,owes:0},{name:"Mike",amtSpent:0,owes:0},{name:"Patrick",amtSpent:0,owes:0}];


// The below submit button is a driver routine to simulate Mike's Expense submit routine. This click event routine would get replaced with Mike's code
//  during integration
$("#add-expense-btn").on("click", function(event) {
  event.preventDefault();

var roommateName = "Patrick";
var item = "Groceries";
var purchasedate = moment("09/09/2018").format("X");
var itemRate = 35.00;
var storeName = "Ralphs";
var storeLocation = "Woodland Hills";

// This is the datastructure thats heavily used in downstream logic and gets stored in firebase. So keep the variable names same as below
// in other routines during integration
  var newExpense = {
    name: roommateName,
    item: item,
    dop: purchasedate,
    store: storeName,
    location: storeLocation,
    rate: itemRate
  };

  expenseRef.push(newExpense);
  console.log("Expense successfully added");
});


// The below value event routine computes the amount owed by the room user and also calculates the expense tracking summary that gets appended to the summary-table div. 
expenseRef.on("value", function(childSnapshot) {
// Process the roomUserArray object to determine how much each owes. Please note that the amount spent is already determined during the child_added firebase event. 
// the value event triggers after the child_added event completes so this would be the logical place to compute the amount owed. 
  for (let i = 0; i < roomUserArray.length; i++) {
      roomUserArray[i].owes = roomUserArray[i].amtSpent - (runningTotal / roomUserArray.length);
  }

  // Call Bubble sort routine to sort the arry by acending order of amount owed
  bubbleSort(roomUserArray);

// Split the roomuser array objects into 2 arrays based on amount owed and amount to be received. If the amount owed is less than zero, that means the roomuser owes money
// If the amount owed is greater than zero, the room user gets the money from the other. If zero, then what the roomuser spent is exactly equal to the split amount and no settlement needed
  var roomUserOwes = roomUserArray.filter(function(ex){
    return ex.owes < 0;
  });

  var roomUserRcvs = roomUserArray.filter(function(ex){
    return ex.owes >= 0;
  });

// Append all the expense tracking summary to the summary-table div. During integration, Mike's HTML can reuse the same id so the routine will work as is. Lets keep the console.logs for now
// to enable debugging and we can clean up before final submission. 
// Patrick can modify the below h5 jquery elements to attach specific ids to do summary specific styling.
  $('#summary-table').empty();
  console.log("Summary Array");
  console.log("-------------");
  console.log("Total spent : " + runningTotal);

  var sumStr1$ = $('<h4> Total Expenses so far : ' + runningTotal + '</h4>');
  sumStr1$.appendTo('#summary-table');

  console.log("Shared expense per member : " + (runningTotal/roomUserArray.length));
  var sumStr1$ = $('<h4> Shared expense per member : ' + (runningTotal/roomUserArray.length) + '</h4>');
  sumStr1$.appendTo('#summary-table');

  for (let i = 0; i < roomUserArray.length; i++) {
    console.log("Name " + roomUserArray[i].name + " spent " + roomUserArray[i].amtSpent + " and owes " + roomUserArray[i].owes);
    if (roomUserArray[i].owes < 0) {
      sumStr1$ = $('<h5>' + roomUserArray[i].name + ' spent ' + roomUserArray[i].amtSpent + ' and owes ' + roomUserArray[i].owes + '</h5>');
    } else {
      sumStr1$ = $('<h5>' + roomUserArray[i].name + ' spent ' + roomUserArray[i].amtSpent + ' and to receive ' + roomUserArray[i].owes + '</h5>');
    }
    sumStr1$.appendTo('#summary-table');
  };

  sumStr1$ = $('<br>');
  sumStr1$.appendTo('#summary-table');

// The below routine iterates thru the 2 arrays - money owed and money to be received. The logic tries take money from room user who owes and tries to distribute
// to the room user who has to receive the money. If the distribution works flawlessly, then the distribution should complete maximum in about 3 tries. But the logic 
// is coded to try until maximum 10 tries for any unfore seen data conditions and to prevent any infinite looping, the logic aborts the try after 10 tries. If the 
// 10 tries has been reached then thats a data condition that need to be debugged and the logic is handled downstream in the routine to notify thru console.log
  var tries = 0;

  while (tries <= 10) {
    tries++;   
    for (let i = 0; i < roomUserOwes.length; i++) {
      if (roomUserOwes[i].owes !=0) {
      for (let j = 0; j < roomUserRcvs.length; j++) {
        if (roomUserRcvs[j].owes != 0) {
          // ower has less money than receiver so allocate all the money from ower
          if ((roomUserOwes[i].owes * -1) <= roomUserRcvs[j].owes) {
            owecalc = roomUserOwes[i].owes * -1;
            console.log(roomUserOwes[i].name + " owes " + roomUserRcvs[j].name + " amount " + owecalc);
            sumStr1$ = $('<h5>' + roomUserOwes[i].name + " owes " + roomUserRcvs[j].name + " $" + owecalc + '</h5>');
            sumStr1$.appendTo('#summary-table');
          
            roomUserRcvs[j].owes -= owecalc;
            roomUserOwes[i].owes = 0;
          // ower has more money than receiver so allocate portion and store the rest to the ower 
          } else if ((roomUserOwes[i].owes * -1) > roomUserRcvs[j].owes) {
            owecalc = roomUserRcvs[j].owes;
            console.log(roomUserOwes[i].name + " owes " + roomUserRcvs[j].name + " amount " + owecalc);
            sumStr1$ = $('<h5>' + roomUserOwes[i].name + " owes " + roomUserRcvs[j].name + " $" + owecalc + '</h5>');
            sumStr1$.appendTo('#summary-table');
            roomUserOwes[i].owes += roomUserRcvs[j].owes;
            roomUserRcvs[j].owes = 0;
          } 
        }
      }
    }
    }
  }

  if (tries === 10) {
    console.log("Money distribution logic couldnt complete allocation. Please check specific data condition to debug");
  }
});

// The child_added event triggers first time during page load and then everytime when a expense object is added to the firebase db. 
expenseRef.on("child_added", function(childSnapshot) {
  console.log("During child added event" + childSnapshot.val());
  console.log("Size : " + expenseRef.length);

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

  console.log("Adding to the expense array");
  expenseArrayObj.push(newExpense);
  numberofentries++;
  for (let i = 0; i < roomUserArray.length; i++) {
    if (roomUserArray[i].name === roommateName) {
      roomUserArray[i].amtSpent += parseFloat(itemRate);
    }
  }

  runningTotal += parseFloat(itemRate);

  console.log(roommateName);
  console.log(item);
  console.log(purchasedate);
  console.log(storeName);
  console.log(storeLocation);
  console.log(itemRate);
  console.log(runningTotal);
});


// Bubble sort routine to sort the expense array
function bubbleSort(roomUserArray)
{
    var swapped;
    do {
        swapped = false;
        for (var i=0; i < roomUserArray.length-1; i++) {
            if (roomUserArray[i].amtSpent > roomUserArray[i+1].amtSpent) {
                var temp = roomUserArray[i];
                roomUserArray[i] = roomUserArray[i+1];
                roomUserArray[i+1] = temp;
                swapped = true;
            }
        }
    } while (swapped);
}

