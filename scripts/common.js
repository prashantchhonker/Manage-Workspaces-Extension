var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

var htmlTemplateManager = function htmlTemplateManager(templateId, ParentId, mappingObject) {
    let template = $("#" + templateId).html()
    let regexString = ""
    for (let key in mappingObject) {
        regexString = `${regexString}${key}|\\`
    }
    regexString = `\\${regexString}`.replace(/..$/, "")
    let regex = new RegExp(regexString, "g")
    template = template.replace(regex, function(matched) {
        return mappingObject[matched]
    })
    $("#" + ParentId).append(template)
}