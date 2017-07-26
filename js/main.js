var doc=document,FBid="";//簡化的寫法
var Cookies={//Cookie操作
	set:function(name,value,expire){
		var date=new Date();
		date.setTime(date.getTime()+expire*24*60*60*1000);
		doc.cookie=name+"="+value+";expires="+date.toGMTString();
	},
	get:function(name){
		var cookie=doc.cookie.split("; ");
		for(var i=0;i<cookie.length;i++){
			var data=cookie[i].split("=");
			if(data[0]==name)return data[1];
		}
	},
	del:function(name){
		var date=new Date();
		date.setTime(0);
		doc.cookie=name+"=;expires="+date.toGMTString();
	}
}
function GetElem(ord){return doc.querySelector(ord)}//取得單一文件元素
function GetElems(ord){return doc.querySelectorAll(ord)}//取得多個文件元素
function isMobile(){//確認是否為移動裝置
	return(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)
}
function FB_Login(){//取得使用者Facebook ID
	var id=Cookies.get("FBid");
	if(id){FBid=id;return FB_UserC()}
	FB.getLoginStatus(function(r){
		if(r.status=="connected"){
			Cookies.set("FBid",FB.getUserID(),30);FB_UserC();
		}else FB.login(function(){Cookies.set("FBid",FB.getUserID(),30);FB_UserC()});
	})
}
function FB_UserC(){//依照使用者Facebook ID讀取頭像，並確認針對接龍的發文與留言數
	if(!FBid)return;
	GetElem("#User table").style.display="";
	GetElem("#User img").src="https://graph.facebook.com/"+FBid+"/picture?"+Trianus.Access;
	GetElem("#User input[type=button]").style.display="none";
	if(Trianus.user[FBid]){
		var tds=doc.querySelectorAll("#User td");
		tds[1].innerHTML=Trianus.user[FBid].post+"篇";
		tds[3].innerHTML=Trianus.user[FBid].flow+"則";
	}
}
function Resize(){//細部外觀調整
	GetElem("#list").style.left="";
	var menuc=GetElem("#menuc");
	if(menuc)menuc.id="menu";
	if(!isMobile()){
		GetElem("#listscroll").style.width="calc(100% + 17px)"
		GetElem("#listscroll").style.height="calc(100% + 17px)"
		GetElem("#Storyscroll").style.width="calc(100% + 17px)"
		GetElem("#Storyscroll").style.height="calc(100% + 17px)"
	}
}
function Loader(url,proc,parameter){//載入FB內容
	var xhr=new XMLHttpRequest();
	xhr.onload=function(){proc(JSON.parse(this.response),url,parameter)}
	xhr.open("get",url);
	xhr.send();
}
var Trianus={
	Access:"EAAEAhFsvEQIBAK6LTYJo1jv0lp5trzauCWyvJArA9jkwzEkIP7R2NsisUAogl7b4eWteLWk3ygt1CYTGhAN7vQRIjOVUDzmCLyyl8SFYb5Cye3QPRLXrV80ZC5DX78sVBa05l7dckDAUoT18eo5ZAZCA6qCqhA0jsUODy1sqgZDZD",
	Groups:["1961795094104661","1511206835567537"],
	Storys:[],
	Index:{
		show:function(sort,field,name){
			for(var i=0;i<sort.length;i++){
				var n=doc.createElement("div");
				for(var j=0;j<sort[i].length;j++){
					var p=Trianus.Story.refs.indexOf(sort[i][j]),t=Trianus.Storys[p].title.split(" ");
					if(t.length<3)t=t[0].split("_");
					if(j==0){
						var title=doc.createElement("div");
						title.className="tab "+name;title.innerHTML=t[0];
						title.appendChild
						title.onclick=function(){
							var d=this.nextSibling.style.display,
								x=doc.querySelectorAll("#list .index"),
								t=doc.querySelectorAll("#list .tab");
							for(var k=0;k<x.length;k++)x[k].style.display="none";
							for(var k=0;k<t.length;k++)if(!t[k].id)t[k].style.backgroundImage="";
							if(d==""){
								this.style.backgroundImage="";
								this.nextSibling.style.display="none";
							}else{
								this.style.backgroundImage="url(image/up.png)";
								this.nextSibling.style.display="";
							}
						}
						GetElem(field).appendChild(title);
					}
					n.style.display="none";n.className="index "+name;
					n.appendChild(Trianus.Story.link(sort[i][j],true));
					n.appendChild(doc.createElement("br"));
				}
				GetElem(field).appendChild(n);
			}
			GetElem("#list .loading").style.display="none";
		},
		view:function(){
			var list=GetElem("#list"),
				menu=GetElem("#menu"),
				menuc=GetElem("#menuc");
			if(menu&&this.id!="Story"){
				list.style.left="0px";menu.id="menuc"
			}else if(menuc){
				list.style.left="";menuc.id="menu"
			}
		},
		hide:function(){
			var trtab=doc.querySelectorAll(this.id.replace("p",".")),display="";
			if(trtab[0].style.display==""){
				display="none";
				this.style.backgroundImage="url(image/up.png)";
			}else this.style.backgroundImage="";
			for(var i=0;i<trtab.length;i++){
				if(trtab[i].className.search("index")<0||display!="")trtab[i].style.display=display;
				if(trtab[i].className.search("tab")>-1&&display!="")trtab[i].style.backgroundImage="";
			}
		}
	},
	Story:{
		type:["開端","接續","前篇","視角","接龍","活動"],
		prev:[],
		next:[],
		seri:{tree:[],flow:[],lake:[]},
		sers:{tree:[],flow:[],lake:[]},
		user:{},
		refs:[],
		floc:[],
		load:function(){
			var groupid=Trianus.Groups.shift();
			if(!groupid){
				GetElem("#loading").style.display="none";
				GetElem("#forest").style.display="";
				GetElem("#river").style.display="";
				GetElem("#lakes").style.display="";
				this.sort();//this.view();
				console.log("loaded");
				return;
			}
			var proc=function(result){
				for(var i=0;i<result.data.length;i++){
					if(!result.data[i].message)continue;
					var ser=result.data[i].message.search("#trianus_");
					if(ser==-1)continue;
					var content=result.data[i].message.substr(ser,result.data[i].message.length-ser),
						id=result.data[i].id,fid=result.data[i].from.id;
					content=content.replace(/\n\n/g,"\n");
					content=content.replace(/</g,"&lt;");
					content=content.replace(/>/g,"&gt;");
					Trianus.Story.proc(content,id,fid);
				}
				if(!result.paging||!result.paging.next){Trianus.Story.load();return;}
				Loader(result.paging.next,proc);
			};
			Loader("https://graph.facebook.com/"+groupid+"/feed?fields=comments,message,from&access_token="+Trianus.Access,proc);
		},
		proc:function(content,id,fid){
			content=content.split("\n");
			var Story={
					Post_id:id,
					type:content[0].replace(/ /g,"").replace("#trianus_",""),
					id:content[1].replace(/ /g,""),
					title:content[2],
					Title:content[2].split(" ")[0],
					article:"",
					prev:""
				};
			var odv=function(t){
				var type=[
						["seed"],["grow","leaf","dews"],["soil"],
						["muck","root","bole","vein","mist"],["flow"],["lake","pond"]
					];
				for(var i=0;i<type.length;i++)if(type[i].indexOf(t)>-1)return Trianus.Story.type[i];return t;
			}
			Story.type=odv(Story.type);
			if(Story.id.substr(0,9)!="#trianus_")return;
			if(!Trianus.Story.user[fid])Trianus.Story.user[fid]={post:0,flow:0};
			Trianus.Story.user[fid].post++;FB_UserC();
			GetElem("#list .loading").innerHTML="正在準備索引...(已載入"+Trianus.Story.refs.length+"篇)";
			var idcheck=Story.id.split("_"),tlcheck=Story.title.split(" ");
			if(isNaN(idcheck[2])){idcheck.splice(2,0,"");Story.id=idcheck.join("_")}
			if(isNaN(tlcheck[2])){tlcheck.splice(2,0,"");Story.title=tlcheck.join(" ")}
			for(var i=3;i<content.length;i++){
				if(content[i].search("#trianus_")>-1){Story.prev=content[i].replace(/ /g,"");break}
				Story.article+="<p>"+content[i]+"</p>";
			}
			if(Trianus.Story.type.indexOf(Story.type)<4){
				var ser=Trianus.Story.prev.indexOf(Story.prev);
				if(ser<0){
					Trianus.Story.prev.push(Story.prev);
					Trianus.Story.next.push([Story.id]);
				}else Trianus.Story.next[ser].push(Story.id);
				var ser=Trianus.Story.seri.tree.indexOf(Story.Title);
				if(ser<0){
					Trianus.Story.seri.tree.push(Story.Title);
					Trianus.Story.sers.tree.push([Story.id]);
				}else Trianus.Story.sers.tree[ser].push(Story.id);
			}else{
				if(Story.type=="接龍"){
					var ser=Trianus.Story.seri.flow.indexOf(Story.Title);
					if(ser<0){
						Trianus.Story.seri.flow.push(Story.Title);
						Trianus.Story.sers.flow.push([Story.id]);
					}else Trianus.Story.sers.flow[ser].push(Story.id);
				}else if(Story.type=="活動"){
					var ser=Trianus.Story.seri.lake.indexOf(Story.Title);
					if(ser<0){
						Trianus.Story.seri.lake.push(Story.Title);
						Trianus.Story.sers.lake.push([Story.id]);
					}else Trianus.Story.sers.lake[ser].push(Story.id);
				}
			}
			Trianus.Story.refs.push(Story.id);
			this.show(Story);
		},
		show:function(Story){
			Trianus.Storys.push(Story);
			var field=doc.createElement("div"),title=doc.createElement("div"),
				article=doc.createElement("article"),next=doc.createElement("div"),
				buttons=doc.createElement("div"),comment=doc.createElement("input");
			field.id="trianus_"+(Trianus.Storys.length-1);field.className="story article";
			field.oncontextmenu=function(e){e.preventDefault()}
			title.innerHTML=Story.title;title.className="title";
			article.innerHTML=Story.article;
			if(Story.type=="接龍"){
				var l=Trianus.Story.floc.length;
				Trianus.Story.floc.push([]);
				this.flow(field,article,Story.Post_id,l);
				field.style.display="none";
			}
			next.className="next";
			comment.value="吹拂";comment.type="button";comment.title="說說你的想法吧?";
			comment.onclick=function(){
				var group=Story.Post_id.split("_")[0],feeds=Story.Post_id.split("_")[1]
				window.open("https://facebook.com/"+group+"?view=permalink&id="+feeds)
			};
			buttons.style.paddingBottom="0px";
			buttons.style.textAlign="right";
			buttons.appendChild(comment);field.appendChild(title);
			field.appendChild(doc.createElement("hr"));field.appendChild(article);
			field.appendChild(next);field.appendChild(buttons);
			GetElem("#Storyscroll").insertBefore(field,GetElem("#loading"));
		},
		flow:function(field,article,Post_id,l){
			var proc=function(result,url,p){
					for(var i=0;i<result.data.length;i++){
						var c=0;
					if(result.data[i].message.search("#flow ")==0||result.data[i].message.search("#接續 ")==0){
							if(i!=0&&!p.f)Trianus.Story.floc[p.p]+="</p>";c=1;
							Trianus.Story.floc[p.p]+="<p>"+result.data[i].message.replace("#flow ","");
						}else if(result.data[i].message.search("#join ")==0||result.data[i].message.search("#續上 ")==0){
							Trianus.Story.floc[p.p]+=result.data[i].message.replace("#join ","");c=1;
						}
						if(c){
							if(!Trianus.Story.user[result.data[i].from.id])Trianus.Story.user[result.data[i].from.id]={post:0,flow:0};
							Trianus.Story.user[result.data[i].from.id].flow++;FB_UserC();
						}
					}
					if(p.f)p.f=0;
					if(result.paging&&result.paging.next)Loader(result.paging.next,proc,p);
					else{
						p.article.innerHTML+=Trianus.Story.floc+"</p>";p.field.style.display="";
					}
				};
			Loader("https://graph.facebook.com/"+Post_id+"/comments?fields=message,from&access_token="+Trianus.Access,proc,{
				f:1,p:l,article:article,field:field
			})
		},
		sort:function(){
			var sort=[];
			for(var i=0;i<Trianus.Story.sers.tree.length;i++){
				var q=[],b=1,fc=0,dl=0,sd=[],lq=[];
				for(var j=0;j<Trianus.Story.sers.tree[i].length;j++){
					var id=Trianus.Story.sers.tree[i][j],c=id.split("_"),p=Trianus.Story.refs.indexOf(id);
					if(c[2]>b)b=c[2];
					if(c[2]==1&&Trianus.Storys[p].prev==""){q.push(id);sd.push(id)}
				}
				while(q.length!=Trianus.Story.sers.tree[i].length&&dl<100){
					for(var k=1;k<b*1+1;k++){
						for(var j=0;j<Trianus.Story.sers.tree[i].length;j++){
							var id=Trianus.Story.sers.tree[i][j],c=id.split("_"),p=Trianus.Story.refs.indexOf(id);
							if(q.indexOf(id)>-1)continue;
							if(c[2]==k&&q.indexOf(Trianus.Storys[p].prev)>-1)q.push(id);
						}
					}dl++;
				}
				Trianus.Story.sers.tree[i]=q;
				for(var j=0;j<sd.length;j++){
					var p=q.indexOf(sd[j]);
					lq=lq.concat(this.tree(Trianus.Story.sers.tree[i],p,[],1));
				}
				sort=sort.concat([lq]);
			}
			Trianus.Index.show(sort,"#forest","tree")
			Trianus.Index.show(Trianus.Story.sers.flow,"#river","flow")
			Trianus.Index.show(Trianus.Story.sers.lake,"#lakes","lake")
		},
		tree:function(series,page,tree,seed){
			var id=series[page];
			if(seed)tree.push(id);
			else if(page==series.length)return tree;
			else{
				var ref=Trianus.Story.refs.indexOf(id),p=tree.indexOf(Trianus.Storys[ref].prev);
					prevfield=GetElem("#trianus_"+Trianus.Story.refs.indexOf(Trianus.Storys[ref].prev)+" .next");
				if(prevfield){
					var sr=p+1;
					prevfield.appendChild(this.link(id));
					prevfield.appendChild(doc.createElement("br"));
					tree.splice(sr,0,id);
				}else{console.log(tree);return tree}
			}
			return this.tree(series,page+1,tree);
		},
		link:function(id,index,n){
			var a=doc.createElement("a"),
				p=Trianus.Story.refs.indexOf(id),
				c=(id.split("_")[2]-1)*20,
				t=Trianus.Storys[p].title.split(" ");
			if(c<0)c=0;
			if(t.length<3)t=t[0].split("_");
			for(var i=3;i<t.length;i++)t[2]+=" "+t[i];
			a.href="#_trianus_"+p;
			if(index){
				a.innerHTML=t[1]+" "+t[2];
				a.style.marginLeft=c+"px";
			}else a.innerHTML=Trianus.Storys[p].title;
			a.onclick=this.view;
			return a
		},
		view:function(){
			var id=decodeURI(location.hash).replace("#","");
			var fields=doc.querySelectorAll(".story.article");
			for(var i=0;i<fields.length;i++){
				fields[i].style.display=(Storys[i].id.search(id)<0&&fields[i].id!=id.replace("_",""))?"none":"";
			}
		}
	}
};
doc.body.onload=function(){Resize();FB_Login();Trianus.Story.load()};
doc.body.oncontextmenu=function(e){if(!isMobile())e.preventDefault()};
doc.body.onresize=Resize;
doc.body.onhashchange=Trianus.Story.view;
GetElem("#menu").addEventListener("click",Trianus.Index.view);
GetElem("#title").addEventListener("click",function(){location="#"});
GetElem("#ptree").addEventListener("click",Trianus.Index.hide);
GetElem("#pflow").addEventListener("click",Trianus.Index.hide);
GetElem("#plake").addEventListener("click",Trianus.Index.hide);
GetElem("#Story").addEventListener("click",Trianus.Index.view);
window.fbAsyncInit = function() {
	FB.init({
		appId      : '282043442204930',
		xfbml      : true,
		version    : 'v2.9'
	});
	FB.AppEvents.logPageView();
};
(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));