$(document).ready(function() {
    var promisesArray = []

    $("#importThoughtspaceButton").on("click", function(event) {
        event.preventDefault()
        var pastedText = $("#thoughtspaceJson").val().trim()
        if (pastedText == "") {
            $("#thoughtspaceJson").focus()
            document.execCommand('paste')
            pastedText = $("#thoughtspaceJson").val().trim()
        } 
        var thoughtspaces = JSON.parse(pastedText);
        thoughtspaces.forEach(function(currentValue, index, array) {
            var thoughtspaceInternalName = "thoughtspaceExtension_" + moment().unix() + index
            var promise = localforage.setItem(thoughtspaceInternalName, thoughtspaces[index])
            promisesArray.push(promise)
        })
        Promise.all(promisesArray).then(function(value) {
            $(location).attr('href', "../thoughtspaceList.html")
        }).catch(function(err) {
            console.log(err)
        })
    })

    $("#backButton").on("click", function(evt) {
        $(location).attr('href', "../thoughtspaceList.html")
    })

})