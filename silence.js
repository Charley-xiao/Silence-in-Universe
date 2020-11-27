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
var namesofplanets=["Cinnamon","ISON0012","Zeus","Hra","Poseidon","Neptune","Pluto","Hestia","Ares","Athena",
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
var sayuz=[];
var prop=[];
var outout=[];
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
	for(var i=0;i<foundseq.length;i++){
		var obj_=foundseq[i];
		var delt=getrand(20)-10;
		for(var j=0;j<mp.length;j++){
			if(mp[j]==obj_){
				if(relation[j]<=-100) break;
				relation[j]+=delt;
				if(relation[j]>=100) /*window.alert("外交官终止了我们与"+obj_+"的关系提升"),*/relation[j]=100;
				if(relation[j]<=-100){
					window.alert("战争！"+name+" VS "+obj_);
					relation[j]=-100;
					warstate=1;
					warlist.push(obj_);
					document.getElementById("civ"+i+"c").style.color="red";
					document.getElementById("civ"+i+"c").innerHTML="交战中！";
					break;
				}
				if(relation[j]>0) document.getElementById("civ"+i+"c").style.color="green";
				else if(relation[j]==0) document.getElementById("civ"+i+"c").style.color="white";
				else if(relation[j]<0) document.getElementById("civ"+i+"c").style.color="red";
				document.getElementById("civ"+i+"c").innerHTML=relation[j];
				break;
			}
		}
	}
}
function CLEARNAME(targ){
	var pos=0;
	for(var i=0;i<foundseq.length;i++){
		if(foundseq[i]==targ){
			foundedcivs--;
			document.getElementById("civ"+i).innerHTML="";
			document.getElementById("civ"+i+"b").innerHTML="";
			document.getElementById("civ"+i+"c").innerHTML="";
			document.getElementById("civ"+i+"d").innerHTML="";
			// document.getElementById("info").removeChild(document.getElementById("civ"+i));
			// document.getElementById("info").removeChild(document.getElementById("civ"+i+"b"));
			// document.getElementById("info").removeChild(document.getElementById("civ"+i+"c"));
			// document.getElementById("info").removeChild(document.getElementById("civ"+i+"d"));
			pos=i;
			break;
		}
	}
	//pos*6+7+"%";
	pos++;
	for(;pos<=20;pos++){
		// document.getElementById("civ"+pos).style.top=(pos-1)*6+7+"%";
		// document.getElementById("civ"+pos+"b").style.top=(pos-1)*6+7+"%";
		// document.getElementById("civ"+pos+"c").style.top=(pos-1)*6+7+"%";
		// document.getElementById("civ"+pos+"d").style.top=(pos-1)*6+7+"%";
		if(document.getElementById("civ"+pos)==null){
			document.getElementById("civ"+(pos-1)).innerHTML="";
			document.getElementById("civ"+(pos-1)+"b").innerHTML="";
			document.getElementById("civ"+(pos-1)+"c").innerHTML="";
			document.getElementById("civ"+(pos-1)+"d").innerHTML="";
			break;
		}
		document.getElementById("civ"+(pos-1)).innerHTML=document.getElementById("civ"+pos).innerHTML;
		document.getElementById("civ"+(pos-1)+"b").innerHTML=document.getElementById("civ"+pos+"b").innerHTML;
		document.getElementById("civ"+(pos-1)+"c").innerHTML=document.getElementById("civ"+pos+"c").innerHTML;
		document.getElementById("civ"+(pos-1)+"d").innerHTML=document.getElementById("civ"+pos+"d").innerHTML;
	}
}
function findpower(targ){
	for(var i=0;i<mp.length;i++){
		if(targ==mp[i]){
			return prop[i];
		}
	}
	window.alert("Error!Code:1000");
}
function DirectToFail(){
	window.alert("开发中");
}
function checkifend(){
	if(outout.length==19) return 1;
	return 0;
}
function DirectToSuc(){
	window.alert("开发中");
}
function Update_LANDS(targstr,delta){
	for(var i=0;i<foundseq.length;i++){
		if(foundseq[i]==targstr){
			var ttmp=parseInt(document.getElementById("civ"+i+"b").innerHTML);
			ttmp+=delta;
			document.getElementById("civ"+i+"b").innerHTML=ttmp;
			break;
		}
	}
}
function Update(){
	document.getElementById("showturn").innerHTML=turns;
	document.getElementById("showland").innerHTML=lands;
	checkforwars();
	if(warstate){
		var mypow=lands,otpow=0;
		var tog="";
		for(var i=0;i<sayuz.length;i++){
			tog+=sayuz[i];
			mypow+=findpower(sayuz[i]);
			if(i!=sayuz.length-1) tog+=",";
		}
		var enem="";
		for(var i=0;i<warlist.length;i++){
			enem+=warlist[i];
			otpow+=findpower(warlist[i]);
			if(i!=warlist.length-1) enem+=",";
		}
		window.alert("您和"+tog+"是盟友，正在与"+enem+"交战，自动进入交战环节，交战环节不计入总回合数，且禁用部分操作");
		while(warstate&&mypow>0&&otpow>0){
			var opt=window.prompt("请输入操作：\n格式：at（进攻）/ne（谈判）+空格+文明名称");
			var act="",esp="";
			var ppos=0;
			for(;ppos<opt.length;ppos++){
				if(opt[ppos]==' ') break;
				act+=opt[ppos]; 
			}
			ppos++;
			for(;ppos<opt.length;ppos++) esp+=opt[ppos];
			if(act=="at"){
				var dam=getrand(mypow*mypow/otpow);
				otpow-=dam;
				mypow+=dam;
				lands+=dam;
				document.getElementById("showland").innerHTML=lands;
				Update_LANDS(warlist[0],-dam);
				window.alert("您造成伤害"+dam+"点");
			}
			else if(act=="ne"){
				if(mypow/otpow>=2||getrand(3)%3==0){
					window.alert("对方接受了停战");
					warstate=0;
					for(var i=0;i<warlist.length;i++){
						var findtarg=warlist[i];
						for(var j=0;j<mp.length;j++){
							if(findtarg==mp[j]){
								relation[j]=0;
								for(var k=0;k<foundseq.length;k++){
									if(foundseq[k]==findtarg){
										document.getElementById("civ"+k+"c").style.color="white";
										document.getElementById("civ"+k+"c").innerHTML="0";
										break;
									}
								}
								break;
							}
						}
					}
					warlist.splice(0,warlist.length);
					break;
				}
				else{
					window.alert("对方拒绝停战");
				}
			}
			else{
				window.alert("无效操作！");
				continue;
			}
			var hisdamage=getrand(mypow*2/3);
			otpow+=hisdamage;
			mypow-=hisdamage;
			lands-=hisdamage;
			document.getElementById("showland").innerHTML=lands;
			window.alert("对方造成伤害"+hisdamage+"点");
			Update_LANDS(warlist[0],hisdamage);
			if(mypow<=0){
				warstate=0;
				break;
			}
		}
		if(otpow<=0){
			warstate=0;
			window.alert("胜利！");
			for(var i=0;i<warlist.length;i++){
				outout.push(warlist[i]);
				CLEARNAME(warlist[i]);
			}
			warlist.splice(0,warlist.length);
		}
		else if(mypow<=0){
			window.alert("失败！");
			DirectToFail();
		}
	}
	if(checkifend()) DirectToSuc();
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
	return foundedcivs*6+7+"%";
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
	revaction();
	if(curcmd=="0") return;
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
				relation[i]+=10;
				for(var j=0;j<foundseq.length;j++){
					if(foundseq[j]==obj){
						var tmpk=parseInt(document.getElementById("civ"+j+"c").innerHTML);
						if(tmpk==NaN){
							window.alert("正处于战争中！");
							relation[i]=-100;
							break;
						}
						tmpk+=10;
						if(tmpk>=100) /*window.alert("外交官终止了我们与"+obj+"的关系提升"),*/tmpk=100;
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
				relation[i]-=10;
				for(var j=0;j<foundseq.length;j++){
					if(foundseq[j]==obj){
						var tmpk=parseInt(document.getElementById("civ"+j+"c").innerHTML);
						tmpk-=10;
						if(tmpk<=-100) window.alert("战争！\n"+name+" VS "+obj),tmpk=-100,warstate=1,warlist.push(obj);
						if(tmpk<0) document.getElementById("civ"+j+"c").style.color="red";
						else if(tmpk==0) document.getElementById("civ"+j+"c").style.color="white";
						else if(tmpk>0) document.getElementById("civ"+j+"c").style.color="green";
						if(tmpk==-100)document.getElementById("civ"+j+"c").innerHTML="交战中！";
						else document.getElementById("civ"+j+"c").innerHTML=tmpk;
						break;
					} 
				}
				break;
			}
		}
	}
	else if(op=="Req"){
		var typ=window.prompt("请输入请求类型：\n1.交易请求\n2.结盟请求\n3.退出联盟");
	}
	else if(op=="War"){
		window.alert("向"+obj+"宣战！");
		for(i=0;i<mp.length;i++){
			if(mp[i]==obj){
				relation[i]=-100;
				warstate=1;
				warlist.push(obj);
				break;
			}
		}
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
	var hisprop=getrand(2*lands);
	for(var qq=0;qq<mp.length;qq++) if(mp[qq]==newname){
		prop[qq]=hisprop;
		break;
	}
	document.getElementById("info").innerHTML+=
	"<p id=\"civ"+foundedcivs+"b\" style=\"position: absolute;top: "+curtop+";left: 36%;width: 20%;\">"+hisprop+"</p>";
	document.getElementById("info").innerHTML+=kankeist;
	document.getElementById("info").innerHTML+=
	"<p onclick=\"actions()\" id=\"civ"+foundedcivs+"d\" style=\"position: absolute;top: "+curtop+";left: 84%;width: 20%;color: blue;\">点击</p>";
}
function explore(){
	var gamedate=GameDate();
	command+=1;turns+=1;
	if(getrand(3)%3||foundedcivs>=17){
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
