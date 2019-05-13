var thoughtspaces = JSON.parse(decodeURIComponent(window.location.search.replace("?thoughtspaces=", ''))).sort()
var promisesArray = [];

thoughtspaces.forEach(function(currentValue, index, array) {
    var promise = localforage.getItem(currentValue)
    promisesArray.push(promise)
})

Promise.all(promisesArray)
    .then(function(values) {
        var thoughtspaces = JSON.stringify(values, null, 4);
        $('#thoughtspaceJson').val(thoughtspaces)
    }).catch(function() {
        console.log(err)
    })

$(document).ready(function() {
    $("#exportThoughtspaceButton").on("click", function(event) {
        var copyText = document.getElementById("thoughtspaceJson")
        copyText.select()
        document.execCommand("Copy")
    })
    $("#backButton").on("click", function() {
        $(location).attr('href', "../thoughtspaceList.html")
    })
})