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

var loc = unpack(rows, 'location1');
var state={};
var years ={};
var injured = unpack(rows, 'injured');
var killed = unpack(rows, 'fatalities');
var year = unpack(rows, 'year');

//count total victims per states
for (var i = 0 ; i < loc.length; i++){

  if (loc[i].split(', ')[1] in state){
    state[loc[i].split(', ')[1]][0]+=parseInt(injured[i]) + parseInt(killed[i]);
    state[loc[i].split(', ')[1]][1]+=parseInt(killed[i]);
    state[loc[i].split(', ')[1]][2]+=parseInt(injured[i]);
  }else{
    state[loc[i].split(', ')[1]] = [parseInt(injured[i]) + parseInt(killed[i]), parseInt(killed[i]), parseInt(injured[i])];
  }
}

//count total victims per year
for (var i = 0 ; i < year.length; i++){

  if (year[i] in years){
    years[year[i]][0]+=parseInt(injured[i]);
    years[year[i]][1]+=parseInt(killed[i]);

  }else{
    years[year[i]]=[parseInt(injured[i]), parseInt(killed[i])];
  }
}


// Create items array
var itemsStates = Object.keys(state).map(function(key) {
  return [key, state[key]];
});

var itemsYears = Object.keys(years).map(function(key) {
  return [key, years[key]];
});


// Sort the array based on the second element
itemsStates.sort(function(first, second) {
  return second[1][0] - first[1][0];
});

// Create a new array with only the first 10 items
topstates=itemsStates.slice(0, 10);

// Create the 2 barcharts
var traceYearInjured = {
    x: getCol(itemsYears,0),
    y: getCol(getCol(itemsYears,1),0),
    name: 'injured',
    type: 'bar',
    marker: {
      color:'#ff9900'}
  };
  
  var traceYearKilled = {
    x: getCol(itemsYears,0),
    y: getCol(getCol(itemsYears,1),1),
    name: 'fatalities',
    type: 'bar',
    marker: {
      color:'#fa5316'}
  };

  var traceStateInjured= {
    x: getCol(topstates,0),
    y: getCol(getCol(topstates,1),2),
    name: 'injured',
    type: 'bar',
    marker: {
      color:'#ff9900'}
  };

  var traceStateKilled = {
    x: getCol(topstates,0),
    y: getCol(getCol(topstates,1),1),
    name: 'fatalities',
    type: 'bar',
    marker: {
      color:'#fa5316'}
  };
  
  
  var dataYear = [traceYearInjured, traceYearKilled];
  var dataState = [traceStateInjured, traceStateKilled];
  
  var layoutYear = {barmode: 'stack', title:'Year', paper_bgcolor:'lightgrey',width:766, height: 550, margin: {
    r:60,
    l:100,
    b:50
  }};
  var layoutState = { height: 350,
    width: 850,barmode: 'stack', title:'States', paper_bgcolor:'lightgrey',margin: {
      t:50,
      l:60,
    }};
  
  Plotly.plot('barchartYearDiv', dataYear, layoutYear, {displayModeBar : false});
  Plotly.plot('barchartStateDiv', dataState, layoutState, {displayModeBar : false});});

  