Plotly.d3.csv('../data/Shooting_incident_state_2018.csv', function(err, rows){
function unpack(rows, key) {
  return rows.map(function(row)
  { return row[key]; });}

  function valuesDict(dict){
    valuesd=[]
    for (var key in dict){
      valuesd.push(dict[key])
    }
    return valuesd
  }
    state = unpack(rows, 'State');
    injured = unpack(rows, '# Injured');
    killed = unpack(rows, '# Killed');
  
    var dictInjured = {};
    var dictKilled = {};
    for ( var i = 0 ; i < killed.length; i++) {
      if (state[i] in Object.keys(dictInjured)){
        dictInjured[state[i]] += parseInt(injured[i]);
        dictKilled[state[i]] += parseInt(killed[i]);
      }
      else{
        dictInjured[state[i]] = parseInt(injured[i]);
        dictKilled[state[i]] = parseInt(killed[i]);
  
      }
    }

  var trace1 = {
    //x: state,
    x: state,
    //y: injured,
    y: valuesDict(dictInjured),
    name: 'injured',
    type: 'bar',

  };

  
  var trace2 = {
    //x: state,
    x: state,
    //y: killed,
    y: valuesDict(dictKilled),
    name: 'fatalities',
    type: 'bar',
  };
  
  var data = [trace1, trace2];
  
  var layout = {barmode: 'stack'};
  
  Plotly.newPlot('barchartStateDiv', data, layout)});
