Plotly.d3.csv('../data/Mass_Shootings_database_1982-2019.csv', function(err, rows){

function unpack(rows, key) {
    return rows.map(function(row)
    { return row[key]; });}

// get a collumn of a matrix
function getCol(matrix, col){
    var column = [];
    for(var i=0; i<matrix.length; i++){
        column.push(matrix[i][col]);
    }
    return column;
    }

var loc = unpack(rows, 'location');
var countLoc={};
var countLegal={};
var injured = unpack(rows, 'injured');
var killed = unpack(rows, 'fatalities');
var legal = unpack(rows, 'weapons_obtained_legally')

//get different types of locations and if the weapon was obtained legaly and count the number of each case 
for (var i = 0 ; i < loc.length; i++){
    // clean the string
    cleanLegal = legal[i].replace(/(\r\n|\n|\r)/gm,"");
    cleanLoc = loc[i].replace(/(\r\n|\n|\r)/gm,"");
    if (cleanLoc in countLoc){
        countLoc[cleanLoc]+=1;
    }else{
        countLoc[cleanLoc] = 1;
    }
    if (cleanLegal in countLegal){
        countLegal[cleanLegal]+=1;
    }else{
        countLegal[cleanLegal] = 1;
    }
}


    // Create items array
var orderedLoc = Object.keys(countLoc).map(function(key) {
    return [key, countLoc[key]];
  });

var orderedLegal = Object.keys(countLegal).map(function(key) {
    return [key, countLegal[key]];
  });
  
  // Sort the array based on the second element
    orderedLoc.sort(function(first, second) {
    return second[1] - first[1];
    });

    orderedLegal.sort(function(first, second) {
    return second[1] - first[1];
    });

// Create a new array with only the first 10 items
shortLoc=orderedLoc.slice(0, 5);


var othercount=0;
var yes = 0;
var no = 0;
// Count the times where the legalObtention is undetermined and get the places where yes and no are stored in the array orderedLegal 
for (var i = 0 ; i < orderedLegal.length; i++){
    if (orderedLegal[i][0].toLowerCase() !== 'yes' & orderedLegal[i][0].toLowerCase() !== 'no'){
        othercount+=orderedLegal[i][1]
    }
    if(orderedLegal[i][0].toLowerCase() == 'yes'){
        yes = i;
    }
    if(orderedLegal[i][0].toLowerCase() == 'no'){
        no = i;
    }
}
// Create an array which contains : yes, no and undetermined with the number of each case
shortLegal=[[orderedLegal[yes][0],orderedLegal[yes][1]],[orderedLegal[no][0],orderedLegal[no][1]]].concat([['undetermined',othercount]]);
console.log(orderedLegal);
var dataLoc = [{
    values: getCol(shortLoc,1),
    labels: getCol(shortLoc,0),
    type: 'pie',
    marker: {colors: ['#003366','#336699','#3366cc','#0099cc','#33cccc'],
    line: {
        color: 'black',
        width: 1
    },
}
  }];
  // Create the 2 piecharts
  var dataLegal = [{
    values: getCol(shortLegal,1),
    labels: getCol(shortLegal,0),
    type: 'pie',
    marker: {colors: ['#00cc66','#ff0000','lightgrey'],
    line: {
        color: 'black',
        width: 1
    },
}
  }];
  
  var layoutLoc = {
    height: 350,
    width: 450,
    title: 'Type of location', 
    paper_bgcolor:'lightgrey',
    margin: {
        t:100,
        l:100
      }
  };

  var layoutLegal = {
    height: 360,
    width: 450,
    title: 'Weapon obtained legaly', 
    paper_bgcolor:'lightgrey',
    margin: {
        t:100,
        l:100
      }
  };
  
  Plotly.plot('locationPie', dataLoc, layoutLoc, {displayModeBar : false});
  Plotly.plot('legalPie', dataLegal, layoutLegal, {displayModeBar : false});
})