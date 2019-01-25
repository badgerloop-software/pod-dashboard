document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 13) {
        var text = document.getElementById("input").value;
        var div = document.getElementById('history');
        div.innerHTML += ">\xa0\xa0\xa0\xa0\xa0" + text + '<br />';
        document.getElementById("input").value = "";
    }
};