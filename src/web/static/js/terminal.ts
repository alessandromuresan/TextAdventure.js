$(function(){
	// ===== Onload Functions ===========================================================
	displayResize();
	getIntroText();

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
});

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

	if(actor == 'user' || actor === 'terminal'){
		message = '> ' + message;
	} else {
		message = response.actionResult.message;
	}

	var displayString = $('#display').val() + message + '\n';
	$('#display').val(displayString);
	$('#display').scrollTop($('#display')[0].scrollHeight);
}
