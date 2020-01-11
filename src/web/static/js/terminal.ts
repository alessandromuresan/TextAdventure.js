$(() => {

	$('#start-button').on('click', e => {

		e.preventDefault();

		$('#console-container').attr('style', 'display:block;');
		$('#splashscreen-container').attr('style', 'display:none;');

		initTerminal();
	});
});

function initTerminal() {
	// ===== Onload Functions ===========================================================
	displayResize();
	getIntroText();
	playBackgroundMusic('/assets/audio/ashes.mp3');

	// ===== Event Handlers =============================================================
	// ----- Input Submit ---------------------------------------------------------------
	$('#console').submit(function(event: any) {
		event.preventDefault();
		var inputString = '' + $('#input').val();
		inputString = inputString.trim();
		$('#input').val('');
		toScreen(inputString,'user');
		if(inputString !== ''){
			messageServer(inputString);
			if(inputString !== inputBuffer[inputBuffer.length-1]){
				inputBuffer.push(inputString);
			}
		}
		inputBufferIndex = inputBuffer.length;
	});
	// ----- Input Buffer ---------------------------------------------------------------
	var inputBuffer: any[] = [];
	var inputBufferIndex = 0;
	$(document).keydown(function(event) {
		switch(event.which) {
			case 38: // up
				if(inputBufferIndex>0){
					--inputBufferIndex;
				}
				$('#input').val(inputBuffer[inputBufferIndex]);
				break;
			case 40: // down
				if(inputBufferIndex<inputBuffer.length){
					++inputBufferIndex;
				}
				$('#input').val(inputBuffer[inputBufferIndex]);
				break;
			default: return;
		}
		event.preventDefault();
	});
	// ----- Window Resize Listener -----------------------------------------------------
	$(window).resize(function(){
		displayResize();
	});
}

// ===== Functions ======================================================================
// ----- Send Message to Server ---------------------------------------------------------
function messageServer(message: any) {
	$.post(window.location.href + 'console/input', {"input": message}, function(data) {
		console.log(data);
		toScreen(data,'console');
	}).fail(function(err) {
		console.log(err);
		toScreen('Unable to reach server.','terminal');
	});
}

function getIntroText() {

	$.post(window.location.href + 'console/getIntro', function(data) {
		console.log(data);
		toScreen(data,'console');
	}).fail(function(err){
		console.log(err);
		toScreen('Unable to reach server.','terminal');
	});
}

// ----- Insure Terminal Appearance -----------------------------------------------------
function displayResize(){
	$('#display').height($(window).height()-30);
	$('#display').scrollTop($('#display')[0].scrollHeight);
}
// ----- Write to Screen ----------------------------------------------------------------
function toScreen(response: any, actor: any) {

	let message = typeof response === 'string' ? response : '';
	let audioAssetToPlay;

	if(actor == 'user' || actor === 'terminal'){
		message = '> ' + message;
	} else {
		message = response.actionResult.message;
		audioAssetToPlay = response.actionResult.audioAssetToPlay;
	}

	var displayString = $('#display').val() + message + '\n';

	$('#display').val(displayString);
	$('#display').scrollTop($('#display')[0].scrollHeight);

	if (audioAssetToPlay) {
		playSound(`/assets/audio/${audioAssetToPlay}`);
	}
}

function playBackgroundMusic(src: string): void {

	const audioElement: HTMLAudioElement = <HTMLAudioElement>document.getElementById('audio-background-music');

	audioElement.src = src;
	audioElement.play();
}

function playSound(src: string): void {

	const soundElement: HTMLAudioElement = <HTMLAudioElement>document.getElementById('audio-sound');

	soundElement.src = src;
	soundElement.play();
}
