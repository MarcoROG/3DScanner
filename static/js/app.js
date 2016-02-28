$( document ).ready(function() {
		getStatus();
    setInterval(getStatus, 4000);
});

function updateList(){
   $.ajax({
   	type: "delete",
    url: "/scan",
    cache: false,
  }).done(function( data ) {
   var items = [];
   $.each(data['dirs'], function(i, item) {
          items.push('<li class="collection-item"><div>' + item + 
          '<a href="static/scans/'+ item +'.zip" class="secondary-content"><i class="material-icons">file_download</i></a></div></li>');
   }); 
   $('#scans').append( items.join('') );
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
