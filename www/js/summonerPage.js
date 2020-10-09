$(document).ready(function() {
    if ($( window ).width() >1200)
    {
        var margin = $('#colleftleft').width()+$('#colleftmiddle').width()-$('#colright').width();
        $('.centerButtons').css('left',$('#colcenter').width()/2-margin);
    }

    $( window ).resize(function() {
        if ($( window ).width() >1200)
        {
            var margin = $('#colleftleft').width()+$('#colleftmiddle').width()-$('#colright').width();
            $('.centerButtons').css('left',$('#colcenter').width()/2-margin);
        }
        
    });
 });