$(document).ready(function(){if(document.cookie.match("disclaimer")!=null){$("#disclaimer").hide()}$("#ackbutton").click(function(){$.ajax({type:"POST",url:"/setcookie",success:function(){$("#disclaimer").hide()}})})});$(document).ready(function(){var a=location.href.split(/\//)[3];if(a){if(a.indexOf(".")==-1){a+="/"}}else{a="index.html"}$("header ul.nav").find('a[href$="'+a+'"]').parents("li").addClass("active")});