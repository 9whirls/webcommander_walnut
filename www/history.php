<!-- Author: Jian Liu, whirls9@hotmail.com -->
<html>
<head>
<title>webcommander</title>
<link href="//cdn.datatables.net/1.10.15/css/jquery.dataTables.min.css" rel="stylesheet" />
<link href="//code.jquery.com/ui/1.11.4/themes/cupertino/jquery-ui.css" rel="stylesheet" />
<link href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.6/semantic.min.css" rel="stylesheet" />
<script src="//code.jquery.com/jquery-1.12.4.js"></script>
<script src="//code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
<script src="//cdn.datatables.net/1.10.15/js/jquery.dataTables.min.js"></script>
</head>
<body>
<table id="exec_hist" class="ui celled table" cellspacing="0" width="100%">
<thead><tr><th>Time</th><th>Exec Time</th><th>User</th><th>Command</th><th>Method</th><th>Return Code</th><th>Details</th></tr></thead>
<!--tfoot><tr><th>Time</th><th>Exec Time</th><th>User</th><th>Command</th><th>Method</th><th>Return Code</th><th>Details</th></tr></tfoot-->
<tbody>
<?php
mb_internal_encoding('UTF-8');
try {
  $m = new Mongo('mongodb://webcmd:9whirls@ds135797.mlab.com:35797/9whirls');
} catch (MongoConnectionException $e) {
  die('Error connecting to MongoDB server');
}
$m_collection = $m->selectCollection('9whirls', 'history');
 
$cursor = $m_collection->find();
foreach ($cursor as $document) {
  echo '<tr>';
  echo '<td>'.$document["time"]."</td>";
  echo '<td>'.$document["executiontime"]."</td>";
  echo '<td>'.$document["user"]."</td>";
  echo '<td>'.$document["synopsis"]."</td>";
	echo '<td>'.$document["method"]."</td>";
	echo '<td>'.$document["returncode"]."</td>";
  echo '<td>';
  echo '<a target="_blank" href="/exec.php?hisid='.$document["_id"].'">JSON</a>';
  echo ' | ';
  echo '<a target="_blank" href="/index.html?exec.php?hisid='.$document["_id"].'">GUI</a>';
  echo "</td>";
  echo '</tr>';
}
?>
</tbody></table>
</body>
<script>
$(document).ready(function() {
    $('#exec_hist').DataTable();
} );
</script>
</html>