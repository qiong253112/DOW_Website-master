$(document).ready(init);

// ----------------------------------------------
var section = "loading";
var lastSection = "";
var logo, releaseDate;
var logoSize = [];
var homeLogoScale = 0;
var subpageLogoScale = .4;
var bgType = "video";
var doc;
var soundEnabled = true;
var isAndroid = false;
var inited = false;
var vidCanPlay = false;
var simplify = true;

function init(e) {
	if (upgradeCheck())
	{
		$('#upgrade').css('display', 'block');
		$('#shell').remove();
		return;
	}
	inited = true;
	doc = $(document.documentElement);
	
	isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
		
	if ($.browser.mobile || isAndroid)
	{
		doc.addClass('noSound');
		soundEnabled = false;
	}
	
	
	$('#upgrade').remove();
	logo = $('.logo');
	releaseDate = $('#releaseDate');
	logoSize = [980, 404, 954, 111]; // logo w-h rel w-h logo-pre w-h
	$(window).resize(handleResize);
	handleResize();
	
	
	prepareHeaderAndFooter();
	prepareVideo();
	prepareSounds();
	var tag = document.createElement('script');
	
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	if (!$.browser.mobile)
		videosInit();
	storyInit();
	galleryInit();
	
	
	//muteSounds();
	preloadStart();
	
}

function upgradeCheck() {
	if (navigator.userAgent.toLowerCase().indexOf("google web preview") != -1)
		return false;
	if (/chrome/.test(navigator.userAgent.toLowerCase())) {
		var userAgent = navigator.userAgent.toLowerCase(); 
		userAgent = userAgent.substring(userAgent.indexOf('chrome/') +7);
 		userAgent = userAgent.substring(0,userAgent.indexOf('.'));
		if (userAgent < 20)
			return true;
		else
			return false;
	}
	if($.browser.msie && parseInt($.browser.version) < 8) { return true;}
	if($.browser.opera && parseInt($.browser.version) <= 9) { return true;}
	if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
		var ffversion=new Number(RegExp.$1)
		if (ffversion<=14) { return true;}
	}

	if ($.browser.safari && $.browser.mobile) return false;
	var safVers = navigator.userAgent.substr(navigator.userAgent.lastIndexOf('Version/') + 8, 1);
	if ($.browser.safari && (Number(safVers) < 6) ){ simplify = true;}
	
	if ($.browser.safari && (Number(safVers) < 5) ){return true;}
	return false;
}

// PRELOADING --------------------------------------------------
var imagesLoaded = 0,
	imagesToLoad;

function preloadStart() {
	if (bgType != 'video')
	{
		imagesToLoad = [];
		for (var i=0; i< bgImages.length; i++)
		{
			imagesToLoad.push("img/bgs/"+bgImages[i]);
		}
		$(document).smartpreload({ 
			images: imagesToLoad, 
			oneachimageload: function(src) {
		
				imagesLoaded++;
				onLoadUpdate();
			}, 
			onloadall: function() {
				preloadCompleteHandle();
			}
		});
	}
	else if ($.browser.mobile)
	{
		TweenLite.to($('#preload #progressBar'), 1.5, { width: '100%' });
		setTimeout(preloadCompleteHandle, 1500);
	}
}
function onLoadUpdate() {
	var pct = Math.round(imagesLoaded/imagesToLoad.length * 100);
	TweenLite.to($('#preload #progressBar'), .5, { width: pct+'%' });
}

function onVideoLoadUpdate(value) {
	TweenLite.to($('#preload #progressBar'), .5, { width: value+'%' });
}

function handleVideoCanPlay() {
	vidCanPlay = true;
	if (inited)
		onVideoLoadComplete()
	
}

function onVideoLoadComplete() {
	bgVid.unbind('progress', handleVideoProgress);
	bgVid.unbind('canplay', onVideoLoadComplete);
	preloadCompleteHandle();
}

function preloadCompleteHandle () {
	TweenLite.to($('#preload #progressBar'), .5, { width: '100%' });
	TweenLite.to($('#preload #bar'), .3, { alpha: 0, delay: .5 });
	if ($.browser.mobile)
	{
		$('#enterLabel').fadeIn(400);
		$('body').click(enterSite).css('cursor', 'pointer');
	}
	else
		enterSite();
}


// THE VIDEO ----------------------------------------------------
var bgVid;
var bgPlayer;
var bgVidPlaying = true;
var bgWasPlaying = true;
var bgImages = ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg'];
var curBg = 0;
var bgImgTL;
var bgImgTime = 5;
function prepareVideo()
{
	if (Modernizr.video && !simplify)
	{
		bgVid = $('#bgVideo');
		bgPlayer = bgVid.get(0);
		bgVid.removeAttr( "controls" );
		if (!$.browser.mobile)
		{
			bgVid.bind('progress', handleVideoProgress);
			bgVid.bind('canplay',  onVideoLoadComplete);
			if (vidCanPlay)
				onVideoLoadComplete();
		}
		if (isAndroid)
		{
			bgPlayer.loop = false; 
			bgPlayer.addEventListener('ended', function() { bgPlayer.currentTime=0.1; bgPlayer.play(); }, false);
		}
		
	}
	else
	{
		bgImgTL = new TimelineMax({ paused: true, immediateRender: true, repeat: -1 });
		$('#bg').empty();
		var firstImg;
		for (var i=0; i<bgImages.length; i++)
		{
			var img = $('<img src="img/bgs/'+bgImages[i]+'" width="1920" height="1080" class="abs">').css({ opacity: i == 0 ? 1 : 0, visibility: i == 0 ? 'visible' : 'hidden' });
			if (i == 0)
				firstImg = img;
			$('#bg').append(img);
			bgImgTL.insert(TweenLite.to(img, .3, { autoAlpha: 0, ease: Linear.easeNone }), (i+1)*bgImgTime);
			bgImgTL.insert(TweenLite.to(img, .3, { autoAlpha: 1, ease: Linear.easeNone }), i*bgImgTime);
		}
		bgImgTL.insert(TweenLite.to(firstImg, .3, { autoAlpha: 1, ease: Linear.easeNone }), i*bgImgTime);
		bgType = "image";
		handleResize();
	}
}

function startBgVideo()
{
	if (bgType == "video")
		bgPlayer.play();
	else
		bgImgTL.play();
}

function handleVideoProgress(e) {
	var percent = null;
	var end = 0;
	if(bgPlayer.buffered.length >= 1){
		end = bgPlayer.buffered.end(0);
		//console.log(bgPlayer.buffered.length+":"+bgPlayer.buffered.end(0));
	}
	var progress = bgPlayer.buffered.end(0); //bgPlayer.duration;
	progress = isNaN(progress) ? 0 : progress;
	
	onVideoLoadUpdate(Math.min(100, Math.max(0, progress/10)));
}

function toggleBgVideoPlay (e) {
	if (doc.hasClass('freezeVideo'))
		return false;
		
	trackEvent('Homepage', 'Play');
	if (bgVidPlaying)
		pauseBgVideo();
	else
		playBgVideo();
		
	return false;
}

// system controls
function freezeVideo() {
	bgWasPlaying = bgVidPlaying;
	if (bgWasPlaying)
		pauseBgVideo();
	soundManager.setVolume('music', 0);
	doc.addClass('freezeVideo');
}

function unfreezeVideo() {
	if (bgWasPlaying)
		playBgVideo();
	soundManager.setVolume('music', 100);
	doc.removeClass('freezeVideo');
	sequencerNext();
}

// manual controls
function pauseBgVideo() {
	if (!bgVidPlaying)
		return;
	bgVidPlaying = false;
	doc.addClass('videoPaused');
	if (bgType == 'video')
		bgPlayer.pause();
	else
		bgImgTL.pause();
}

function playBgVideo() {
	if (bgVidPlaying)
		return;
			
	bgVidPlaying = true;
	doc.removeClass('videoPaused');
	if (bgType == 'video')
		bgPlayer.play();
	else
		bgImgTL.play();
}

// SITE ENTRY ---------------------------------------------------

function prepareHeaderAndFooter() {
	if (Modernizr.fullscreen)
	{
		$('#fsIcon').click(function (e) { 
			$(document).toggleFullScreen();
			trackEvent('Homepage', 'Full Screen');
		});
		$(document).bind("fullscreenchange", handleFSChange);
	}
	
	$('#soundIcon').click(function (e) {
		toggleSound();
		trackEvent('Homepage', 'Volume');
	});
	$('#playPauseIcon').click(toggleBgVideoPlay);
	$("#creditsBtn").click(openCredits);
	$("#creditsClose").click(closeCredits);
	$('#menu a').click(handleMenuClick);
}


function openCredits(e)
{
	TweenLite.to( $("#creditsDrawer"), .4, { css: { bottom: 0 }, ease: Expo.easeOut });
}
function closeCredits(e)
{
	TweenLite.to( $("#creditsDrawer"), .4, { css: { bottom: -230 }, ease: Expo.easeOut });
}


function enterSite() {
	if ($.browser.mobile)
	{
		
		videosInit();
		$('body').unbind('click', enterSite).css('cursor', 'default');
		TweenLite.to($('#enterLabel'), .2, { autoAlpha: 0, display: 'none' });
	}
	
	startBgVideo();
	section = 'home';
	$('#menu a[rel='+section+']').addClass('selected')
	var enterTL = new TimelineMax({ paused: true, immediateRender: true })
		.insert(TweenLite.to($('#preload #bar'), .2, { autoAlpha: 0 }), 0.1)
		.insert(TweenLite.to($('#preload #top'), .4, { top: '-50%', ease: Strong.easeIn }), .2)
		.insert(TweenLite.to($('#preload #bottom'), .4, { top: '100%', ease: Strong.easeIn }), .2)
		.addCallback(function() { playSound('hit') }, .2)
		
		.insert(TweenLite.to($('#logoPre'), .4, { width: logoSize[0]*homeLogoScale, height: logoSize[1]*homeLogoScale, 'margin-left': -logoSize[0]*.5 * homeLogoScale, 'margin-top': -logoSize[1]*.5 * homeLogoScale, ease: Strong.easeIn }), .2)
		.insert(TweenLite.to(logo, .4, { width: logoSize[0]*homeLogoScale, height: logoSize[1]*homeLogoScale, 'margin-left': -logoSize[0]*.5 * homeLogoScale, 'margin-top': -logoSize[1] *.7 * homeLogoScale, ease: Strong.easeIn }), .2)
		.insert(TweenLite.to($('#logoWW'), .05, { display: 'block' }), .5)
		.insert(TweenLite.to($('#logoWW'), .5, { opacity: 1 }), .5)
		.insert(TweenLite.to($('#logoSeries'), .05, { display: 'block' }), .5)
		.insert(TweenLite.to($('#logoSeries'), .5, { opacity: 1 }), .5)
		.insert(TweenLite.to($('#logoPre'), .1, { display: 'none' }), .5)
		.insert(TweenLite.to(releaseDate,.1, { display: 'block', marginTop: logoSize[1]*homeLogoScale * .58, ease: Strong.easeIn }), .6)
		
		.insert(TweenLite.to($('#front'), .4, { top: '39%', ease: Strong.easeIn }), .2)
		.insert(TweenLite.to($('#header'), .3, { marginTop: 0, ease: Expo.easeOut, immediateRender: true}), .6)
		.insert(TweenLite.to($('#footer'), .3, { marginBottom: 0, ease: Expo.easeOut, immediateRender: true}), .6)
		.insert(TweenLite.to($('#bg'), 0.1, { display: 'block' }), .5)
		//.addCallback(startBgVideo, .5)
		.addCallback(function () { $('#preload').remove() }, .7 )
		//.addCallback(prepHomeLogo, .7 )
		.play();
}

function enterDeeplink () {
	if (deeplink == '')
		return;
		
	changeSection(deeplink);
}

function prepHomeLogo () {
	$('#logoBtn')
		.removeClass('disabled')
		.click(function(e) {
			changeSection('videos');
		});
}

// SITE NAV + SECTION CHANGE ------------------------------------

function handleMenuClick(e) {
	if ($(this).hasClass('jsLink') || $(this).hasClass('htmlLink'))
		return;
	changeSection($(this).attr('rel'));
	return false;
}

function changeSection (value) {
	if (value == section)
		return;
	
	$('#menu a[rel='+section+']').removeClass('selected');
	$('#menu a[rel='+value+']').addClass('selected');
	lastSection = section;
	section = value;
	if (lastSection == 'home')
	{
		freezeVideo();
		
		sequencerAddItems([
			{ func: enterNextSection, vars: null }
		]);
	}
	else
	{
		if (value == 'home')
		{
			hideSubLogo();
			unfreezeVideo();
			
			sequencerAddItems([
				{ func: exitLastSection, vars:  [false] }
			]);
		}
		else
		{
			$('#'+lastSection).css('z-index', 120);
			$('#'+section).css('z-index', 121);
			
			sequencerAddItems([
				{ func: enterNextSection, vars: null },
				{ func: exitLastSection, vars: [true]}
			]);
		}
	}
}

function enterNextSection () {
	if(this[section+"Enter"])
		this[section+"Enter"]();
}
function exitLastSection (fastFlag) {
	if (fastFlag)
	{
		if(this[lastSection+"FastExit"])
			this[lastSection+"FastExit"]();
	}
	else
	{	if(this[lastSection+"Exit"])
			this[lastSection+"Exit"]();
	}
}

function hideSubLogo() {
	$('#subLogo').fadeOut(100);
}
function showSubLogo() {
	$('#subLogo').fadeIn(150);
}

// SOUND --------------------------------------------------------
var isMuted = false;
var firstSoundClick = true;
var hitSound, musicSnd;
var soundURL = mediaURL == '' ? 'mp3/' : mediaURL;
function prepareSounds() {
	if (!soundEnabled)
		return;
		
	soundManager.setup({
		url: "swf/",
		flashVersion: 9,
		allowScriptAccess: 'always',
		preferFlash: false,
		onready: function() {
			
			hitObj = {
				id: 'hit',
				url: soundURL+'hit.mp3',
				autoPlay: false,
				autoLoad: true
			};
			hitSound = soundManager.createSound(hitObj);
			
			musicObj = {
				id: 'music',
				url: soundURL+'loop.mp3',
				autoPlay: false,
				autoLoad: true
			};
			
			if ($.browser.mobile)
				musicObj.onfinish = function () { startMusic() };
			else 
				musicObj.loops = 99999;
			musicSnd = soundManager.createSound(musicObj);
			
			if (doc.hasClass('isMuted'))
				soundManager.mute();
		}
	});
	muteSounds();		
}

function startMusic ()
{
	if (!soundEnabled || firstSoundClick)
		return;
		
	soundManager.play("music", musicObj);
}

function toggleSound() {
	if (!soundEnabled)
		return;
	if (firstSoundClick)
	{
		firstSoundClick = false;
		startMusic();
	}
	
	if (doc.hasClass('isMuted'))
		unmuteSounds();
	else
		muteSounds();
}

function muteSounds() {
	if (!soundEnabled)
		return;
		
	if (doc.hasClass('isMuted'))
		return;
	doc.addClass('isMuted');
	soundManager.mute();
}

function unmuteSounds() {
	if (!soundEnabled || firstSoundClick)
		return;
		
	if (!doc.hasClass('isMuted'))
		return;
	
	doc.removeClass('isMuted');
	soundManager.unmute();
}

function playSound(value) {
	if (!soundEnabled || firstSoundClick)
		return;
			
	switch (value)
	{
		case 'hit':
			 soundManager.play("hit", hitObj);
			 break;
	}
}


// MAIN EVENTS --------------------------------------------------

function handleFSChange ()
{
	$('body')[$(document).fullScreen() ? 'addClass' : 'removeClass']('isFull');
}

function handleResize(e) {
	var winH = $(window).height();
	var winW = $(window).width();
	var shellH = $('#shell').height();
	var shellW = $('#shell').width();
	
	homeLogoScale = Math.min(1, (shellW - 100)/logoSize[0], (shellH - 340)/logoSize[1]);
	
	// logo resizing
	var logoScale = homeLogoScale; //Math.min(1, (shellW - 200)/logoSize[0], (shellH - 350)/logoSize[1]);
	logo.css({ width: logoSize[0]*logoScale, height: logoSize[1]*logoScale, 'margin-left': -logoSize[0]*logoScale * .5, 'margin-top': -logoSize[1]*logoScale * .7 });
	$('#enterLabel').css({ marginTop: logoSize[1]*logoScale * .4 });
	releaseDate.css({ marginTop: logoSize[1]*logoScale * .58,  width: logoSize[2]*logoScale, height: logoSize[3]*logoScale, 'margin-left': -logoSize[2]*logoScale * .5 });
	$('#logoSeries').css({ marginTop: -logoSize[1]*logoScale *.2,  width: 516*logoScale, height: 40*logoScale, 'margin-left': -516*logoScale * .5 });
	$('#menu').css({ 'margin-left': Math.min(0, (shellW-1100)*.5) });
	
	var subLogoScale = Math.max(.6, Math.min(1, (winH - 625)/263));
	var subDateScale = Math.max(.7, subLogoScale);
	$('#subLogoImg').css({ width: 540 * subLogoScale, height: 263 * subLogoScale});
	$('#subLogoReleaseDate').css({ width: logoSize[2] * subLogoScale, height: logoSize[3] * subLogoScale});
	// bg
	var bgW, bgH;
	
	if (bgType == "video")
	{
		bgH = shellH - 110;
		bgW = bgH / 576 * 1024;
		if (bgW < shellW)
		{
			bgW = shellW;
			bgH = bgW/1024 * 576;
		}
	$('#bgVideo').css({ height: bgH, width: bgW, left: (shellW - bgW) * .5 });
	}
	else
	{
		bgH = shellH - 110;
		bgW = bgH / 1080 * 1920;
		if (bgW < shellW)
		{
			bgW = shellW;
			bgH = bgW/1920 * 1080;
		}
		$('#bg img').css({ height: bgH, width: bgW, left: (shellW - bgW) * .5 });
	}
	
	videosResize(shellW, shellH - 110);
	galleryResize(shellW, shellH - 110);
	storyResize(shellW, shellH - 110, 62 + logoSize[3] * subLogoScale + 263 * subLogoScale);
}


function pauseSite() {
	if (section == 'videos')
		pauseVideo();
	pauseBgVideo();
	muteSounds();
}


// UTILS ---------------------------------------------------------
