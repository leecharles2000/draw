var wrapper = document.getElementById("signature-pad");
var clearButton = wrapper.querySelector("[data-action=clear]");
var blackPenButton = wrapper.querySelector("[data-action=black-pen]");
var redPenButton = wrapper.querySelector("[data-action=red-pen]");
var bluePenButton = wrapper.querySelector("[data-action=blue-pen]");
var greenPenButton = wrapper.querySelector("[data-action=green-pen]");
var undoButton = wrapper.querySelector("[data-action=undo]");
var savePNGButton = wrapper.querySelector("[data-action=save-png]");
var canvas = wrapper.querySelector("canvas");
var signaturePad = new SignaturePad(canvas, {
  // It's Necessary to use an opaque color when saving image as JPEG;
  // this option can be omitted if only saving as PNG or SVG
  backgroundColor: 'rgb(255, 255, 255)'
});

// LIFF related
var liffID="1655723708-Bn7EzEeX";

// Adjust canvas coordinate space taking into account pixel ratio,
// to make it look crisp on mobile devices.
// This also causes canvas to be cleared.
function resizeCanvas() {
  // When zoomed out to less than 100%, for some very strange reason,
  // some browsers report devicePixelRatio as less than 1
  // and only part of the canvas is cleared then.
  var ratio =  Math.max(window.devicePixelRatio || 1, 1);

  // This part causes the canvas to be cleared
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);

  // This library does not listen for canvas changes, so after the canvas is automatically
  // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
  // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
  // that the state of this library is consistent with visual state of the canvas, you
  // have to clear it manually.
  signaturePad.clear();
}

// On mobile devices it might make more sense to listen to orientation change,
// rather than window resize events.
window.onresize = resizeCanvas;
resizeCanvas();
function download(dataURL, filename) {
  if (navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") === -1) {
    window.open(dataURL);
  } else {
    var blob = dataURLToBlob(dataURL);
    var url = window.URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.style = "display: none";
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
  }
}

// One could simply use Canvas#toBlob method instead, but it's just to show
// that it can be done using result of SignaturePad#toDataURL.
function dataURLToBlob(dataURL) {
  // Code taken from https://github.com/ebidel/filer.js
  var parts = dataURL.split(';base64,');
  var contentType = parts[0].split(":")[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;
  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

clearButton.addEventListener("click", function (event) {
  signaturePad.clear();
});

undoButton.addEventListener("click", function (event) {
  var data = signaturePad.toData();

  if (data) {
    data.pop(); // remove the last dot or line
    signaturePad.fromData(data);
  }
});

blackPenButton.addEventListener("click", function (event) {
  var color = "rgb(0,0,0)";

  signaturePad.penColor = color;
});


redPenButton.addEventListener("click", function (event) {
  var color = "rgb(255,0,0)";

  signaturePad.penColor = color;
});

greenPenButton.addEventListener("click", function (event) {
  var color = "rgb(0,255,0)";

  signaturePad.penColor = color;
});

bluePenButton.addEventListener("click", function (event) {
  var color = "rgb(0,0,255)";

  signaturePad.penColor = color;
});

savePNGButton.addEventListener("click", function(event) {

  if (signaturePad.isEmpty()) {
    alert("空白不能傳哦!^_^");
  } else {
    var dataURL = signaturePad.toDataURL();
    // download(dataURL, "drawing.png");
    const p = liff.getContext();
    var lineid = p.userId;
    //alert(lineid);
    //var lineid = "abc123";
  	$.ajax({
      url: "https://imgbasket.herokuapp.com/saveimage",
      //url: "http://127.0.0.1:8888/saveimage",
      type: "POST",
      dataType: "json",
      data: {
        'id':lineid,    
        'image': dataURL
      },
      success: function (res, status) {    //成功時回傳
        //alert('有收到server回傳成功');
        liff.sendMessages([
          {
            type: 'image',
            originalContentUrl: 'https://imgbasket.herokuapp.com/showimage/'+lineid,
            //previewImageUrl: 'http://127.0.0.1:8888/showimage/'+lineid
            previewImageUrl: 'https://imgbasket.herokuapp.com/showimage/'+lineid
          }
        ]).then(function () {
          liff.closeWindow();
        }).catch(function (error) {
          window.alert(error.code + ':' + error.message);
        });
      },
      error: function(jqXHR, textStatus, errorThrown) { 
        //alert('error:' + textStatus + ':' + errorThrown); 
        liff.sendMessages([
          {
            type: 'image',
            originalContentUrl: 'https://imgbasket.herokuapp.com/showimage/'+lineid,
            previewImageUrl: 'https://imgbasket.herokuapp.com/showimage/'+lineid
          }
        ]).then(function () {
          liff.closeWindow();
        }).catch(function (error) {
          window.alert(error.code + ':' + error.message);
        });

      }

    });  
  }
});

liff.init({liffId: liffID});
/*
liff.getProfile()
.then(profile => {
  const lineid = profile.userId;
})
.catch((err) => {
  alert('error'+err);
});
*/