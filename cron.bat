$action = New-ScheduledTaskAction -Execute './init.bat'
$trigger = New-ScheduledTaskTrigger -Daily -At 12am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "task"