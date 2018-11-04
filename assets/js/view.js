$(document).ready(function($) {

	$('.card__share > a').on('click', function(e){ 
		e.stopPropagation();
		e.preventDefault() // prevent default action - hash doesn't appear in url
   		$(this).parent().find( 'div' ).toggleClass( 'card__social--active' );
		$(this).toggleClass('share-expanded');
    });
  
});

$('.delete-icon').click(function(e){
	e.stopPropagation();
	var id = $(this)[0].id;
	console.log(id);
	if(confirm("Are you sure about deleting the blog?")){
		$.ajax({
            type: 'DELETE',
            url: "/view/"+id,
            success: function(resultData) { console.log(id +"  deleted!"); window.location.reload();  }
      	}); 
	}
});

$(".searchTerm").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(".card").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });

$(function(){

  $('.tags input').on('focusout',function(){    
    var txt= this.value.replace(/[^a-zA-Z0-9\+\-\.\#]/g,''); // allowed characters
    if(txt) {
      $(this).before('<span id="new" class="tag">'+ txt.toLowerCase() +'</span>');
    }
    this.value="";
  }).on('keyup',function( event ){
    // if: comma,enter (delimit more keyCodes with | pipe)
    if(/(188|13)/.test(event.which)){ $(this).focusout(); 
    }
  });
   
  $('.tags').on('click','.tag',function(){
    $(this).remove();  
  });
});

$('.edit').click(function(){
	var id = $(this)[0].id
	var title = $('.title').val();
	var tags = $('.tag');
	var cont = $('.cont').val();
  if(title==""||tags.length==0||cont==""){
    alert('Please fill all details');
  }else{
    if(tags.length!=0&& (id== tags[0].id || tags[0].id=="new")){
      var tagStr=tags[0].innerText;
    }
    for(i=1;i<tags.length;i++){
    	if(id== tags[i].id|| tags[i].id=="new"){
      tagStr=tagStr+","+tags[i].innerText;}
    }
    console.log(id);
    console.log(title);
    console.log(tagStr);
    console.log(cont);
    var myKeyVals = {id: id,title: title,tags: tagStr,content: cont};

      console.log(myKeyVals);
      $.ajax({
          type: 'POST',
          url: "/view/update",
          data: myKeyVals,
          success: function(resultData) { alert('The blog has been modified Successfully !'); window.location.reload(); }
      });
  }
});

$('[id^=addcmt]').click(function(){
	var id= $(this)[0].name;
	var text = $(this).prev().val();
	console.log(id);
	console.log(text);
	if(text == ""){
		alert("Enter something first");
	}else{
		var myKeyVals = {id: id,text: text};

      console.log(myKeyVals);
      $.ajax({
          type: 'POST',
          url: "/view/cmtadd",
          data: myKeyVals,
          success: function(resultData) { alert('The comment has been added Successfully !'); window.location.reload(); }
      });
	}
});

$(".crclick").hover(function(){
    $(this).css("background-color", "rgba(0,0,0,0.1)");
    }, function(){
    $(this).css("background-color", "#ffffff");
});

$(".cross").click(function(){
	var id = $(this)[0].id;
	id = id.split("#");
	console.log(id);

	if(confirm("Are you sure about deleting the comment?")){
		$.ajax({
            type: 'POST',
            url: "/view/cmt/"+id[0]+"/"+id[1],
            success: function(resultData) { console.log(id +"  deleted!"); window.location.reload();  }
      	}); 
	}
});

$(".twt").click(function(e){
	e.stopPropagation();
	$(this)[0].attributes[1].value=$(this)[0].attributes[1].value+"%0A%0A"+document.URL;
}); 