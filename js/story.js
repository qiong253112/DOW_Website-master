var storyEnterTL, storyExitTL;

function storyInit()
{
	storyEnterTL = new TimelineMax({ immediateRender: true, paused: true, onComplete: storyOnEnter, onReverseComplete: storyOnExit })
		.insert(TweenLite.to('#story', .02, { display: 'block' }), .05)
		.insert(TweenLite.to('#story #bgL', .3, { right: '50%', ease: Power1.easeIn }), .1)
		.insert(TweenLite.to('#story #bgR', .3, { left: '50%', ease: Power1.easeIn }), .1)	
		.insert(TweenLite.from('#storyContent', .6, { marginTop: '-20px', autoAlpha: 0 , ease: Expo.easeInOut }), 0.1);		
}

function storyEnter()
{
	trackEvent('Homepage', 'Story');
	playSound("hit");
	storyEnterTL.play();
}

function storyOnEnter()
{
	showSubLogo();
	sequencerNext();
}

function storyExit()
{
	storyEnterTL.reverse();
}
function storyFastExit()
{
	storyEnterTL.gotoAndStop(0);
	sequencerNext();
}

function storyOnExit()
{
	sequencerNext();
}


function storyResize( newW, newH, logoTop )
{
	var bgW = Math.ceil(newW * .5);
	var bgH = bgW / 1243 * 967;
	if (bgH < newH)
	{
		bgH = newH;
		bgW = bgH / 967 * 1243;
	}
	$('.storyBg').css({ width: bgW, height: bgH});
	
	$('#storyContent').css('top', Math.min(200, Math.max(20, (newH - logoTop-140) * .6)));
}


