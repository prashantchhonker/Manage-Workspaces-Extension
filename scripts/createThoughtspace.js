$(document).ready(function() {

    $("#backButton").on("click", function() {
        $(location).attr('href', "../thoughtspaceList.html")
    })

    chrome.tabs.query({
        currentWindow: true
    }, function(tabs) {
        tabs.forEach(function(currentValue, i, array) {

            var tabId = tabs[i].id;

            var mappingObject = {
                $titleId: tabId,
                $urlId: tabId,
                $rowId: tabId,
                $serialNumber: i + 1,
                $titleTip: tabs[i].title,
                $deleteId: tabId,
                $title: tabs[i].title,
                $url: tabs[i].url
            }
            htmlTemplateManager("thoughtspaceRowTemplate", "thoughtspaceTableContent", mappingObject)

            $("#delete_" + tabId).on("click", function(event) {
                $("#row_" + tabId).remove();
                $(".table-serial").each(function(index) {
                    $(this).text(index + 1);
                });
            });
        });

    });

    $("#saveButton").on("click", function(event) {
        event.preventDefault();
        if ($("#name").val().length > 0) {
            var thoughtspaceObject = {};
            thoughtspaceObject.name = $("#name").val();
            thoughtspaceObject.description = $("#description").val();
            var thoughtspaceInfoArray = [];

            $(".table-row").each(function(index) {
                var rowObject = {};
                var rowId = this.id;
                var tabId = rowId.substring(rowId.indexOf("_") + 1);

                rowObject.title = $("#title_" + tabId).attr("title");
                rowObject.url = $("#url_" + tabId).attr("title");

                thoughtspaceInfoArray.push(rowObject);
            });
            thoughtspaceObject.thoughtspaceInfoArray = thoughtspaceInfoArray;
            var thoughtspaceInternalName = "thoughtspaceExtension_" + moment().unix();
            localforage.setItem(thoughtspaceInternalName, thoughtspaceObject)
                .then(function(value) {
                    $(location).attr('href', "../thoughtspaceList.html?creationSuccessFlag=true");
                }).catch(function(err) {
                    console.log(err);
                })
        } else {
            if ($("#name").val().length < 1) {
                $("#nameErrorMessage").show();
                $("#name").focus();
            }
        }
    });

    $("#name").on("change keyup paste click", function() {
        if ($("#name").val().length > 0) {
            $("#nameErrorMessage").hide();
        } else {
            $("#nameErrorMessage").show();
        }
    });
});