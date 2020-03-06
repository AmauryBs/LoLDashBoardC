Plotly.d3.csv('../data/Mass_Shootings_database_1982-2019.csv', function(err, rows){

    function unpack(rows, key) {
        return rows.map(function(row) { return row[key]; });
    }

    var Case = unpack(rows, 'case'),
        victims = unpack(rows, 'total_victims'),
        shootingLat = unpack(rows, 'latitude'),
        shootingLon = unpack(rows, 'longitude'),
        caseSize = [],
        age = unpack(rows, 'age_of_shooter'),
        fatalities = unpack(rows, 'fatalities'),
        injured = unpack(rows, 'injured'),
        date = unpack(rows, 'date'),
        hoverText = [],
        scale = 3

    // Change the hovertext and choose the size of bubbles
    for ( var i = 0 ; i < victims.length; i++) {
        var currentSize = Math.sqrt(victims[i]) * scale;
        var currentText = Case[i] + ", date: " + date[i] + ", fatalities: " + fatalities[i] + ", injured: " + injured[i] + ", age of killer: " + age[i];
        caseSize.push(currentSize);
        hoverText.push(currentText);
    }
    // Create the bubble map chart
    var data = [{
        type: 'scattergeo',
        locationmode: 'USA-states',
        lat: shootingLat,
        lon: shootingLon,
        hoverinfo: 'text',
        text: hoverText,
        marker: {
            size: caseSize,
            line: {
                color: 'black',
                width: 1
            },
            color: 'red',
        }
    }];

    var layout = {
        title: 'Location',
        showlegend: false,
        yaxis: {fixedrange: true},
        xaxis : {fixedrange: true},
        dragmode : false,
        geo: {
            scope: 'usa',
            showland: true,
            subunitwidth: 1,
            countrywidth: 1,
            landcolor: 'rgb(217, 217, 217)',
            subunitcolor: 'rgb(255,255,255)'
        },
        height:540,
        width:990,
        margin: {
          l: 25,
          r: 25,
          b: 40,
          pad: 0
        }, paper_bgcolor:'lightgrey'
    };

    Plotly.plot("mapDiv", data, layout, {responsive: true,displayModeBar : false});

});
