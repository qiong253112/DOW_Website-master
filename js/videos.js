var videosEnterTL, videosExitTL;
var vidShortLabel = false;
var vidCurLabel = "";
var videoData = new Array();
var	vidFBShareUrl = "";
var	vidTWShareUrl = "";
var curVid = "";
	
function videosInit()
{
	videosEnterTL = new TimelineMax({ immediateRender: true, paused: true, onComplete: videosOnEnter, onReverseComplete: videosOnExit })
		.insert(TweenLite.to('#videos', .02, { display: 'block' }), .05)
		.insert(TweenLite.to('#videos #bgL', .3, { left: '0', ease: Power1.easeIn }), .1)
		.insert(TweenLite.to('#videos #bgR', .3, { right: '0', ease: Power1.easeIn }), .1)
		.insert(TweenLite.to('#videosFooter', .2, { bottom: '0', ease: Power1.easeIn }), .2);
		
	videoData['tvspot1'] = {name:"TV Spot", 
								id:"0jz_wdyrSkk", 
								msg:"Watch+the+TV+spot+now", 
								copy:"Share the TV Spot", 
								track:"Watch TV Spot"};
	videoData['trailer'] = {name:"Teaser", 
								id:"slfrrjPndV4", 
								msg:"Watch+the+trailer+now", 
								copy:"Share the Trailer", 
								track:"Watch Teaser"};
	videoData['trailer2'] = {name:"Trailer", 
								id:"TvRCQM2HrXs", 
								msg:"Watch+the+trailer+now", 
								copy:"Share the Trailer", 
								track:"Watch Trailer"};
	
	$(".videoThumb").click(function() {
		playVideo($(this).attr("vidId"));
	});

	setVideoShare(videoData['tvspot1']);

	$('#vidShareText').focus(function(e) {
		trackEventLabel("Video Sharing", curVid, "Grab Link");
		this.select();
	});
	$("#videoShareFB").click(function() {
		trackEventLabel("Video Sharing", curVid, "Facebook");
		window.open(vidFBShareUrl);
	});
	$("#videoShareTW").click(function() {
		trackEventLabel("Video Sharing", curVid, "Twitter");
		window.open(vidTWShareUrl);
	});
		
}

function videosEnter()
{
	hideSubLogo();
	trackEvent('Homepage', 'Videos');
	playSound("hit");
	videosEnterTL.play();
}

function videosOnEnter()
{
	sequencerNext();
	$("#videosShell").css('display', 'block');
	playVideo('trailer2');
}

function videosExit()
{
	videoIsCued = false;
	if (videoPlayer != null)
	{
		videoPlayer.stopVideo();
		videoPlayer.destroy();
		videoPlayer = null;
	}
	$("#videosShell").css('display', 'none');
	videosEnterTL.reverse();
}
function videosFastExit()
{
	if (videoPlayer != null)
	{
		videoPlayer.stopVideo();
		videoPlayer.destroy();
		videoPlayer = null;
	}
	$("#videosShell").css('display', 'none');
	videosEnterTL.gotoAndStop(0);
	sequencerNext();
}

function videosOnExit()
{
	sequencerNext();
}


function videosResize( newW, newH )
{
	vidShortLabel = newW < 870;
	$('#videoShare').text(vidShortLabel ? 'SHARE' : vidCurLabel);
}


function setVideoShare(vid)
{
	vidCurLabel = vid.copy;
	$("#videoShare").text(vidShortLabel ? 'SHARE' : vidCurLabel);
	$("#vidShareText").val("http://youtu.be/" + vid.id);
	vidFBShareUrl = "https://www.facebook.com/sharer.php?u=http://www.worldwarzmovie.com"; //http://www.youtube.com/watch?v=" + vid.id;
	vidTWShareUrl = "https://twitter.com/intent/tweet?url=http%3A%2F%2Fwww.worldwarzmovie.com" + "&text=Get+a+first+look+at+World+War+Z,+starring+Brad+Pitt.+@WorldWarZmovie+" + vid.msg; //http%3A%2F%2Fyoutu.be%2F" + vid.id
}

function playVideo(vidId)
{
	if (vidId != curVid)
	{
		if (curVid != '')
		{
			$('.videoThumb[vidId="'+curVid+'"]').removeClass('selected');
		}
		$('.videoThumb[vidId="'+vidId+'"]').addClass('selected');
		curVid = vidId;
		var vid = videoData[vidId];
	
		trackEvent("Videos", vid.track);
		setVideoShare(vid);
	}

	if (!videoPlayerReady)
		videoIsCued = true;
	if (videoPlayer == null)
	{
		videoPlayer = new YT.Player('videosPlayer', {
			height: '100%',
			width: '100%',
			videoId: videoData[vidId].id,
			color: '#000',
			enablejsapi: 1,
			modestbranding: 1,
			rel: 0,
			showInfo: 0,
			autohide: 1,
			events: {
           		'onReady': onPlayerReady
            }
		});
	}
	else
	{
		videoPlayer.loadVideoById( videoData[vidId].id );
	}
}

function onPlayerReady (e)
{
	videoPlayer.playVideo();
	$("#videosShell").css('display', 'block');
}

function pauseVideo()
{
	if (videoPlayer == null)
		return;
		
	videoPlayer.pauseVideo();
	
}
var videoIsCued = false;
var videoPlayerReady = false;
var videoPlayer = null;
function onYouTubeIframeAPIReady() {
	videoPlayerReady = true;
	if (videoIsCued)
	{
		videoIsCued = false;
		playVideo(curVid);
	}
}