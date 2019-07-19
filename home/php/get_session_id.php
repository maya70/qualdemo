<?php
$file = './session_counter.txt';
$ret = file_get_contents($file);
$next = $ret + 1; 
file_put_contents($file, $next);
 
echo($ret);
?>