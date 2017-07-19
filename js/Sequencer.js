var sequencerTasks = [];

sequencerAddItems = function (arr)
{
	var i = arr.length;
	while (i)
	{
		i--;
		sequencerTasks.unshift(arr[i]);
	}
	sequencerExecuteNextStep();
}

sequencerExecuteNextStep = function (value)
{
	if (sequencerTasks.length == 0)
		return;
	var step = sequencerTasks.shift();
	if (step == null)
		return;
		
	var func = step.func;
	if (!func)
		trace("Error: function does not exist");
	if (step.vars || step.vars == false)
		func(step.vars);
	else
		func();
}

sequencerNext = function (delay)
{
	if (sequencerTasks.length)
		setTimeout(sequencerExecuteNextStep, 60);
}

sequencerNextInstant = function (delay)
{
	if (sequencerTasks.length)
		sequencerExecuteNextStep();
}


sequencerClear = function ()
{
	sequencerTasks = [];
}

