$(document).ready(function() {

    localforage.keys()
        .then(function(keys) {
            var validKeysArray = []
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf("thoughtspaceExtension_") > -1) {
                    validKeysArray.push(keys[i])
                }
            }
            var promisesArray = []
            validKeysArray.forEach(function(currentValue, index, array) {
                var thoughtspaceInternalName = validKeysArray[index]
                var serialNumber = index + 1
                var thoughtspaceCreationTime = thoughtspaceInternalName.substring(thoughtspaceInternalName.indexOf("_") + 1)
                var promise = localforage.getItem(thoughtspaceInternalName)
                    .then(function(thoughtspaceObject) {
                        var mappingObject = {
                            $serialNumber: serialNumber,
                            $thoughtspaceCreationTime: thoughtspaceCreationTime,
                            $thoughtspaceName: thoughtspaceObject.name,
                            $thoughtspaceDescription: thoughtspaceObject.description
                        }
                        htmlTemplateManager("thoughtspaceRowTemplate", "thoughtspaceTableContent", mappingObject)
                    }).catch(function(err) {
                        console.log("we got an error", err)
                    })
                promisesArray.push(promise)
            })
            return Promise.all(promisesArray)
        }).then(function() {
            var noSelection = {
                openButton: false,
                createButton: true,
                browseButton: false,
                editButton: false,
                deleteButton: false,
                importButton: true,
                exportButton: false
            }
            var singleSelection = {
                openButton: true,
                createButton: true,
                browseButton: true,
                editButton: true,
                deleteButton: true,
                importButton: true,
                exportButton: true
            }
            var multipleSelection = {
                openButton: false,
                createButton: true,
                browseButton: false,
                editButton: false,
                deleteButton: true,
                importButton: true,
                exportButton: true
            }

            var selectionDataHolder = []

            function render(selectionStatus) {
                // row rendering
                $(".table-row").removeAttr("selected")
                for (let value of selectionDataHolder) {
                    $("#" + value).attr("selected", "");
                }
                // button rendering
                $("#openButton,#createButton,#browseButton,#editButton,#deleteButton,#importButton,#exportButton").removeAttr('disabled')
                var criteriaObject
                switch (selectionStatus) {
                    case "none":
                        criteriaObject = noSelection
                        break
                    case "single":
                        criteriaObject = singleSelection
                        break
                    case "multiple":
                        criteriaObject = multipleSelection
                }
                for (var key in criteriaObject) {
                    if (!criteriaObject[key])
                        $("#" + key).attr('disabled', '')
                }
            }

            $(window).on("click", function(evt) {
                selectionDataHolder.length = 0
                render("none")
            })

            $("#deletionTransparentLayer,#deletionMessage").on("click", function(evt) {
                evt.stopPropagation()
            })

            function remove(array, element) {
                return array.filter(e => e !== element)
            }

            $(".table-row").on("click", function(evt) {
                evt.stopPropagation()
                var rowId = this.id
                if (evt.ctrlKey) { //multiple
                    if (selectionDataHolder.includes(rowId)) {
                        selectionDataHolder = remove(selectionDataHolder, rowId)
                        if (selectionDataHolder.length === 0) {
                            render("none")
                        } else if (selectionDataHolder.length === 1) {
                            render("single")
                        } else if (selectionDataHolder.length > 1) {
                            render("multiple")
                        }
                    } else {
                        selectionDataHolder.push(rowId)
                        if (selectionDataHolder.length === 1) {
                            render("single")
                        } else if (selectionDataHolder.length > 1) {
                            render("multiple")
                        }
                    }
                } else { //single
                    selectionDataHolder.length = 0
                    selectionDataHolder.push(rowId)
                    render("single")
                }
            })
            // -------------------------------------------------
            function openHandler(event) {
                event.stopPropagation()
                let thoughtspaceKey = selectionDataHolder[0]
                localforage.getItem(thoughtspaceKey, function(err, thoughtspaceObject) {
                    var thoughtspaceArray = thoughtspaceObject.thoughtspaceInfoArray
                    for (var j = 0; j < thoughtspaceArray.length; j++) {
                        chrome.tabs.create({
                            url: thoughtspaceArray[j].url
                        })
                    }
                })
            }
            // -------------------------------------------------
            function browseHandler(event) {
                event.stopPropagation()
                var selectedRow = selectionDataHolder[0]
                var thoughtspaceCreationTime = selectedRow.substr(selectedRow.indexOf("_") + 1)
                $(location).attr('href', "../html/browseThoughtspace.html?thoughtspaceCreationTime=" + thoughtspaceCreationTime)
            }
            // -------------------------------------------------
            function editHandler(event) {
                event.stopPropagation()
                var selectedRow = selectionDataHolder[0]
                var thoughtspaceCreationTime = selectedRow.substr(selectedRow.indexOf("_") + 1)
                $(location).attr('href', "../html/editThoughtspace.html?thoughtspaceCreationTime=" + thoughtspaceCreationTime)
            }
            // -------------------------------------------------
            function deleteHandler(event) {
                event.stopPropagation()
                $("#deletionTransparentLayer,#deletionMessage").show()
                $("#deletionTransparentLayer").animate({ opacity: 0.7 }, 250, "linear");
                $("#singleDeletionMessage,#multipleDeletionMessage").hide();

                var thoughtspaceNameArray = [];
                $(".table-row[selected] > .table-title").each(function(index) {
                    thoughtspaceNameArray.push($(this).text())
                });
                console.log(thoughtspaceNameArray)
                var showString = thoughtspaceNameArray.join(', ').replace(/,(?!.*,)/gmi, ' and')
                console.log(showString)
                if (selectionDataHolder.length == 1) {
                    $("#singleThoughtspaceName").text(showString);
                    $("#singleDeletionMessage").show();
                } else {
                    $("#multipleThoughtspaceName").text(showString);
                    $("#multipleDeletionMessage").show();
                }

                $("#deletionMessage").animate({ marginTop: "2rem", opacity: 1 }, 250, "linear");

                $("#thoughtspaceDeleteAccept").off("click").on("click", function() {
                    let promiseArray = [];
                    while ((rowId = selectionDataHolder.pop()) != null) {
                        promiseArray.push(localforage.removeItem(rowId))
                        $("#" + rowId).remove();
                    }

                    render("none")
                    Promise.all(promiseArray)
                        .then(function() {
                            $(".table-serial").each(function(index) {
                                $(this).text(index + 1);
                            });
                            $("#deletionMessage").animate({ marginTop: 0, opacity: 0 }, {
                                complete: function() {
                                    $("#deletionMessage").hide(400)
                                }
                            });
                            $("#deletionTransparentLayer").animate({ opacity: 0 }, {
                                complete: function() {
                                    $("#deletionTransparentLayer").hide(400)
                                }
                            });
                        })
                        .catch(function() {
                            console.log("Delete operation has experienced an error", err)
                        })
                })

                $("#thoughtspaceDeleteCancel").off("click").on("click", function() {
                    $("#deletionMessage").animate({ marginTop: 0, opacity: 0 }, {
                        complete: function() {
                            $("#deletionMessage").hide(400)
                        }
                    });
                    $("#deletionTransparentLayer").animate({ opacity: 0 }, {
                        complete: function() {
                            $("#deletionTransparentLayer").hide(400)
                        }
                    });
                })
            }
            // -------------------------------------------------
            function createHandler(event) {
                event.stopPropagation()
                $(location).attr('href', "html/createThoughtspace.html")
            }
            // -------------------------------------------------
            function importHandler(event) {
                event.stopPropagation()
                $(location).attr('href', "html/import.html")
            }
            // -------------------------------------------------
            function exportHandler(event) {
                event.stopPropagation()
                var para = JSON.stringify(selectionDataHolder)
                $(location).attr('href', "html/export.html?thoughtspaces=" + para)
            }

            $("#openButton").on("click", openHandler)
            $("#browseButton").on("click", { id: this.id }, browseHandler)
            $("#editButton").on("click", { id: this.id }, editHandler)
            $("#deleteButton").on("click", deleteHandler)
            $("#createButton").on("click", createHandler)
            $("#importButton").on("click", importHandler)
            $("#exportButton").on("click", exportHandler)
        })
});