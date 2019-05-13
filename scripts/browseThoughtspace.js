$(document).ready(function() {

    var thoughtspaceCreationTime = getUrlParameter("thoughtspaceCreationTime");
    var thoughtspaceId = "thoughtspaceExtension_" + thoughtspaceCreationTime;

    localforage.getItem(thoughtspaceId)
        .then(function(thoughtspace) {
            var tabs = thoughtspace.thoughtspaceInfoArray;
            tabs.forEach(function(currentValue, i, array) {
                var mappingObject = {
                    $serial:i,
                    $title: currentValue.title,
                    $url: currentValue.url
                }
                htmlTemplateManager("thoughtspaceRowTemplate", "thoughtspaceTableContent", mappingObject)
            });

            $('#selectAllButton').on("click", function() {
                $(".checkboxClass").prop('checked', true);
            });

            $("#selectNoneButton").on("click", function() {
                $(".checkboxClass").prop('checked', false);
            });

            $("#backButton").on("click", function() {
                $(location).attr('href', "../thoughtspaceList.html")
            })

            $("#openSelectedTabsButton").on("click", function(event) {
                event.preventDefault();
                var checkedValues = $('input:checkbox:checked').map(function() {
                    return this.value;
                }).get();

                if (checkedValues.length == 0) {
                    window.location.href = "../thoughtspaceList.html";
                }

                for (var j = 0; j < checkedValues.length; j++) {
                    chrome.tabs.create({
                        url: checkedValues[j]
                    });
                }
            })
            var selectionIndex = -1;
            $(".table-row").on("click", function(event) {
                var selectedUrl = $(this).find(".table-description").text()
                chrome.tabs.update({ url: selectedUrl })

                // // Following requires the usage of content scripts. Not implementing at the moment
                // var prerednerString = '<link rel="prerender" href="$url">'                 
                // prerednerString = prerednerString.replace("$url", "www.microsoft.com");
                // $('body').append(prerednerString)
            })

        }).catch(function(err) {
            console.log(err);
        });
});