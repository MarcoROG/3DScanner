$( document ).ready(function() {
    setInterval(getStatus, 5000);
});

function start(){
  $("#form").addClass("hide");
  $("#status").removeClass("hide");
  $.ajax({
   	type: "POST",
    url: "/start",
    data : {
	ppt : $("#ppt").val(),
	tpl : $("#tpl").val(),
	lev : $("#lev").val()
    },
    cache: false,
  }).done(function( data ) {
    $("#continue").removeClass("hide");
  });
}

function abort(){
   $.ajax({
   	type: "delete",
    url: "/scan",
    cache: false,
  }).done(function( data ) {
			Materialize.toast('Scan aborted!', 3000, 'rounded');
        $("#form").removeClass("hide");
        $("#status").addClass("hide");
        clearInterval(getStatus);
  });
}

function cont(){
	$.ajax({
    url: "/resume",
    cache: false,
  }).done(function( data ) {
			Materialize.toast('Scan resumed!', 3000, 'rounded');
      $("#continue").addClass("hide");
      clearInterval(getPhoto);
      setInterval(getStatus, 5000);
  });
}

function getPhoto(){
	  $.ajax({
    url: "/takePhoto",
    cache: false
  }).done(function(data){
  	d = new Date();
  	$("#image").attr("src", "/static/Photo.jpg?"+d.getTime());
  });
}

function getStatus(){
  $.ajax({
    url: "/status",
    cache: false
  })
    .done(function( data ) {
    if(data == "Idling"){ //Se non sta facendo nulla
      $("#form").removeClass("hide"); //Mostra form
      $("#status").addClass("hide"); //Nascondi stato
      clearInterval(getStatus); //Non mostrare stato
      clearInterval(getPhoto); //Non fare foto
    }else{
      $("#status").removeClass("hide"); //Mostra stato
      $("#form").addClass("hide"); //Nascondi form
      if(data['scanning']){ //Se sta facendo lo scan fai l'update di tutto
	var prog = $("progress");
        $("#progress").html( "Progress: " + data['current'][0] + "/" + data['settings'][0]);
	frac = Math.round( 100 * (data['current'][0]*data['current'][1]*data['current'][2])/
                       (data['settings'][0]*data['settings'][1]*data['settings'][2]));
	console.log(frac);
        $("#pbar").css("width", frac+"%");
      }else{ //Se sta aspettando
        $("#continue").removeClass("hide"); //Mostra continue
        //getPhoto();
        clearInterval(getStatus); //Non mostrare lo stato
      }
    }	
  });
}
