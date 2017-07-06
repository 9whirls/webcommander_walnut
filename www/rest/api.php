<?php
/* Author: Jian Liu, whirls9@hotmail.com */
require_once __DIR__.'/vendor/autoload.php';
$app = new Silex\Application();
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
header("Content-type:application/json");
$codeArray = array(
  "4000" => "Missing parameters",
  "4001" => "Fail - connect to server",
  "4002" => "Fail - connect to VC",
  "4003" => "Fail - get VM",
  "4004" => "Fail - get snapshot",  
  "4005" => "Fail - open page",
  "4006" => "Fail - find installer", 
  "4007" => "Fail - VMware Tools is not running",
  "4008" => "Fail - find snapshot",
  "4009" => "Fail - restore snapshot",
  "4010" => "Fail - delete snapshot",
  "4011" => "Fail - create snapshot",
  "4012" => "Fail - find unique snapshot",
  "4013" => "Fail - initialize broker",
  "4014" => "Fail - invalid license",
  "4015" => "Fail - add VC to broker",
  "4016" => "Fail - pool already exists",
  "4017" => "Fail - add pool to broker",
  "4018" => "Fail - run VM script",
  "4019" => "Fail - copy file",
  "4020" => "Fail - find desktop",
  "4021" => "Fail - find user",
  "4022" => "Fail - find a desktop assigned to user",
  "4023" => "Fail - update VMware Tools",
  "4024" => "Fail - add broker license",
  "4025" => "Fail - add transfer server",
  "4026" => "Fail - find transfer server",
  "4027" => "Fail - remove transfer server",
  "4028" => "Fail - find internal cmdlets",
  "4029" => "Fail - add standalone composer",
  "4030" => "Fail - find VC",
  "4031" => "Fail - add composer domain",
  "4032" => "Fail - send file to remote machine",
  "4033" => "Fail - entitle pool",
  "4034" => "Fail - connect to remote Windows system",
  "4035" => "Fail - unknown product type",
  "4036" => "Fail - uninstall application",
  "4037" => "Fail - download file",
  "4038" => "Fail - install",
  "4039" => "Fail - create new virtual machine",
  "4040" => "Fail - find build",
  "4041" => "Fail - set event database",
  "4042" => "Fail - create AD forest",
  "4043" => "Fail - join machine to domain",
  "4044" => "Fail - upgrade Powershell",
  "4045" => "Fail - create AD domain",
  "4046" => "Fail - update firmware",
  "4047" => "Fail - add farm",
  "4048" => "Fail - delete farm",
  "4049" => "Fail - add RDS server to farm",
  "4050" => "Fail - remove RDS server from farm",
  "4051" => "Fail - add application",
  "4052" => "Fail - delete application",
  "4053" => "Fail - entitle application",
  "4054" => "Fail - set HTML access",
  "4055" => "Fail - create desktop pool",
  "4056" => "Fail - set pool display name",
  "4400" => "Fail - execution timeout",
  "4444" => "Fail - unknown error occurred",
  "4445" => "Fail - run Powershell script",
  "4446" => "Fail - find script",
  "4488" => "Success - no error occurred"
);

function getIpAddress() {
  $ipaddress = '';
  if (getenv('HTTP_CLIENT_IP'))
    $ipaddress = getenv('HTTP_CLIENT_IP');
  else if(getenv('HTTP_X_FORWARDED_FOR'))
    $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
  else if(getenv('HTTP_X_FORWARDED'))
    $ipaddress = getenv('HTTP_X_FORWARDED');
  else if(getenv('HTTP_FORWARDED_FOR'))
    $ipaddress = getenv('HTTP_FORWARDED_FOR');
  else if(getenv('HTTP_FORWARDED'))
    $ipaddress = getenv('HTTP_FORWARDED');
  else if(getenv('REMOTE_ADDR'))
    $ipaddress = getenv('REMOTE_ADDR');
  else
    $ipaddress = 'UNKNOWN';    
  
  if ($ipaddress == '::1')
    $ipaddress = '0.0.0.0';

  return $ipaddress;
}

function missParamNotice($file=0) {
  global $target;
  header("return-code:4000");
  $content = "Missing parameters";
  if ($file) { $content .= " - fail to upload file"; }
  $error = array("time" => date("Y-m-d H:i:s"), 
    "content" => $content,
    "type" => "error");
  $target["output"] = array(array($error));
  $target["returnCode"] = 4000;
}

function missScriptNotice($script) {  
  header("return-code:4446");
  $error = array("time" => date("Y-m-d H:i:s"), 
    "content" => "find script " . $script,
    "type" => "error");
  $result = array("output" => array($error), "returnCode" => "4446");
  echo json_encode($result);  
}

function callCmd($cmd) {
  global $target, $codeArray; 
  exec($cmd,$result,$exitcode);
  
  $verbose = preg_grep("/^VERBOSE: /", $result);
  $pos = key($verbose);
  if ($pos != 0) {
    $target["rawoutput"] = array_slice($result,0,$pos);
  }
  $result = array_slice($result,$pos);
  $result = implode("",str_replace("VERBOSE: ","",$result));
  $target["output"] = json_decode($result);
  
  if (strpos($result, "Fail - ") === FALSE) {
    header("return-code:4488");
    $target["returncode"] = 4488; 
  } else {
    $isKnown = false;
    while ($errType = current($codeArray)){
      if (strpos($result, $errType) > 0){
        header("return-code:" . key($codeArray));
        $target["returncode"] = key($codeArray);
        $isKnown = true;
        break;
      }
      next($codeArray);
    }
    if ($isKnown === false) {
      header("return-code:4444");
      $target["returncode"] = 4444;
    }
  }
}

function searchCommand($allCommands, $script) {
  foreach($allCommands as $command) {
    if(isset($command['script']) && strcasecmp($command['script'], $script) == 0) {
       return $command;
    }
  }
  return null;
}

$src = json_decode(file_get_contents("../../sources.json"), true);
$commands = array();
foreach($src as $name=>$url) {
  $def = file_get_contents($url);
  if ($def === false) { 
    continue;
  } else {
    $cmds = json_decode($def, true);
  }
  foreach ($cmds as &$cmd) {
    $cmd['synopsis'] = $cmd['synopsis'] . ' ( ' . $name . ' )';
  }
  $commands = array_merge_recursive( $commands, $cmds );
}

$req = array_change_key_case($_REQUEST, CASE_LOWER);
$script = $req["script"];
$clientIp = getIpAddress();

$app->get('/api/v1/showReturnCode', function () use ($codeArray) {
  return json_encode($codeArray);
});

$app->get('/api/v1/showCommand', function (Request $request) use ($commands) {
  $script = $request->get('script');
  if ($script == "") {
    return json_encode($commands);
  } else {
    $target = searchCommand($commands, $script);
    return json_encode($target);
  }
});

$app->get('/api/v1/showHistory/', function () {
  $m = new Mongo('mongodb://webcmd:9whirls@ds135797.mlab.com:35797/9whirls');
  $m_collection = $m->selectCollection('9whirls', 'history');
  $cursor = $m_collection->find();
  $output = array(
    "sEcho" => intval($input['sEcho']),
    "iTotalRecords" => $m_collection->count(),
    "iTotalDisplayRecords" => $cursor->count(),
    "aaData" => array(),
  );   
  foreach ( $cursor as $doc ) {
    $output['aaData'][] = $doc;
  } 
  return json_encode( $output );
});

$app->get('/api/v1/showHistory/{id}', function ($id) {
  $m = new Mongo('mongodb://webcmd:9whirls@ds135797.mlab.com:35797/9whirls');
  $m_collection = $m->selectCollection('9whirls', 'history');
  $mongo_id = new MongoID($id);
  $log = $m_collection->findOne(['_id'=>$mongo_id]);
  return json_encode($log);
});

$app->before(function (Request $request) {
  if (strpos($request->headers->get('Content-Type'), 'application/json') === 0) {
    $data = json_decode($request->getContent(), true);
    $request->request->replace(is_array($data) ? $data : array());
  }
});

$app->post('/api/v1/runCommand', function (Request $request) {
  return $request;
});

$app->get('/hello/{name}', function ($name) use ($app) {
    return 'Hello '.$app->escape($name);
});

$app->run();