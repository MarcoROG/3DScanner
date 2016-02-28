var loc = location.href; $( document ).ready(function() {
     updateList();
     getStatus();
    setInterval(getStatus, 4000);
    setInterval(updateList, 15000);
});

function deleteFile(file){
  $.ajax({
   	type: "delete",
    url: "/scan/"+file,
    cache: false,
  }).done(function( data ) {
   	Materialize.toast('Content removed!', 3000, 'rounded');
    var name = "#" + file;
    var element = $(name);
    element.hide();
    element.remove();
  });
}

function downloadFile(file){
   $.ajax({
   	type: "get",
    url: "/scan/"+file,
    cache: false,
  }).done(function( data ) {
   location.href = '/static/scans/'+file+'.zip';
   
  });
}

function updateList(){
   $.ajax({
   	type: "get",
    url: "/scan",
    cache: false,
  }).done(function( data ) {
   var items = [];
   items.push('<li class="collection-header"><h4>Scans</h4></li>');
   $.each(data['dirs'], function(i, item) {
          items.push('<li id="'+ item +'" class="collection-item"><div>' + item + 
          '<div class="secondary-content"><a onclick="downloadFile(\''+item+
		'\')" href="#"><i class="material-icons">file_download</i></a><a href="#" onclick="deleteFile(\''+item+'\')"><i class="material-icons">delete</i></a></div></div></li>');
   }); 
   $('#scans').html( items.join('') );
  });
}

function start(){
  $("#form").addClass("hide");
  $("#status").removeClass("hide");
  $("#pbar").css("width", "0%");
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
    $("#progress").html("Scan just started");
  });
}

function abort(){
   $.ajax({
   	type: "delete",
    url: "/scan",
    cache: false,
  });
}

function cont(){
  Materialize.toast('Scan resumed!', 3000, 'rounded');
  $("#continue").addClass("hide");
  clearInterval(getPhoto);
  setInterval(getStatus, 4000);
	$.ajax({
    url: "/resume",
    cache: false
  }).done(function( data ) {
			$("#continue").removeClass("hide");
      if (data == "Aborted"){
      	Materialize.toast('Scan aborted!', 3000, 'rounded');
        $("#form").removeClass("hide");
        $("#status").addClass("hide");
        clearInterval(getStatus);
      } else if (data == "Finished"){
	Materialize.toast('Scan completed!', 3000, 'rounded');
      }
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
      if(data['scanning']){
      	$("#continue").addClass("hide");
      }else{
      	$("#continue").removeClass("hide");
      }
      $("#progress").html( "Progress: " + data['current'][0] + "/" + data['settings'][0]);
      var curr = data['current'][0];
      var prevturns = (data['current'][1]-1 ) * data['settings'][0];	
      var prevlvls = (data['current'][2]-1) * data['settings'][0] * data['settings'][1];
      frac = Math.round( 100 *  (curr+prevturns+prevlvls)/
                        (data['settings'][0]*data['settings'][1]*data['settings'][2]));
      console.log(curr+"|"+prevturns+"|"+prevlvls + " Tot: " +(curr+prevturns+prevlvls)+ " Frac: " + frac);
      $("#pbar").css("width", frac+"%");
    }	
  });
}
