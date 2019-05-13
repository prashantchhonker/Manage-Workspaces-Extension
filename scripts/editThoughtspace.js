$(document).ready(function() {
    $("#moveUp, #moveDown, #moveTop, #moveBottom").attr('disabled', 'disabled')
    var thoughtspaceCreationTime = getUrlParameter("thoughtspaceCreationTime")
    var thoughtspaceId = "thoughtspaceExtension_" + thoughtspaceCreationTime

    localforage.getItem(thoughtspaceId)
        .then(function(thoughtspace) {
            $("#name").val(thoughtspace.name)
            $("#description").val(thoughtspace.description)
            var tabs = thoughtspace.thoughtspaceInfoArray

            tabs.forEach(function(currentValue, i, array) {
                var tabId = i
                var mappingObject = {
                    $tabId: tabId,
                    $tipOfTitle: tabs[i].title,
                    $title: tabs[i].title,
                    $tipOfUrl: tabs[i].url,
                    $url: tabs[i].url
                }
                htmlTemplateManager("thoughtspaceRowTemplate", "thoughtspaceTableContent", mappingObject)

                $("#delete_" + tabId).on("click", function(event) {
                    $("#row_" + tabId).remove()
                })
            })

            var selectedTabId
            var selectionIndex

            $("#backButton").on("click", function() {
                $(location).attr('href', "../thoughtspaceList.html")
            })

            function tableRowClickHandler(event) {
                event.stopPropagation()
                selectedTabId = this.id
                selectionIndex = selectedTabId.substring(selectedTabId.indexOf("_") + 1)
                var selectedStatus = $(this).attr('selected')
                if (selectedStatus) { //row is selected and is going to be unselected
                    $("#moveUp, #moveDown, #moveTop, #moveBottom").off('click')
                    $(this).removeAttr('selected')
                } else { //row is unselected and is going to be selected

                    //-------------- cleanup phase begins ---------------
                    $(".table-row").each(function(index) {
                        $(this).removeAttr('selected')
                    })
                    $("#moveUp, #moveDown, #moveTop, #moveBottom").off('click')
                    //-------------- cleanup phase ends ---------------

                    $("#moveUp").on('click', moveUpHandler)
                    $("#moveDown").on('click', moveDownHandler)
                    $("#moveTop").on('click', moveTopHandler)
                    $("#moveBottom").on('click', moveBottomHandler)

                    $("#moveUp, #moveDown, #moveTop, #moveBottom").removeAttr('disabled')
                    $(this).attr('selected', '')
                }
            }

            $(".table-row").each(function(index) {
                $(this).off("click").on("click", tableRowClickHandler)
            })

            $(".container").on("click", function(event) {
                event.stopPropagation()
                if (event.target.id == "moveUp" || event.target.id == "moveDown" || event.target.id == "moveTop" || event.target.id == "moveBottom") {} else {
                    $("#moveUp, #moveDown, #moveTop, #moveBottom").off('click')
                    $("#moveUp, #moveDown, #moveTop, #moveBottom").attr('disabled', 'disabled')
                    // $("#editTabsList > .row").each(function(index) {
                    $(".table-row").each(function(index) {
                        $(this).removeAttr('selected')
                    })
                }
            })

            function addTabHandler(title, url) {
                var lastIndex = $(".table-row").length

                var mappingObject = {
                    $tabId: lastIndex,
                    $tipOfTitle: title,
                    $title: title,
                    $tipOfUrl: url,
                    $url: url
                }
                htmlTemplateManager("thoughtspaceRowTemplate", "thoughtspaceTableContent", mappingObject)

                $("#delete_" + lastIndex).on("click", function(event) {
                    $("#row_" + lastIndex).remove()
                })

                $(".table-row").each(function(index) {
                    $(this).off("click").on("click", tableRowClickHandler)
                })

                selectionIndex = lastIndex
            }

            $("#addActiveTab").on("click", function(event) {
                chrome.tabs.query({
                    currentWindow: true,
                    active: true
                }, function(tabs) {
                    addTabHandler(tabs[0].title, tabs[0].url)
                    $("#row_" + selectionIndex).trigger('click')
                })
            })

            $("#removeDuplicatesButton").on("click", function(event) {
                var urlObject = {}
                $(".table-row").each(function(index) {
                    urlObject[$("#url_" + index).attr("title")] = $("#title_" + index).attr("title")
                })
                $("#thoughtspaceTableContent").empty()
                $.each(urlObject, function(url, title) {
                    addTabHandler(title, url)
                })
            })

            $("#update").on("click", function(event) {
                event.preventDefault()
                if ($("#name").val().length > 0) {
                    var thoughtspaceObject = {}
                    thoughtspaceObject.name = $("#name").val()
                    thoughtspaceObject.description = $("#description").val()
                    var thoughtspaceInfoArray = []

                    $(".table-row").each(function(index) {
                        var rowObject = {}
                        var rowId = this.id
                        var tabId = rowId.substring(rowId.indexOf("_") + 1)
                        rowObject.title = $("#title_" + tabId).attr("title")
                        rowObject.url = $("#url_" + tabId).attr("title")
                        thoughtspaceInfoArray.push(rowObject)
                    })
                    thoughtspaceObject.thoughtspaceInfoArray = thoughtspaceInfoArray
                    localforage.setItem(thoughtspaceId, thoughtspaceObject, function() {
                        $(location).attr('href', "../thoughtspaceList.html?creationSuccessFlag=true")
                    })
                }
            })

            $("#name").on("change keyup paste click", function() {
                if ($("#name").val().length > 0) {
                    $("#nameErrorMessage").hide()
                } else {
                    $("#nameErrorMessage").show()
                }
            })

            function moveUpHandler(event) {
                event.stopPropagation()
                var previousIndex = selectionIndex - 1
                if (previousIndex > -1) {
                    var currentTitle = $("#title_" + selectionIndex).attr("title")
                    var currentUrl = $("#url_" + selectionIndex).attr("title")
                    var previousTitle = $("#title_" + previousIndex).attr("title")
                    var previousUrl = $("#url_" + previousIndex).attr("title")

                    var intermediateTitle = previousTitle
                    var intermediateUrl = previousUrl

                    $("#title_" + previousIndex).text(currentTitle)
                    $("#url_" + previousIndex).text(currentUrl)
                    $("#title_" + selectionIndex).text(intermediateTitle)
                    $("#url_" + selectionIndex).text(intermediateUrl)

                    $("#title_" + previousIndex).attr("title", currentTitle)
                    $("#url_" + previousIndex).attr("title", currentUrl)
                    $("#title_" + selectionIndex).attr("title", intermediateTitle)
                    $("#url_" + selectionIndex).attr("title", intermediateUrl)

                    $("#row_" + selectionIndex).removeAttr('selected')
                    $("#row_" + previousIndex).attr('selected', '')

                    selectionIndex = previousIndex
                } else {}
            }

            function moveDownHandler(event) {
                event.stopPropagation()
                var nextIndex = parseInt(selectionIndex) + 1
                if (nextIndex < $(".table-row").length) {
                    var currentTitle = $("#title_" + selectionIndex).attr("title")
                    var currentUrl = $("#url_" + selectionIndex).attr("title")
                    var nextTitle = $("#title_" + nextIndex).attr("title")
                    var nextUrl = $("#url_" + nextIndex).attr("title")

                    var intermediateTitle = nextTitle
                    var intermediateUrl = nextUrl

                    $("#title_" + nextIndex).text(currentTitle)
                    $("#url_" + nextIndex).text(currentUrl)
                    $("#title_" + selectionIndex).text(intermediateTitle)
                    $("#url_" + selectionIndex).text(intermediateUrl)

                    $("#title_" + nextIndex).attr("title", currentTitle)
                    $("#url_" + nextIndex).attr("title", currentUrl)
                    $("#title_" + selectionIndex).attr("title", intermediateTitle)
                    $("#url_" + selectionIndex).attr("title", intermediateUrl)

                    $("#row_" + selectionIndex).removeAttr('selected')
                    $("#row_" + nextIndex).attr('selected', '')

                    selectionIndex = nextIndex
                } else {}
            }

            function moveTopHandler(event) {
                event.stopPropagation()
                var listLength = $(".table-row").length
                var listDataArray = []
                for (let i = 0; i < listLength; i++) {
                    var dataObject = {}
                    dataObject.title = $("#title_" + i).attr("title")
                    dataObject.url = $("#url_" + i).attr("title")
                    listDataArray[i] = dataObject
                }
                var newListDataArray = []
                newListDataArray[0] = listDataArray[selectionIndex]
                listDataArray.splice(selectionIndex, 1)
                for (let i = 1; i <= listDataArray.length; i++) {
                    newListDataArray[i] = listDataArray[i - 1]
                }
                for (let i = 0; i < newListDataArray.length; i++) {
                    $("#title_" + i).text(newListDataArray[i].title)
                    $("#url_" + i).text(newListDataArray[i].url)

                    $("#title_" + i).attr("title", newListDataArray[i].title)
                    $("#url_" + i).attr("title", newListDataArray[i].url)
                }

                $("#row_" + selectionIndex).removeAttr('selected')
                $("#row_0").attr('selected', '')

                selectionIndex = 0
            }

            function moveBottomHandler() {
                event.stopPropagation()
                var listLength = $(".table-row").length
                var listDataArray = []
                for (let i = 0; i < listLength; i++) {
                    var dataObject = {}
                    dataObject.title = $("#title_" + i).attr("title")
                    dataObject.url = $("#url_" + i).attr("title")
                    listDataArray[i] = dataObject
                }
                var newListDataArray = []
                newListDataArray[listDataArray.length - 1] = listDataArray[selectionIndex]
                listDataArray.splice(selectionIndex, 1)
                for (let i = 0; i < listDataArray.length; i++) {
                    newListDataArray[i] = listDataArray[i]
                }
                for (let i = 0; i < newListDataArray.length; i++) {
                    $("#title_" + i).text(newListDataArray[i].title)
                    $("#url_" + i).text(newListDataArray[i].url)

                    $("#title_" + i).attr("title", newListDataArray[i].title)
                    $("#url_" + i).attr("title", newListDataArray[i].url)
                }
                $("#row_" + selectionIndex).removeAttr('selected')
                $("#row_" + (parseInt(newListDataArray.length) - 1)).attr('selected', '')

                selectionIndex = parseInt(newListDataArray.length) - 1
            }

            $("#moveUp").on('click', moveUpHandler)
            $("#moveDown").on('click', moveDownHandler)
            $("#moveTop").on('click', moveTopHandler)
            $("#moveBottom").on('click', moveBottomHandler)

        }).catch(function(err) {
            console.log(err)
        })
})