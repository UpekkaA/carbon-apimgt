var conditionCount = 0;
var headerFieldCount = 0;
var queryParameterCount = 0;
conditionsArray = new Array();
var addPolicy = function () {
    if(!validateInputs()){
        return;
    }

    jagg.post("/site/blocks/add-policy/ajax/add-policy.jag", {
            action:"addPolicy",
            tierName:$('#tierName').val(),
            description:$('#description').val(),
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

    var quotaPolicy=$('#quotaPolicy').val();
    var limit = "";
    var time = "";
    if(quotaPolicy=="request_count_based"){
        var requestCount = $('#requestCount').val();
        var unitTime = $('#unitTime').val();
        var timeUnit = $('#timeUnit').val();
        limit = requestCount.concat(" Request(s)");
        time= unitTime.concat(" ",timeUnit);
    }
    if(quotaPolicy=="bandwidth_based"){
        var bandwidth = $('#bandwidth').val();
        var bandwidthUnit = $('#bandwidthUnit').val();
        var bandwidthUnitTime = $('#bandwidthUnitTime').val();
        var bandwidthTimeUnit = $('#bandwidthTimeUnit').val();
        limit = bandwidth.concat(" ",bandwidthUnit);
        time = bandwidthUnitTime.concat(" ",bandwidthTimeUnit);
    }

    var startingIP = $('#startingIP').val();
    var endingIP = $('#endingIP').val();
    var specificIP = $('#specificIP').val();

    var httpVerb = $('#httpVerb').val();

    var startingDate = $('#startingDate').val();
    var endingDate = $('#endingDate').val();
    var specificDate = $('#specificDate').val();


    var condition = "";
    if(httpVerb!=""){
        if(condition !=""){
            condition = condition.concat(" AND ")
        }
        condition = condition.concat("verb=='",httpVerb,"'");
    }
    if(startingIP!="" && endingIP!=""){
        if(condition !=""){
            condition = condition.concat(" AND ")
        }
        condition = condition.concat("('",startingIP,"' <= ip <= '",endingIP,"')" )
    }
    if(specificIP!=""){
        if(condition !=""){
            condition = condition.concat(" AND ")
        }
        condition = condition.concat("ip == '",specificIP,"'");
    }

    if(startingDate!="" && endingDate!=""){
        if(condition !=""){
            condition = condition.concat(" AND ")
        }
        condition = condition.concat("('",startingDate,"' <= date <= '",endingDate,"')" )
    }
    if(specificDate!=""){
        if(condition !=""){
            condition = condition.concat(" AND ")
        }
        condition = condition.concat("date == '",specificDate,"'");
    }


    var elementId = element.attr('id');
    element.parent().append(
        '<tr id="condition'+count+'">'+
        '<td>'+condition+'</td>'+
        '<td>'+limit+'</td>'+
        '<td>'+time+'</td>'+
        '<td class="delete_resource_td "><a  id="conditionDelete'+count+'" href="javascript:removeCondition('+count+');"><i class="icon-trash"></i></a></td>'+
        '</tr>'
    );

   /* var conditionObj = {};
    conditionObj.id=count;
    conditionObj.requestCount = requestCount;
    conditionObj.unitTime = unitTime;
    conditionObj.timeUnit = timeUnit;
    conditionObj.startingIP = startingIP;
    conditionObj.endingIP = endingIP;
    conditionObj.httpVerb = httpVerb;

    conditionsArray.push(conditionObj);*/

    $("#quotaPolicy").val('');
    $("#requestCount").val('');
    $("#unitTime").val('');
    $("#timeUnit").val('');

    $("#bandwidth").val('');
    $("#bandwidthUnit").val('MB');
    $("#bandwidthUnitTime").val('');
    $("#bandwidthTimeUnit").val('');

    $("#startingIP").val('');
    $("#endingIP").val('');
    $("#specificIP").val('');
    $("#httpVerb").val('');

    $("#startingDate").val('');
    $("#endingDate").val('');
    $("#specificDate").val('');

    showHideQuotaPolicy();
    headerFieldCount = 0;
    queryParameterCount = 0;
    $('#header-field-tbody').html('');
    $('#query-parameter-tbody').html('');

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

    var quotaPolicy=$('#quotaPolicy').val();

    if(quotaPolicy=="request_count_based") {
        var requestCount = $('#requestCount');
        var requestCountTxt = requestCount.val();
        if (!validateNumbersInput(requestCountTxt, requestCount, requiredMsg, invalidErrorMsg)) {
            return false;
        }
        var unitTime = $('#unitTime');
        var unitTimeTxt = unitTime.val();
        if (!validateNumbersInput(unitTimeTxt, unitTime, requiredMsg, invalidErrorMsg)) {
            return false;
        }
    }
    if(quotaPolicy=="bandwidth_based"){
        var bandwidth = $('#bandwidth');
        var bandwidthTxt = bandwidth.val();
        if (!validateNumbersInput(bandwidthTxt, bandwidth, requiredMsg, invalidErrorMsg)) {
            return false;
        }
        var bandwidthUnitTime = $('#bandwidthUnitTime');
        var bandwidthUnitTimeTxt = bandwidthUnitTime.val();
        if (!validateNumbersInput(bandwidthUnitTimeTxt, bandwidthUnitTime, requiredMsg, invalidErrorMsg)) {
            return false;
        }
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

function addQueryParameter(element, count){

    var elementId = element.attr('id');
    element.parent().append(
        '<tr id="queryParameter'+count+'">'+
        '<td><div class="clear"></div></td>'+
        '<td><input type="text" id="queryParameterName'+count+'" name="queryParameterName'+count+'" placeholder="Query Parameter Name"/></td>'+
        '<td><input type="text" id="queryParameterValue'+count+'" name="queryParameterValue'+count+'" placeholder="Value"/></td>'+
        '<td class="delete_resource_td"><a  id="queryParameterDelete'+count+'"  href="javascript:removeQueryParameter('+count+')"><i class="icon-trash"></i></a></td>'+
        '</tr>'
    );
}

function removeQueryParameter(count){
    $('#queryParameter'+count).remove();
}

$(document).ready(function(){
    $('#add-parameter-btn').on('click',function(){
        ++ queryParameterCount;
        var tBody = $('#query-parameter-tbody');
        addQueryParameter(tBody, queryParameterCount);
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