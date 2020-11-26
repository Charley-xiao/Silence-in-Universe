function sleep(time){
	var timeStamp=new Date().getTime();
	var endTime=timeStamp+time;
	while(1) if(new Date().getTime()>endTime) return;
}
function sleepDEBUG(){
	sleep(5000);
	console.log("Successfully Loaded.");
}
function getrand(upsize){
	return parseInt(Math.random()*upsize+1);
}
var namesofplanets=["Cinnamon","ISON0012","Zeus","Hρα","Poseidon","Neptune","Pluto","Hestia","Ares","Athena",
"Hermes","Hephaistos","Aphrodite","Artemis","Apollo","Dionysus","Demeter","WY013C","CJ-2020F"];
function shuffleSelf(array,size){
    var index=-1,length=array.length,lastIndex=length-1;
    size=(size===undefined)?length:size;
    while(++index<size){
        var rand=index+Math.floor(Math.random()*(lastIndex-index+1));
        var value=array[rand];
        array[rand]=array[index];
        array[index]=value;
    }
    array.length=size;
    return array;
}
var MAXIMUM_V=23;
var infoshown=0,command=0,turns=0,lands=1,foundedcivs=0,sentcom=0;
var name="Myst";
var mp=["Cinnamon","ISON0012","Zeus","Hρα","Poseidon","Neptune","Pluto","Hestia","Ares","Athena",
"Hermes","Hephaistos","Aphrodite","Artemis","Apollo","Dionysus","Demeter","WY013C","CJ-2020F"];
var foundseq=[];
var curobj="";
var relation=[];
var warstate=0;
var warlist=[];
function setCookie(cname,cvalue,exdays){
	var d=new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires="expires="+d.toGMTString();
	document.cookie=cname+"="+cvalue+";"+expires+";path=/";
}
function getCookie(cname){
	var myname=cname+"=";
	var decodedCookie=decodeURIComponent(document.cookie);
	var ca=decodedCookie.split(';');
	for(var i=0;i<ca.length;i+=1) {
		var c=ca[i];
		while(c.charAt(0)==' ') c=c.substring(1);
		if (c.indexOf(myname)==0) return c.substring(myname.length,c.length);
	}
	return "";
}
function checkCookie() {
	name=getCookie("username");
	if(name!="") alert("成功导入存档，"+name);
	else{
		name=prompt("为您的星球取一个名字：","");
		if(name!=""&&name!=null) setCookie("username",name,30000);
  	}
}
function GetName(){
	checkCookie();
	var TMPORARYHEADER=document.getElementById("mainheader").innerHTML;
	TMPORARYHEADER=name+TMPORARYHEADER;
	document.getElementById("mainheader").innerHTML=TMPORARYHEADER;
}
function output(str){
	if(command>MAXIMUM_V){
		var clearobject=command-MAXIMUM_V;
		document.getElementById("command"+clearobject).innerHTML="";
	}
	var stl=str.length;
	for(var i=0;i<stl;i+=1){
		if(str[i]=='e'&&str[i+1]=='n'&&str[i+2]=='d'){
			document.getElementById("command"+command).innerHTML+="&nbsp;&nbsp;&nbsp;";
			i+=2;
		}
		else{
			document.getElementById("command"+command).innerHTML+=str[i];
		}
	}
}
function checkforwars(){

}
function Update(){
	document.getElementById("showturn").innerHTML=turns;
	document.getElementById("showland").innerHTML=lands;
	checkforwars();
}
function GameDate(){
	var yy=1000+turns;
	return "新元"+yy+"年";
}
function watchciv(){
	if(!infoshown){
		document.getElementById("info").style.display="";
		document.getElementById("watchciv").innerHTML="收起外交";
		infoshown=1;
	}
	else{
		document.getElementById("info").style.display="none";
		document.getElementById("watchciv").innerHTML="查看外交";
		infoshown=0;
	}
}
function calctop(){
	return foundedcivs*10+12+"%";
}
function sendcommand(){
	if(document.getElementById("cmd").style.top!="250px"){
		window.alert("无效指令！");
		document.getElementById("input").value="";
		return;
	}
	let curcmd=$("textarea#input").val();
	sentcom++;
	if(sentcom>=7) for(var i=1;i<=7;i++) document.getElementById("cmd"+i).innerHTML="",sentcom=1;
	document.getElementById("cmd"+sentcom).innerHTML="Turn #"+turns+" > "+curcmd;
	document.getElementById("input").value="";
	if(curcmd=="0") return;
	revaction();
	var i=0;
	var op="",obj="";
	for(;i<curcmd.length;i++){
		if(curcmd[i]==' ') break;
		op+=curcmd[i];
	}
	i++;
	for(;i<curcmd.length;i++) obj+=curcmd[i];
	if(op=="Imp"){
		window.alert("与"+obj+"改善关系");
		for(i=0;i<mp.length;i++){
			if(mp[i]==obj){
				relation[i]+=2;
				for(var j=0;j<foundseq.length;j++){
					if(foundseq[j]==obj){
						var tmpk=parseInt(document.getElementById("civ"+j+"c").innerHTML);
						if(tmpk==NaN){
							window.alert("正处于战争中！");
							relation[i]=-100;
						}
						tmpk+=2;
						if(tmpk>=100) window.alert("外交官终止了我们与"+obj+"的关系提升"),tmpk=100;
						if(tmpk<0) document.getElementById("civ"+j+"c").style.color="red";
						else if(tmpk==0) document.getElementById("civ"+j+"c").style.color="white";
						else if(tmpk>0) document.getElementById("civ"+j+"c").style.color="green";
						document.getElementById("civ"+j+"c").innerHTML=tmpk;
						break;
					} 
				}
				break;
			}
		}
	}
	else if(op=="Ins"){
		window.alert("终止与"+obj+"的外交关系");
		for(i=0;i<mp.length;i++){
			if(mp[i]==obj){
				relation[i]-=2;
				for(var j=0;j<foundseq.length;j++){
					if(foundseq[j]==obj){
						var tmpk=parseInt(document.getElementById("civ"+j+"c").innerHTML);
						tmpk-=2;
						if(tmpk<=-100) window.alert("战争！\n"+name+" VS "+obj),tmpk=-100,warstate=1,warlist.push(obj);
						if(tmpk<0) document.getElementById("civ"+j+"c").style.color="red";
						else if(tmpk==0) document.getElementById("civ"+j+"c").style.color="white";
						else if(tmpk>0) document.getElementById("civ"+j+"c").style.color="green";
						if(tmpk==-100)document.getElementById("civ"+j+"c").innerHTML="战争中！";
						else document.getElementById("civ"+j+"c").innerHTML=tmpk;
						break;
					} 
				}
				break;
			}
		}
	}
	else if(op=="Req"){

	}
	else if(op=="War"){

	}
	else{
		window.alert("无效指令！");
		return;
	}
}
function actions(){
	document.getElementById("cmd").style.display="";
	var elem=document.getElementById("cmd");
	elem.style.top="250px";
	elem.style.left="350px";
}
function revaction(){
	var elem=document.getElementById("cmd");
	elem.style.top="5px";
	elem.style.left="5px";
	document.getElementById("cmd").style.display="none";
}
function NewPlanetDetected(curTIME){
	var newname="",newkey=getrand(namesofplanets.length);
	shuffleSelf(namesofplanets);
	newname=namesofplanets[newkey-1];
	while(newname==name||newname===undefined) newkey=getrand(namesofplanets.length),newname=namesofplanets[newkey-1];
	curobj=newname;
	document.getElementById("dcon").innerHTML+="<div id=\"command"+command+"\"></div>";
	output(curTIME+"end"+name+"发现了新文明："+newname+"......");
	window.alert("发现新文明："+newname+"。请前往控制栏查看外交。");
	var pos=0;
	for(;pos<namesofplanets.length;pos++) if(namesofplanets[pos]==newname) break;
	for(var i=pos;i<namesofplanets.length-1;i++) namesofplanets[i]=namesofplanets[i+1];
	delete namesofplanets[namesofplanets.length-1];
	foundedcivs++;
	var curtop=calctop();
	var kankei=getrand(200)-100;
	for(var i=0;i<mp.length;i++){
		if(mp[i]==newname){
			relation[i]=kankei;
			break;
		}
	}
	var kankeist="";
	foundseq[foundedcivs]=newname;
	if(kankei>0) kankeist="<p id=\"civ"+foundedcivs+"c\" style=\"position: absolute;top: "+curtop+";left: 60%;width: 20%;color: green;\">"+kankei+"</p>";
	else if(kankei==0) kankeist="<p id=\"civ"+foundedcivs+"c\" style=\"position: absolute;top: "+curtop+";left: 60%;width: 20%;color: white;\">"+kankei+"</p>";
	else kankeist="<p id=\"civ"+foundedcivs+"c\" style=\"position: absolute;top: "+curtop+";left: 60%;width: 20%;color: red;\">"+kankei+"</p>";
	document.getElementById("info").innerHTML+=
	"<p id=\"civ"+foundedcivs+"\" style=\"position: absolute;top: "+curtop+";left: 12%;width: 20%;\">"+newname+"</p>";
	document.getElementById("info").innerHTML+=
	"<p id=\"civ"+foundedcivs+"b\" style=\"position: absolute;top: "+curtop+";left: 36%;width: 20%;\">"+getrand(3*lands)+"</p>";
	document.getElementById("info").innerHTML+=kankeist;
	document.getElementById("info").innerHTML+=
	"<p onclick=\"actions()\" id=\"civ"+foundedcivs+"d\" style=\"position: absolute;top: "+curtop+";left: 84%;width: 20%;color: blue;\">点击</p>";
}
function explore(){
	var gamedate=GameDate();
	command+=1;turns+=1;
	if(getrand(3)%3||foundedcivs>=9){
		document.getElementById("dcon").innerHTML+="<div id=\"command"+command+"\" class=\"iee\"></div>";
		output(gamedate+"end"+name+"发现了一块无生命的新星球并占领了它......");
		lands++;
	}
	else NewPlanetDetected(gamedate);
	Update();
}
function clearall(){
	var op=window.prompt("您确定要清除存档吗？（Y/N）");
	if(op=='N') return;
	setCookie("username","",30000);
	location.reload();
}
