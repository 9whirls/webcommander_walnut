// Author: Jian Liu, whirls9@hotmail.com
globalVariable={};

var defineVariableCmd = {
  "script": "defineVariable",
  "synopsis": "Define variable",
  "functionalities": ["Workflow"],
  "parameters": [
    {
      "name": "variableList",
      "helpmessage": "Define variables in key=value pairs, one definition per line",
      "type": "textarea",
      "mandatory": 1
    }
  ],
  "output": []
}

var sleepCmd = {
  "script": "sleep",
  "synopsis": "Sleep",
  "functionalities": ["Workflow"],
  "parameters": [
    {
      "name": "second",
      "helpmessage": "Number of second to sleep",
      "mandatory": 1
    }
  ],
  "output": []
}

var workflowCmd = {};

$.fn.serializeObject = function(){
  var o = {};
  o["command"] = this.attr('name');
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

function addCommand(curCmd){
  curCmd = curCmd || 'undefined';
  var $cmd = $(
    '<div class="command">\
      <table class="cmdhead"><tr class="shadow">\
        <td class="num">1</td>\
        <td>' + select_cmd + '</td>\
        <td class="des"></td>\
        <td class="sta"></td> \
        <td class="ctr">\
          <i class="fa fa-fw fa-play-circle run" title="Run"></i> \
          <i class="fa fa-fw fa-plus-circle add" title="Add"></i> \
          <i class="fa fa-fw fa-minus-circle delete" title="Delete"></i> \
          <i class="fa fa-fw fa-toggle-down toggle" title="Toggle display"></i> \
          <i class="fa fa-fw fa-toggle-on onoff" title="Enable / Disable this command"></i> \
        </td>\
      </tr></table>\
    </div>'
  );
  if (curCmd != 'undefined'){
    curCmd.after($cmd);
  } else {
    $cmd.appendTo($('#sortable'));
  }
  $cmd.hide().show('slow');
}

function addFromJson(json) {
  var cmds = [];
  cmds = cmds.concat(json);
  cmds.forEach(function(command){
    if (command.description !== undefined && command.script == undefined) {
      var desc = '<div id="workflowDesc" title="Workflow Description">\
        ' + command.description + '</div>';
      $('#sortable').after(desc);
      $( "#workflowDesc" ).dialog({width:600});
    } else {
      var currentCommand = $('div.command:last');
      addCommand();
      $('div.command:last')
        .find('.cmdlist')
        .find('option[value="' + command.script.replace( /\\/g, '\\\\' ) + '"]')
        .prop('selected',true);
      drawCmd(command, $('div.command:last'));
      if (command.disabled) {
        $('div.command:last').find('.onoff').trigger('click');
      }
      if (command.output != undefined && command.output.length > 0) {
        renderResult($('div.command:last'), null, command);
      }
      if (command.variables != undefined && command.variables != '') {
        $('div.command:last textarea[name="variableList"]').val(command.variables);
      }
    }
  });
  updateOrder();
  return false;
}

function drawCmd(cmd, parent) {
  parent.find("div.cmdbody").remove();
  var bodyId = guid();
  var parTabId = guid();
  var desTabId = guid();
  var varTabId = guid();
  var jsoTabId = guid();
  var resTabId = guid();
  var impTabId = guid();
  var cHtml = '<div class="cmdbody" id="' + bodyId + '">';
  cHtml += '<ul>';
  cHtml += '<li><a href="#' + parTabId + '">Parameter</a></li>';
  cHtml += '<li><a href="#' + resTabId + '">Result</a></li>';
  cHtml += '<li><a href="#' + jsoTabId + '">JSON</a></li>';
  //cHtml += '<li><a href="#' + impTabId + '">Import</a></li>';
  //cHtml += '<li><a href="#' + desTabId + '">Description</a></li>';
  cHtml += '<li><a href="#' + varTabId + '">Variable</a></li>';
  cHtml += '</ul>';
  cHtml += '<div id="' + parTabId + '" class="parTab"></div>';
  cHtml += '<div id="' + resTabId + '" class="resTab"></div>';
  cHtml += '<div id="' + jsoTabId + '" class="jsoTab"></div>';
  //cHtml += '<div id="' + impTabId + '" class="impTab"></div>';
  //cHtml += '<div id="' + desTabId + '" class="desTab"></div>';
  cHtml += '<div id="' + varTabId + '" class="varTab">\
    <div class="par box">\
      <textarea name="variableList" placeholder="such as myvar=output[0].data" class="input box"></textarea><br/>\
      <label class="parlabel2">Define variables based on command output, in key=value pairs, one definition per line</label>\
    </div>\
  </div>';
  $(cHtml).appendTo(parent);
  $('#' + bodyId).tabs();

  drawParams(cmd, parTabId);
  updateJson(cmd, jsoTabId);
}

function drawParam(param, formId) {
  var id = guid();
  var name = param.name;
  var type = param.type;
  if (type == "switch" && name == param.parametersets[0]) { return false; }
  var pValue = param.value || '';
  if (typeof(pValue) == 'object') {
    value = JSON.stringify(pValue,null,2);
  } else {
    value = pValue;
  }
  var phtml = '<div class="par box"><label class="parlabel1';
  if (param.mandatory == '1') { phtml += ' mandatory'; }
  if (type == 'switch') { phtml += ' switch';}
  phtml += '">' + param.name + '</label>';
  switch (type){
    case 'switch':
      phtml += '<input type="hidden" class="input" name="' + name + '" id="' + id + '" value="1" />';
      break;
    case 'textarea':
      phtml += '<textarea class="input box" type="textarea" name="' + name + '" id="' + id + '">' + value + '</textarea>';
      break;
    case 'file':
      phtml += '<input class="input box" type="file" size="60" value="' + value + '" name="' + name + '" id="' + id + '"></input>';
      break;
    case 'password':
      phtml += '<input class="input box "type="password" value="' + value + '" name="' + name + '" id="' + id + '"></input>';
      break;
    case 'option':
      phtml += '<select class="input box" type="select" name="' + name + '" id="' + id + '">';
      param.options.forEach(function(option){
        if (option === ('' + value)) {
          phtml += '<option selected value="' + option + '">' + option + '</option>';
        } else {
          phtml += '<option value="' + option + '">' + option + '</option>';
        }
      });
      phtml += '</select>';
      break;
    case 'selectText':
      var aguid = guid();
      phtml += '<input class="input box" type="text" value="' + value + '" name="' + name + '" list="' + aguid + '" id="' + id + '"></input>';
      phtml += '<datalist id="' + aguid + '" name="' + name + '">';
      if (param.options) { 
        param.options.forEach(function(option){
          if (option === ('' + value)) {
            phtml += '<option selected value="' + option + '">' + option + '</option>';
          } else {
            phtml += '<option value="' + option + '">' + option + '</option>';
          }
        });
      }
      phtml += '</datalist>';
      break;
    case 'time':
      phtml += '<input class="input box time" type="text" size="40" value="' + value + '" name="' + name + '" id="' + id + '"></input>';
      break;
    default:
      phtml += '<input class="input box" type="text" size="40" value="' + value + '" name="' + name + '" id="' + id + '"></input>';
  };
  if (param.helpmessage !== null) { phtml += '<label class="parlabel2">' + param.helpmessage + '</label>'; }
  phtml += '</div>';
  $(phtml).appendTo( $('#' + formId) );
  $('.time').datetimepicker({
    dateFormat: 'yy-mm-dd',
    timeFormat: 'hh:mm',
    showTimePicker:false, 
    showSecond:false,
    showMillisec:false,
    showMicrosec:false,
    showTimezone:false
  });
  $('.par').draggable({
    containment: "parent"
  });
}

function drawParams(cmd, parentId) {
  var formId = guid();
  var fHtml = '<form id="' + formId + '" name="' + cmd.script + '">';
  fHtml += '</form>';
  $(fHtml).appendTo( $('#' + parentId) );

  var sParamHasValue = [];
  var sParamSet = [];
  cmd.parameters.forEach(function(param){
    var value = param.value || '';
    if (param.parametersets !== undefined) {
      if (value == '') {
        return true;
      } else {
        sParamHasValue.push(param);
        sParamSet = sParamSet.concat(param.parametersets || '');
      }
    } else {
      drawParam(param,formId);
    }
  });

  //var selectedParamSet = mode(sParamSet);
  var selectedParamSet = cmd.method;

  if (cmd.parametersets !== undefined) {
    mHtml = '<div class="par box"><label class="parlabel1 mandatory">method</i></label>';
    mHtml += '<select type="select" class="methodlist input box" name="method">';
    cmd.parametersets.sort(function(x, y){
      return x == y ? 0 : x < y ? -1 : 1
    })
    .forEach(function(ps){
      if (ps == selectedParamSet) {
        mHtml += '<option selected value="' + ps + '">' + ps + '</option>';
      } else {
        mHtml += '<option value="' + ps + '">' + ps + '</option>';
      }
    });
    mHtml += '</select><div class="methodhelp" style="display:none"></div></div>';
    $(mHtml).appendTo( $('#' + formId) );
  }

  var method = $('#' + formId).find('.methodlist').val();

  if ( method != undefined ) {
    cmd.parameters.forEach(function(param){
      if ($.inArray(method,param.parametersets) == -1) {
        return true;
      } else {
        drawParam(param,formId);
      }
    });
  }
}

function finishCmd(cmd, executionTime, data, whatNext, runBtn) {
  runBtn.removeClass('fa-spinner fa-spin');
  runBtn.addClass('fa-play-circle');
  renderResult(cmd,executionTime,data);
  if (data.returncode=='4488'){
    switch (whatNext) {
      case "next":
        runNextCmd(cmd);
        break;
      case "self":
        if ($('#rerun').hasClass('fa-spin')) {
          runCmd(cmd,"self");
        }
        break;
      case "stop":
        return false;
    }
  }
}

function formatTime(){
  var now = new Date();
  var d = $.datepicker.formatDate('yy-mm-dd', now);
  var t = now.toString().match(/\d{2}:\d{2}:\d{2}/)[0];
  return d + " " + t;
}

function getNextCmd(currentCmd) {
  var nextCmd = currentCmd.nextAll('div.command').has('table.cmdhead:not(.disabled)').has('form').first();
  if (nextCmd.length !== 0) {
    return nextCmd;
  } else if ($('#rerun').hasClass('fa-spin')) {
    return $('div.command').has('table.cmdhead:not(.disabled)').has('form').first();
  }
}

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

function importCmds(jsonString){
  var lines = jsonString.split("\n");
  for (var i in lines) {
    line = lines[i];
    if (line.charAt(0) == '[' || '{') {
      break;
    } else {
      jsonString = jsonString.replace(line, "");
      if (line.match(/.json$/i)) {
        $.ajax({
          url: line,
          dataType: 'json',
          async: false,
          success: function(data) {
            addFromJson(data);
          }
        });
      } else {
        var variable = line.split("=");
        if (variable != ''){
          var regex = new RegExp(variable[0], 'ig');
          //text = text.replace(regex, '<br />');
          //jsonString = jsonString.replace(variable[0], variable[1]);
          jsonString = jsonString.replace(regex, variable[1]);
        }
      }
    }
  }
  var json = $.parseJSON( jsonString );
  addFromJson(json);
  return false;
}

function minifyCmds() {
  var cmds = $.parseJSON($('#jsonExport').val());
  var miniCmds = [];
  cmds.forEach(function(cmd){
    var params = [];
    cmd.parameters.forEach(function(param){
      if (param.value != undefined) { params.push( {name:param.name, value:param.value} ); }
    });
    miniCmds.push( {script:cmd.script, method:cmd.method, parameters:params} );
  });
  var json = JSON.stringify(miniCmds,null,2);
  $('#jsonExport').val(json);
}

function minifyCmds1() {
  var cmds = $.parseJSON($('#jsonExport').val());
  var miniCmds = [];
  cmds.forEach(function(cmd){
    var miniCmd = {script:cmd.script, method:cmd.method, disabled:cmd.disabled};
    cmd.parameters.forEach(function(param){
      if (param.value != undefined) {
        var pValue = param.value;
        if (typeof(pValue) == 'object') {
          value = JSON.stringify(pValue);
        } else {
          value = pValue;
        }
        eval( 'miniCmd.' + param.name + '="' + value + '"' );
      }
    });
    miniCmds.push(miniCmd);
  });
  var json = JSON.stringify(miniCmds,null,2);
  $('#jsonExport').val(json);
}

function mode(arr){
  if (arr.length == 1) {return arr[0];}
  var mf = 1;
  var m = 0;
  var item;
  for (var i=0; i<arr.length; i++) {
    for (var j=i; j<arr.length; j++) {
      if (arr[i] == arr[j]) { m++; }
      if (mf<m){
        mf=m;
        item = arr[i];
      }
    }
    m=0;
  }
  return item;
}

function parseValue(fieldValue, fieldName) {
  if (fieldValue != "" && fieldValue != null) {
    $.each(globalVariable, function(key, value){
      if (typeof(value)=='string') {
        var regex = new RegExp(key, 'ig');
        fieldValue = fieldValue.replace(regex, value);
      }
    });
    var squareText = fieldValue.match(/(\['[(\w)\-]*'\])+/ig);
    if (squareText) {
      $.each(squareText, function(i){
        var squareValue = eval("globalVariable" + squareText[i]);
        if (squareValue !== undefined) {
          fieldValue = fieldValue.replace(squareText[i], squareValue);
        }
      });
    }
  } else {
    if (globalVariable[fieldName]) {
      fieldValue = globalVariable[fieldName];
    }
  }
  return fieldValue
}

function renderResult(cmd,executionTime,data){
  executionTime = executionTime || data.executiontime;
  var output = '';
  if (data.returncode=='4488'){
    cmd.find('.sta').removeClass('fail').addClass('pass');
    output = 'PASS (4488) ' + executionTime;
  } else {
    cmd.find('.sta').removeClass('running pass').addClass('fail');
    output = 'FAIL (' + data.returncode + ') ' + executionTime;
  }
  cmd.find('.sta').html(output);

  var jsoTabId = cmd.find('.jsoTab').attr('id');
  var json = $.parseJSON(cmd.find('.jsonresult').val());
  data.parameters = json.parameters;
  updateJson(data, jsoTabId);

  var resTab = cmd.find('.resTab');
  resTab.empty();
  data.output.forEach(function(item){
    switch (item.type)  {
      case "msg":
        resTab.append('<li>' + item.time + ' ' + item.data + '</li>');
        break;
      case "err":
        var table = '<table><tr><th>Code</th><td>' + item.data.code + '</td></tr>';
        table += '<tr><th>Exception</th><td>' + item.data.message + '</td></tr></table>';
        resTab.append(table);
        break;
      case "dataset":
        var c = [];
        Object.keys(item.data[0]).forEach(function(key){
          c.push({title: key});
        });

        var d = [];
        item.data.forEach(function(record){
          var a = []
          $.each(record, function(k,v){
            a.push(v);
          });
          d.push(a);
        });
        var tableid = guid();
        resTab.append('<table id="' + tableid + '"></table>');

        var t = $('#' + tableid).dataTable({
          bDeferRender: true,
          data: d,
          bAutoWidth: false,
          columns: c,
          order: [[ 0, "desc" ]]
        });
        break;
      case "raw":
        var text = $.isArray(item.data)?item.data.join("\n"):item.data;
        resTab.append('<pre>' + text + '</pre>');
        break;
      case "separator":
        resTab.append('<hr/>');
        break;
      default:
        resTab.append(JSON.stringify(item.data, null, 2));
    }
  });
  if (data.rawoutput) {
    resTab.append('<hr/>');
    var text = data.rawoutput.join("\n");
    resTab.append('<pre>' + text + '</pre>');
  }
}

function runCmd(cmd, whatNext) {
  var form = cmd.find('form');
  if (cmd.find('.cmdhead').hasClass("disabled") || form.length == 0) {
    return false;
  }
  else {
    var runBtn = cmd.find('.run');
    runBtn.removeClass('fa-play-circle').addClass('fa-spinner fa-spin');

    if (form.attr('name')=='sleep'){
      runSleep(form, cmd, whatNext, runBtn);
    }
    else if (form.attr('name')=='defineVariable') {
      runDefineVariable(form, cmd, whatNext, runBtn);
    }
    else {
      runCommand(form, cmd, whatNext, runBtn);
    }
  }
}

function runCommand(form, cmd, whatNext, runBtn) {
  var start = $.now();
  var formData = new FormData();
  formData.append("script",form.attr('name'));
  $.each(form[0], function(){
    var fieldName = $(this).attr('name');
    if ($(this).attr('type') != 'file') {
      var fieldValue = $(this).val();
      fieldValue = parseValue(fieldValue,fieldName);
      formData.append(fieldName,fieldValue);
    } else {
      var fileToUpload = $(this)[0].files[0];
      if (fileToUpload) {
        formData.append(fieldName,fileToUpload);
      }
    }
  });

  $.ajax({
    url: '/api/v1/runCommand',
    type: 'POST',
    data: formData,
    async: true,
    cache: false,
    contentType: false,
    processData: false,
    success: function(jdata){
      var kvList = cmd.find('textarea[name="variableList"]').val();
      var lines = kvList.split("\n");
      for (var i in lines) {
        line = lines[i];
        var variable = line.split(/=(.+)?/);
        if (variable != ''){
          var vname = variable[0].trim();
          var vvalue = eval('jdata.' + variable[1].trim());
          globalVariable[vname]=vvalue;
        }
      }

      var executionTime = ($.now() - start) / 1000 + " seconds";
      finishCmd(cmd,executionTime,jdata,whatNext,runBtn);
    },
    error: function(error) {
      var executionTime = ($.now() - start) / 1000 + " seconds";
      var data = $.parseJSON(cmd.find('.jsonresult').val());
      data.returncode = error.status;
      data.output = [{
        "time": formatTime(),
        "data": "Fail - HTTP server response: " + error.statusText,
        "type": "msg"
      }];
      finishCmd(cmd,executionTime,data,whatNext,runBtn);
    }
  });
}

function runDefineVariable(form, cmd, whatNext, runBtn) {
  var kvList = form.find('textarea[name="variableList"]').val();
  var lines = kvList.split("\n");
  for (var i in lines) {
    line = lines[i];
    var variable = line.split(/=(.+)?/);
    if (variable != ''){
      var vname = variable[0].trim();
      if (variable[1] !== undefined) {
        var vvalue = variable[1].trim();
      } else {
        alert('Variable "' + vname + '" is not defined!');
        status.html("");
        return false;
      }
      vvalue = parseValue(vvalue,vname);
      globalVariable[vname]=vvalue;
    }
  }
  setTimeout(function(){
    var executionTime = "1 second";
    var data = $.extend(true,{},defineVariableCmd);
    data.returncode = 4488;
    data.output.push(
      {
        "data": globalVariable
      }
    );
    data.executiontime = "1 second";
    finishCmd(cmd,executionTime,data,whatNext,runBtn);
  }, 1000);
}

function runNextCmd(curCmd) {
  var nextCmd = getNextCmd(curCmd);
  if (nextCmd !== undefined) { runCmd(nextCmd,'next');}
}

function runSleep(form, cmd, whatNext, runBtn) {
  var second = form.find('input[name="second"]').val();
  second = parseValue(second,"second");
  setTimeout(function(){
    var executionTime = second + " seconds";
    var data = $.extend(true,{},sleepCmd);
    data.returncode = 4488;
    data.output.push(
      {
        "time": formatTime(),
        "data": "Success - sleep " + second + " seconds",
        "type": "msg"
      }
    );
    data.parameters[0].value = second;
    data.executiontime = second + " seconds";
    finishCmd(cmd,executionTime,data,whatNext,runBtn);
  }, second * 1000);
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

function saveCmds(){
  $("#dialogSave").remove();
  var dialog = '<div id="dialogSave" title="Save commands as a workflow on server">\
    <div class="par box"><label class="parlabel mandatory">Define file name</label>\
    <input id="filename" class="input" value="myworkflow.json"></input></div></div>';
  $('#sortable').after(dialog);
  $( "#dialogSave" ).dialog({
    width:400,
    modal:true,
    buttons: {
      "Save": function(){
        saveCommands();
        $("#dialogSave").remove();
        return false;
      },
      "Cancel": function() {
        $("#dialogSave").remove();
        return false;
      }
    }
  });
}

function saveCommands() {
  var fileName = $('#filename').val();
  if (fileName == '') {return false;}
  var formData = new FormData();
  formData.append('content', $('#jsonExport').val());
  formData.append('filename', fileName);
  $.ajax({
    url: '/upload.php',
    type: 'POST',
    data: formData,
    async: true,
    cache: false,
    contentType: false,
    processData: false,
    dataType: 'html',
    beforeSend: function () {
      var dialog = '<div id="processing" title="Please wait"><center><font size="16"><i class="fa fa-spin fa-spinner"></i><font></center></div>';
      $('#sortable').after(dialog);
      $('#processing').dialog({
        width:400,
        modal:true
      });
    },
    complete: function () {
      $('#processing').remove();
    },
    success: function (data) {
      $('#processing').remove();
      var dialog = '<div id="complete" title="Complete">Commands are saved on server as <font color="red">' + data +
        '</font>. If you click the left button, all commands on this page will be merged into a single command.</div>';
      $('#sortable').after(dialog);
      $('#complete').dialog({
        width:600,
        modal:true,
        buttons: {
          "Merge into one command": function(){
            $("#complete").remove();
            $('#dialogExport').remove();
            $('div.command').hide('slow').remove();
            var cmd = $.extend(true,{},workflowCmd);
            cmd.parameters[0].value = data;
            cmd.parameters[4].value = data;
            addFromJson(cmd);
            return false;
          },
          "Stay on the page": function() {
            $("#complete").remove();
            return false;
          }
        }
      });
    }
  });
}

function updateJson(cmd,parentId){
  $('#' + parentId).empty();
  var jHtml = '<textarea class="jsonresult" readonly>' + JSON.stringify(cmd,null,2) + '</textarea>';
  $(jHtml).appendTo( $('#' + parentId) );
}

function updateOrder(){
  $('div.command').each(function() {
    var cmd = $(this);
    var on = cmd.find('.num');
    on.empty();
    on.html(cmd.index() + 1);
  });
}

$(function() {
  $.ajaxSetup({
    type: 'GET',
    dataType: 'json',
    timeout: 86400000
  });

  $('#autoDisable').click(function(){
    $(this).toggleClass('fa-check-square-o fa-square-o');
  });

  $('#export').click(function(){
    $("#dialogExport").remove();
    var dialog = '<div id="dialogExport" title="Export commands to JSON"><center><textarea id="jsonExport" class="json" readonly>[';
    var cmds = [];
    $('.jsonresult').each(function(){
      var json = $.parseJSON($(this).val());
      if ($(this).parents('div.command').find('table.cmdhead').hasClass('disabled')) {
        json.disabled = true;
      } else {
        delete json.disabled;
      }
      var kvList = $(this).parents('div.command').find('textarea[name="variableList"]').val();
      if (kvList != '') { json.variables = kvList; }
      cmds.push(JSON.stringify(json,null,2));
    });
    dialog += cmds.join(',');
    dialog += ']</textarea></center></div>';
    $('#sortable').after(dialog);
    $( "#dialogExport" ).dialog({
      width:600,
      modal:true,
      buttons: {
        "Triggers alone": function(){
          minifyCmds();
          return false;
        },
        "Save on server": function(){
          saveCmds();
          return false;
        }
      }
    });
  });

  $('#import').click(function(){
    $("#dialogImport").remove();
    var dialog = '<div id="dialogImport" title="Import commands from JSON"><center><textarea id="jsonImport" class="json">';
    dialog += '</textarea></center></div>';
    $('#sortable').after(dialog);
    $( "#dialogImport" ).dialog({
      width:600,
      modal:true,
      buttons: {
        "Add commands": function(){
          importCmds($('#jsonImport').val());
          return false;
        }
      }
    });
  });

  $('#onOffAll').click(function(){
    $(this).toggleClass('fa-toggle-on fa-toggle-off');
    if ($(this).hasClass('fa-toggle-off')) {
      $('.onoff.fa-toggle-on').trigger('click');
    } else {
      $('.onoff.fa-toggle-off').trigger('click');
    }
  });

  $('#parallel').click(function(){
    $('div.command').has('table.cmdhead:not(.disabled)').has('form').each(function(){
      runCmd($(this),'self');
    });
  });

  $('#rerun').click(function(){
    $(this).toggleClass('fa-spin');
  });

  $('#serial').click(function(){
    var firstCmd = $('div.command').has('table.cmdhead:not(.disabled)').has('form').first();
    if (firstCmd !== 'undefined') { runCmd(firstCmd,'next'); }
  });

  $('#sortable').on('change', 'textarea[name*="wf_des"]', function() {
    var des = $(this).parents('div.command').find('span.description');
    var text = $(this).val().split('\n')[0];
    des.html(text);
  });

  $('#toggleAll').click(function(){
    $(this).toggleClass('fa-toggle-down fa-toggle-up');
    if ($(this).hasClass('fa-toggle-down')){
      $('.toggle.fa-toggle-up').trigger('click');
    } else {
      $('.toggle.fa-toggle-down').trigger('click');
    }
  });

  $.get('/api/v1/showCommand',function(webcmd){
    $("#sortable").sortable({
      update: function() {
        updateOrder();
      }
    });

    workflowCmd = $(webcmd).filter(function() {
      return $(this).attr('script') == 'Workflow\\interfaces.ps1';
    })[0];

    select_cmd = '<select class="cmdlist shadow"><option selected disabled>Select a command</option>';

    webcmd.push(
      sleepCmd
    );
    webcmd.push(
      defineVariableCmd
    );

    cmd_list = $(webcmd)
      .sort(function(a, b){
        var x = (($(a).attr('functionalities')[0] || '') + $(a).attr('synopsis')).toLowerCase();
        var y = (($(b).attr('functionalities')[0] || '') + $(b).attr('synopsis')).toLowerCase();
        return x == y ? 0 : x < y ? -1 : 1
      })
      .each(function(){
        select_cmd += '<option value="' + $(this).attr('script') + '">';
        var func = $(this).attr('functionalities')[0] || '';
        if (func != '') { select_cmd +=  func + " > " }
        select_cmd += $(this).attr('synopsis') + '</option>';
      });
    select_cmd += '</select>';

    addCommand();

    $("#sortable").on('change', '.cmdlist', function(){
      $(this).parents("div.command").find(".content:first").empty();
      var status = $(this).parents('div.command').find('.sta, .des');
      status.empty();
      var script = $(this).val();
      var cmd = $(webcmd).filter(function() {
        return $(this).attr('script') == script;
      });
      drawCmd(cmd[0], $(this).parents("div.command"));
    });

    $('#sortable').on('change', '.input', function() {
      var pName = $(this).attr('name');
      try {
        var pValue = $.parseJSON($(this).val());
      } catch (e) {
        var pValue = $(this).val();
      }
      var json = $.parseJSON($(this).parents('div.command').find('.jsonresult').val());
      json.parameters.forEach(function(param){
        if (param.name == pName) {
          if (pValue == '') {
            delete param.value;
          } else {
            param.value = pValue;
          }
        }
      })
      var jsoTabId = $(this).parents('div.command').find('.jsoTab').attr('id');
      updateJson(json,jsoTabId);
    });

    $("#sortable").on('change', '.methodlist', function(){
      $(this).parents("div.par").nextAll().find(".input").val('').change();
      $(this).parents("div.par").nextAll().remove();
      var method = $(this).val();
      var status = $(this).parents('div.command').find('.sta, .description');
      status.empty();
      var script = $(this).parents('div.command').find('.cmdlist').val();
      var cmd = $(webcmd).filter(function() {
        return $(this).attr('script') == script;
      });
      var formId = $(this).parents('form').prop('id');
      var help = $(this).parents("div.command").find("div.methodhelp");
      cmd[0].parameters.forEach(function(param){
        if (param.name == method) {
          if (param.helpmessage != undefined)
            help.html(param.helpmessage).hide().slideDown('slow');
          else
            help.hide();
        }
        if ( $.inArray(method, param.parametersets) > -1 ) {
          drawParam(param, formId);
        }
      });
      //$(this).parents("div.par").nextAll().find(".input[type='hidden']").val('1').change();
      var json = $.parseJSON($(this).parents('div.command').find('.jsonresult').val());
      json.method = method;
      var jsoTabId = $(this).parents('div.command').find('.jsoTab').attr('id');
      updateJson(json,jsoTabId);
    });

    // $('#sortable').on('change', '.varTab textarea[name="variableList"]', function(){
      // var cmd = $(this).parents('div.command');
      // var json = $.parseJSON(cmd.find('.jsonresult').val());
      // json.variables = $(this).val();
      // jsoTabId = cmd.find('.jsoTab').attr('id');
      // updateJson(json, jsoTabId);
    // });

    $("#sortable").on('click', '.add', function(){
      var currentCommand = $(this).parents('div:first');
      addCommand(currentCommand);
      updateOrder();
    });

    $("#sortable").on('click', '.delete', function(){
      //$(this).parents("div:first").remove();
      var cmd = $(this).parents("div.command:first");
      cmd.hide('slow', function(){
        cmd.remove();
        updateOrder();
      });
    });

    $("#sortable").on('click', '.onoff', function(){
      var cmdform = $(this).parents("div:first").find('form');
      cmdform.toggleClass('off');
      $(this).parents(".cmdhead").toggleClass('disabled');
      $(this).toggleClass('fa-toggle-on fa-toggle-off');
    });

    $("#sortable").on('click', '.run', function(){
      var cmd = $(this).parents('div.command');
      runCmd(cmd, 'stop');
    });

    $("#sortable").on('click', '.toggle', function(){
      $(this).parents('table').next('div.cmdbody:first').slideToggle(500);
      $(this).toggleClass('fa-toggle-up fa-toggle-down');
    });

    var template = document.location.search.substr(1);
    if ( template !== "") {
      $.ajax({
        url: template,
        dataType: 'json',
        async: false,
        success: function(data) {
          $("div.command").remove();
      		addFromJson(data);
				}
			});
		}
	});
});
