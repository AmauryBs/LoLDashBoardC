
function fetchFromJson(file,idObj,id){
    // fetch the local json file then look for the object with the given idObj and append the corrseponding image to the HTML DOM element
    fetch(file).then(results => results.json().then(
        function(results){
        results.forEach(element => {
            if(element.key == idObj){
                $('#'+id).append( "<img class='icon' src='"+element.icon+"'>");
            }

            })
        }
    ))
}

function linkPlayer(name,id){
    let playerName = name;
    var hiddenInput = $('<input/>', { type: "hidden", name: "name", value: playerName });
    var a = $('<a/>', { href: "#", onclick: "document.getElementById('form" + playerName + "').submit()", html: playerName })
    var form = $('<form/>', { id: "form" + playerName, method: "post", action: "/summonerPage" })
    form.append(hiddenInput);
    form.append(a);
    $('#'+id).append(form);
}