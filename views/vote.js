var like = postID =>{
    //- Console.log("test");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     document.getElementById("ScoreUp"+postID).innerHTML = "👍 " + this.responseText;
    }
    };
    xhttp.open("POST", "/like", true);
    xhttp.setRequestHeader("postID", postID)
    xhttp.send();
}
var dislike = postID =>{
    //- Console.log("test");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     document.getElementById("ScoreDown"+postID).innerHTML = "👎 "+this.responseText;
    }
    };
    xhttp.open("POST", "/dislike", true);
    xhttp.setRequestHeader("postID", postID)
    xhttp.send();
}
var report = postID =>{
    //- Console.log("test");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     document.getElementById("ScoreUp"+postID).innerHTML = "Post";
     document.getElementById("ScoreDown"+postID).innerHTML = "Reported";
    }
    };
    xhttp.open("POST", "/report", true);
    xhttp.setRequestHeader("postID", postID)
    xhttp.send();
}
var comment = ID =>{
    //- Console.log("test");
    var postID = encodeURIComponent(ID)
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/comment"+ "/?postID=" + postID, true);
    xhttp.setRequestHeader("postID", postID)
    xhttp.send();
}