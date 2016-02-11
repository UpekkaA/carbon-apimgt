var conditionCount = 0;
var headerFieldCount = 0;
conditionsArray = new Array();
var addPolicy = function () {
    if(!validateInputs()){
        return;
    }

    jagg.post("/site/blocks/add-policy/ajax/add-policy.jag", {
            action:"addPolicy",
            tierName:$('#tierName').val(),
            conditionsArray:JSON.stringify(conditionsArray),
            defaultRequestCount:$('#defaultRequestCount').val(),
            defaultUnitTime:$('#defaultUnitTime').val(),
            defaultTimeUnit:$('#defaultTimeUnit').val()
        }, function (result) {
            if (result.error == false) {
                location.reload(true)
            } else {
                jagg.message({content:result.message,type:"error"});
            }
        },
        "json");
};

function addCondition(element, count){

    var requestCount = $('#requestCount').val();
    var unitTime = $('#unitTime').val();
    var startingIP = $('#startingIP').val();
    var endingIP = $('#endingIP').val();
    var httpVerb = $('#httpVerb').val();
    var timeUnit = $('#timeUnit').val();
    if(httpVerb!="" && startingIP!="" && endingIP!=""){
        var condition = "verb=='".concat(httpVerb,"' AND ip >= '",startingIP,"' AND ip <= '",endingIP,"'" );
    }
    else if(httpVerb!="" && (startingIP=="" || endingIP=="")){
        var condition = "verb=='".concat(httpVerb,"'");
    }

    else if(httpVerb==""){
        var condition = "ip >= '".concat(startingIP,"' AND ip <= '",endingIP,"'" )
    }


    var elementId = element.attr('id');
    element.parent().append(
        '<tr id="condition'+count+'">'+
        '<td>'+condition+'</td>'+
        '<td>'+requestCount+'</td>'+
        '<td>'+unitTime+' '+timeUnit+'</td>'+
        '<td class="delete_resource_td "><a  id="conditionDelete'+count+'" href="javascript:removeCondition('+count+');"><i class="icon-trash"></i></a></td>'+
        '</tr>'
    );

    var conditionObj = {};
    conditionObj.id=count;
    conditionObj.requestCount = requestCount;
    conditionObj.unitTime = unitTime;
    conditionObj.timeUnit = timeUnit;
    conditionObj.startingIP = startingIP;
    conditionObj.endingIP = endingIP;
    conditionObj.httpVerb = httpVerb;

    conditionsArray.push(conditionObj);

    $("#requestCount").val('');
    $("#unitTime").val('');
    $("#timeUnit").val('');
    $("#startingIP").val('');
    $("#endingIP").val('');
    $("#httpVerb").val('');

    showHideQuotaPolicy();

}

function removeCondition(count){
    for(var i = 0; i < conditionsArray.length; i++) {
        if(conditionsArray[i].id==count) {
            conditionsArray.splice(i, 1);
        }
    }
    $('#condition'+count).remove();
}

function validateConditionInput(){
    var requiredMsg = $('#errorMsgRequired').val();
    var invalidErrorMsg = $('#errorMessageInvalid').val();

    var requestCount = $('#requestCount');
    var requestCountTxt = requestCount.val();
    if(!validateNumbersInput(requestCountTxt,requestCount,requiredMsg, invalidErrorMsg)){
        return false;
    }
    var unitTime = $('#unitTime');
    var unitTimeTxt = unitTime.val();
    if(!validateNumbersInput(unitTimeTxt,unitTime,requiredMsg, invalidErrorMsg)){
        return false;
    }

    var startingIP = $('#startingIP');
    var startingIPTxt = startingIP.val();
    if(startingIPTxt!="" && !validateIPAddressInput(startingIPTxt,startingIP, invalidErrorMsg)){
        return false;
    }

    var endingIP = $('#endingIP');
    var endingIPTxt = endingIP.val();
    if(endingIPTxt!="" && !validateIPAddressInput(endingIPTxt,endingIP, invalidErrorMsg)){
        return false;
    }

    if(startingIPTxt!="" && endingIPTxt == ""){
        validateInput(endingIPTxt,endingIP,requiredMsg);
        return false;
    }

    if(startingIPTxt=="" && endingIPTxt != ""){
        validateInput(startingIPTxt,startingIP,requiredMsg);
        return false;
    }
    var httpVerb = $('#httpVerb');
    var httpVerbTxt = httpVerb.val();

    if(startingIPTxt=="" && endingIPTxt=="" &&  httpVerbTxt==""){
        $('#labelEmpty').remove();
        httpVerb.parent().append('<label class="error" id="labelEmpty" >' + "No conditions added" + '</label>');
        return false;
    }else{
        $('#labelEmpty').remove();
    }

    return true;
}

$(document).ready(function(){
    $('#add-condition-btn').on('click',function(){
        if(!validateConditionInput()){
            return;
        }

        ++ conditionCount;
        var tBody = $('#policy-condition-tbody');
        addCondition(tBody, conditionCount);

    });

});

function showHideQuotaPolicy(){
    var quotaPolicy = $('#quotaPolicy').find(":selected").val();
    if (quotaPolicy == "request_count_based"){
        $('#bandwidthBasedDiv').hide();
    } else{
        $('#bandwidthBasedDiv').show();
    }

    if (quotaPolicy == "bandwidth_based"){
        $('#requestCountBasedDiv').hide();
    } else{
        $('#requestCountBasedDiv').show();
    }

}

function showHideDefaultQuotaPolicy(){
    var quotaPolicy = $('#defaultQuotaPolicy').find(":selected").val();
    if (quotaPolicy == "request_count_based"){
        $('#defaultBandwidthBasedDiv').hide();
    } else{
        $('#defaultBandwidthBasedDiv').show();
    }

    if (quotaPolicy == "bandwidth_based"){
        $('#defaultRequestCountBasedDiv').hide();
    } else{
        $('#defaultRequestCountBasedDiv').show();
    }

}


function addHeaderField(element, count){

    var elementId = element.attr('id');
    element.parent().append(
        '<tr id="headerField'+count+'">'+
        '<td><div class="clear"></div></td>'+
        '<td><input type="text" id="headerFieldName'+count+'" name="headerFieldName'+count+'" placeholder="Header Field Name"/></td>'+
        '<td><input type="text" id="headerFieldValue'+count+'" name="headerFieldValue'+count+'" placeholder="Value"/></td>'+
        '<td class="delete_resource_td"><a  id="headerFieldDelete'+count+'"  href="javascript:removeHeaderField('+count+')"><i class="icon-trash"></i></a></td>'+
        '</tr>'
    );
}

function removeHeaderField(count){
    $('#headerField'+count).remove();
}

$(document).ready(function(){
    $('#add-field-btn').on('click',function(){
        ++ headerFieldCount;
        var tBody = $('#header-field-tbody');
        addHeaderField(tBody, headerFieldCount);
    });

});

function validateInput(text, element, errorMsg){
    var elementId = element.attr('id');
    text = text.trim();
    if(text == ""){
        element.css("border", "1px solid red");
        $('#label'+elementId).remove();
        element.parent().append('<label class="error" id="label'+elementId+'" >' + errorMsg + '</label>');
        return false;
    }else{
        $('#label'+elementId).remove();
        element.css("border", "1px solid #cccccc");
        return true;
    }
}

function validateInputCharactors(text, element, errorMsg){
    var elementId = element.attr('id');
    var illegalChars = /([~!&@#;%^*+={}\|\\<>\"\',])/;
    text = text.trim();
    if(illegalChars.test(text)){
        element.css("border", "1px solid red");
        $('#label'+elementId).remove();
        element.parent().append('<label class="error" id="label'+elementId+'" >' + errorMsg + '</label>');
        return false;
    }else{
        $('#label'+elementId).remove();
        element.css("border", "1px solid #cccccc");
        return true;
    }
}


function validateNumbersInput(text, element, requiredMsg, invalidErrorMsg){
    var elementId = element.attr('id');
    text = text.trim();
    if(text == ""){
        element.css("border", "1px solid red");
        $('#label'+elementId).remove();
        element.parent().append('<label class="error" id="label'+elementId+'" >' + requiredMsg + '</label>');
        return false;
    }else if(!text.match(/^\d+$/)){
        element.css("border", "1px solid red");
        $('#label'+elementId).remove();
        element.parent().append('<label class="error" id="label'+elementId+'" >' + invalidErrorMsg + '</label>');
        return false;
    }else{
        $('#label'+elementId).remove();
        element.css("border", "1px solid #cccccc");
        return true;
    }
}

function validateIPAddressInput(text, element, invalidErrorMsg){
    var elementId = element.attr('id');
    text = text.trim();

    if(!text.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/)){
        element.css("border", "1px solid red");
        $('#label'+elementId).remove();
        element.parent().append('<label class="error" id="label'+elementId+'" >' + invalidErrorMsg +" IP Address "+ '</label>');
        return false;
    }else{
        $('#label'+elementId).remove();
        element.css("border", "1px solid #cccccc");
        return true;
    }
}


function validateInputs(){
    //validate name
    var requiredMsg = $('#errorMsgRequired').val();
    var invalidErrorMsg = $('#errorMessageInvalid').val();
    var illegalChars = $('#errorMessageIllegalChar').val();
    var tierName = $('#tierName');
    var tierNameTxt = tierName.val();

    if(!validateInput(tierNameTxt,tierName,requiredMsg)){
        return false;
    }

    if(!validateInputCharactors(tierNameTxt,tierName,illegalChars)){
        return false;
    }

    var defaultRequestCount = $('#defaultRequestCount');
    var defaultRequestCountTxt = defaultRequestCount.val();

    if(!validateNumbersInput(defaultRequestCountTxt,defaultRequestCount,requiredMsg, invalidErrorMsg)){
        return false;
    }

    var defaultUnitTime = $('#defaultUnitTime');
    var defaultUnitTimeTxt = defaultUnitTime.val();

    if(!validateNumbersInput(defaultUnitTimeTxt,defaultUnitTime,requiredMsg, invalidErrorMsg)){
        return false;
    }

    return true;
};