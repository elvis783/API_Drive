// ID d'authorisation crée sur google développer
var CLIENT_ID = '379782466805-qvcg0ubebuhfb5orcai0u28gu6fingca.apps.googleusercontent.com';

// Lien authorisation API Drive
var SCOPES = 'https://www.googleapis.com/auth/drive';

function handleClientLoad() {
window.setTimeout(checkAuth, 1);
}

// Fonction d'authorisation d'utilisation de l'API
function checkAuth() {
	gapi.auth.authorize(
	{'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true},
	handleAuthResult);
}

// Fonction d'upload de l'image
function handleAuthResult(authResult) {
	var authButton = document.getElementById('autoriseButton');
	var filePicker = document.getElementById('filePicker');
	var uploadButton = document.getElementById('uploadButton');

	if (authResult && !authResult.error) {
	filePicker.style.display = 'block';
	filePicker.onchange = loadFile;
	uploadButton.onclick = newUploadFile;
	}

	else {

	authButton.style.display = 'block';
	authButton.onclick = function() {
	gapi.auth.authorize(
		{'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
		handleAuthResult);
		};
	}
}

function newUpload(evt){
gapi.client.load('drive','v2', function(){
	var theImage = document.getElementById('editedImage');
	var fileTitle = theImage.getAttribute('fileName');
	var mimeType = theImage.getAttribute('mimeType');
	var metadata = {
	'title': fileTitle,
	'mimeType': mimeType
	};
	var pattern = 'data:' + mimeType + ';base64,';
	var base64Data = theImage.src.replace(pattern,'');            
	newInsertFile(base64Data,metadata);
	});
}

function newInsertFile(base64Data, metadata, callback){
	const boundary = '-------314159265358979323846';
	const delimiter = "\r\n--" + boundary + "\r\n";
	const close_delim = "\r\n--" + boundary + "--";
	var contentType = metadata.mimeType || 'application/octet-stream';
	var multipartRequestBody =
	delimiter +
	'Content-Type: application/json\r\n\r\n' +
	JSON.stringify(metadata) +
	delimiter +
	'Content-Type: ' + contentType + '\r\n' +
	'Content-Transfer-Encoding: base64\r\n' +
	'\r\n' +
	base64Data +
	close_delim;

	var request = gapi.client.request({
		'path' : '/upload/drive/v2/files/',
		'method' : 'POST',
		'params' : {'uploadType' : 'multipart'},
		'headers' : {'Content-Type' : 'multipart/mixed; boundary="' + boundary + '"'},
		'body' : multipartRequestBody
		});
		if (!callback) {
		callback = function (file) {
		alert('Votre photo à bien été envoyé !');
		};
	}
	request.execute(callback);
}

function loadFile(evt){
	var file = evt.target.files[0];
	var reader = new FileReader();
	reader.file = file;
	reader.onload = onImageReaderLoad;
	reader.readAsDataURL(file);            
}

function onImageReaderLoad(evt){
	var file = this.file;
	var mimeType = file.type;
	ecrireTexte(file.name,file.type,evt.target.result);        
}

//fonction pour écrire par dessus l'image // à nettoyer
function ecrireTexte(sourceImageName, mimeType, sourceImage){
		var resultsDiv = document.getElementById('resultsDiv');
		var sourceImg = document.createElement('img');
		var resultImg = document.createElement('img');
		var canvas = document.createElement('canvas');
		sourceImg.onload = function(evt){
		canvas.width = this.width;
		canvas.height = this.height;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(this,0,0,canvas.width,canvas.height);
		resultImg.onload = function(evt2){
		resultImg.setAttribute('id','editedImage');
		resultImg.setAttribute('mimeType', mimeType);
		resultImg.setAttribute('fileName', sourceImageName);
		resultsDiv.appendChild(resultImg);
		var uploadButton = document.getElementById('uploadButton');
		uploadButton.style.display = 'block';
		};
		resultImg.src = canvas.toDataURL(mimeType);
	};
	sourceImg.src = sourceImage;
} 