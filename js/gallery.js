var galleryEnterTL, galleryExitTL,
	galleryImages = new Array(),
	galleryCurrentId = -1,
	galleryImgLoader,
	galleryImgData,
	galleryChanging = false,
	galleryFirst = true,
	galleryW = 0, galleryH = 0,
	galleryImgW = 0, galleryImgH = 0;
	
	
function galleryInit()
{
	
	galleryImages = [
		{
			imageUrl: "img/gallery/1.jpg",
			scale: 'cover'
		},
		{
			imageUrl: "img/gallery/2.jpg",
			scale: 'cover'
		},
		{
			imageUrl: "img/gallery/2_1.jpg",
			scale: 'cover'
		},
		{
			imageUrl: "img/gallery/3.jpg",
			scale: 'cover'
		},
		{
			imageUrl: "img/gallery/4.jpg",
			scale: 'contain'
		},
		{
			imageUrl: "img/gallery/5.jpg",
			scale: 'cover'
		},
		{
			imageUrl: "img/gallery/6.jpg",
			scale: 'cover'
		},
		{
			imageUrl: "img/gallery/7.jpg",
			scale: 'cover'
		},
		{
			imageUrl: "img/gallery/8.jpg",
			scale: 'contain'
		},
		{
			imageUrl: "img/gallery/9.jpg",
			scale: 'cover'
		}
	];
	galleryEnterTL = new TimelineMax({ immediateRender: true, paused: true, onComplete: galleryOnEnter, onReverseComplete: galleryOnExit })
		.insert(TweenLite.to('#galleryShell', .02, { display: 'block' }), .05)
		.insert(TweenLite.to('#gallery', .02, { display: 'block' }), .05)
		.insert(TweenLite.to('#gallery #bgL', .3, { left: '0', ease: Power1.easeIn }), .1)
		.insert(TweenLite.to('#gallery #bgR', .3, { right: '0', ease: Power1.easeIn }), .1)
		.insert(TweenLite.from('#galleryShell', .2, { autoAlpha: 0, ease: Linear.easeNone, immediateRender: true}), .4)
		.insert(TweenLite.to('#galleryNext', .4, { marginRight: 0, ease: Expo.easeOut}), .5)
		.insert(TweenLite.to('#galleryBack', .4, { marginLeft: 0, ease: Expo.easeOut}), .5);
		
	prepGalleryButtons();		
}

function prepGalleryButtons()
{
	$("#galleryBack").click(function(e) {
		galleryLastImg();
		return false;
	});
	
	$("#galleryNext").click(function(e) {
		galleryNextImg();
		return false;
	});
}

function galleryEnter()
{
	hideSubLogo();
	trackEvent('Homepage', 'Visit To Gallery');
	playSound("hit");
	galleryEnterTL.gotoAndPlay(0);
}

function galleryOnEnter()
{
	sequencerNext();
	$("#galleryShell").css('display', 'block');
	if (!galleryFirst)
		return;
		
	galleryFirst = false;
	galleryChangeImg(0);
}

function galleryExit()
{
	
	$("#galleryShell").css('display', 'none');
	galleryEnterTL.reverse();
}
function galleryFastExit()
{
	$("#galleryShell").css('display', 'none');
	galleryEnterTL.gotoAndStop(0);
	sequencerNext();
}

function galleryOnExit()
{
	sequencerNext();
}


function galleryResize( newW, newH )
{
	galleryW  = newW;
	galleryH = newH;
	
	handleGalleryResize();
}

function handleGalleryResize()
{
	if (galleryW == 0 || galleryH == 0)
		return;
		
	var galImg = $('#galleryImg img');
	if (galImg.length == 0)
		return;
		
	// we have an image!
	var img = $(galImg[0]);
	var imgStyle = img.attr('id');
	var imgW = galleryW;
	var imgH = galleryW * galleryImgH/galleryImgW;
	if ((imgStyle == 'cover' && imgH < galleryH) || (imgStyle == 'contain' && imgH > galleryH))
	{
		imgH = galleryH;
		imgW = galleryH * galleryImgW/galleryImgH;		
	}
	img.width(imgW).height(imgH).css({ left: (galleryW - imgW) * .5, top:imgStyle=='contain' ? (galleryH - imgH) * .5 : 0 });
}


function galleryNextImg()
{
	if (galleryChanging)
		return;
	var nextNum = galleryCurrentId+1;
	if (nextNum >= galleryImages.length)
		nextNum = 0;
	galleryChangeImg(nextNum);
}

function galleryLastImg()
{
	if (galleryChanging)
		return;
	var nextNum = galleryCurrentId-1;
	if (nextNum < 0)
		nextNum = galleryImages.length - 1;
	galleryChangeImg(nextNum);
}


function galleryChangeImg(id){
	trackEvent("Images", "Image "+id);
	galleryChanging = true;
	$('#galleryImg').empty();
	TweenLite.set($('#galleryImg'), { css: {autoAlpha: 0 }});
	galleryCurrentId = id;
	galleryImgData = galleryImages[galleryCurrentId];
	galleryImgLoader = $('<img src="'+galleryImgData.imageUrl+'" style="position: absolute;"/>').attr('id', galleryImgData.scale).load(
	function() {
		if (galleryImgData.imageUrl != $(this).attr('src') && !isMobile)
			return;	
		galleryImgLoader.height(544);
		$('#galleryImg').append(galleryImgLoader);
		galleryImgW = galleryImgLoader.width();
		galleryImgH = galleryImgLoader.height();
		handleGalleryResize();
		TweenLite.to($('#galleryImg'), .4, { css: { autoAlpha: 1 }});
		setTimeout(function () { galleryChanging = false }, 210);
	});
	
}
