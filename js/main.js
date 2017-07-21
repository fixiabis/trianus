var doc=document,Cookies={
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
},
Temp={
	type:[
		"#trianus_soil",
		"#trianus_seed",
		"#trianus_grow",
		"#trianus_leaf",
		"#trianus_dews",
		"#trianus_muck",
		"#trianus_root",
		"#trianus_bole",
		"#trianus_vein",
		"#trianus_mist",
		"#trianus_flow",
		"#trianus_lake",
		"#trianus_pond",
	],
	edit:{
		post:"#trianus_seed"
	},
	prev:[],
	next:[],
	news:[],
	newo:[],
	refs:[],
	floc:[],
	fews:[],
	fewo:[],
	rews:[],
	rewo:[]
},
Storys=[],
clipboard = new Clipboard("#trianus_copy"),
access_token="access_token=EAAEAhFsvEQIBAK6LTYJo1jv0lp5trzauCWyvJArA9jkwzEkIP7R2NsisUAogl7b4eWteLWk3ygt1CYTGhAN7vQRIjOVUDzmCLyyl8SFYb5Cye3QPRLXrV80ZC5DX78sVBa05l7dckDAUoT18eo5ZAZCA6qCqhA0jsUODy1sqgZDZD";
clipboard.on('success',function(e){doc.querySelector("#trianus_post").value="已複製"});
doc.body.onload=function(){
	Story_Load()
}
doc.body.onresize=function(){
	doc.querySelector("#list").style.left="";
	var menuc=doc.querySelector("#menuc");
	if(menuc)menuc.id="menu";
}
doc.body.onhashchange=Story_View;
doc.body.oncontextmenu=function(e){
	if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent))e.preventDefault()
}
doc.body.onkeyup=Story_Save;
doc.querySelector("#menu").addEventListener("click",Index_View);
doc.querySelector("#title").addEventListener("click",function(){location="#"});
doc.querySelector("#ptree").addEventListener("click",Index_Hide);
doc.querySelector("#pflow").addEventListener("click",Index_Hide);
doc.querySelector("#plake").addEventListener("click",Index_Hide);
doc.querySelector("#trianus_post").addEventListener("click",function(){
	if(Story_Save())doc.querySelector("#trianus_copy").click();
});
doc.querySelector("#trianus_kill").addEventListener("dblclick",function(){
	var type=(["繁殖","尋源","掘湖"])[(["摘除","絕源","填湖"]).indexOf(this.value)];
	Story_Edit("",1,type,(type=="繁殖")?"播種":type,1);
});
doc.querySelector("#trianus_view").addEventListener("click",function(){
	doc.querySelector("#post").style.display="none";
});
doc.querySelector("#seed").addEventListener("click",function(){Story_Edit("",1,"繁殖","播種",1)});
doc.querySelector("#flow").addEventListener("click",function(){Story_Edit("",1,"尋源","尋源",1)});
//doc.querySelector("#lake").addEventListener("click",function(){Story_Edit("",1,"掘湖","掘湖",1)});
doc.querySelector("#Story").addEventListener("click",Index_View);
function Index_Hide(){
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
function Index_View(){
	var list=doc.querySelector("#list"),
		menu=doc.querySelector("#menu"),
		menuc=doc.querySelector("#menuc");
	if(menu&&this.id!="Story"){
		list.style.left="0px";menu.id="menuc"
	}else if(menuc){
		list.style.left="";menuc.id="menu"
	}
}
function Loader(url,proc,parameter){
	var xhr=new XMLHttpRequest();
	xhr.onload=function(){proc(JSON.parse(this.response),url,parameter)}
	xhr.onerror=function(){Loader(url,proc)}
	xhr.open("get",url);
	xhr.send();
}
function Story_Flow(field,article,Post_id,l){
	var parameter=access_token,
		proc=function(result,url,p){
			for(var i=0;i<result.data.length;i++){
				if(result.data[i].message.search("#flow ")==0){
					if(i!=0&&!p.f)Temp.floc[p.p]+="</p>";
					Temp.floc[p.p]+="<p>"+result.data[i].message.replace("#flow ","");
				}else if(result.data[i].message.search("#join ")==0){
					Temp.floc[p.p]+=result.data[i].message.replace("#join ","");
				}
			}
			if(p.f)p.f=0;
			if(result.paging&&result.paging.next)Loader(result.paging.next,proc,p);
			else{
				p.article.innerHTML+=Temp.floc+"</p>";p.field.style.display="";
			}
		};
	parameter+="&fields=message";
	Loader("https://graph.facebook.com/"+Post_id+"/comments?"+parameter,proc,{
		f:1,p:l,article:article,field:field
	})
}
function Story_Edit(title,count,type,post,clear){
	var n=(["翻土","繁殖","培養","結葉","結露","施肥","扎根","擴展","葉脈","薄霧","尋源","掘湖","造湖"]).indexOf(type),
		kill="摘除",read=true;
	switch(true){
		case n == 0:count=0;break;
		case n == 1:read=false;break;
		case n <  5:count++;break;
		case n < 10:break;
		case n ==10:kill="絕源";count="";title="";read=false;break;
		case n ==11:kill="填湖";count="";title="";read=false;break;
		case n ==12:kill="填湖";count="";break;
	}
	Temp.edit.type=Temp.type[n];
	doc.querySelector("#trianus_Mtitle").value=title;
	doc.querySelector("#trianus_Mtitle").readOnly=read;
	doc.querySelector("#trianus_count").value=count;
	doc.querySelector("#trianus_kill").value=kill;
	doc.querySelector("#trianus_post").value=post;
	if(clear){
		doc.querySelector("#trianus_title").value="";
		doc.querySelector("#trianus_content").value="";
	}
	Story_Post();
}
function Story_Sort(){
	var sort=[];
	for(var i=0;i<Temp.newo.length;i++){
		var q=[],b=1,fc=0,dl=0,sd=[],lq=[];
		for(var j=0;j<Temp.newo[i].length;j++){
			var id=Temp.newo[i][j],c=id.split("_"),p=Temp.refs.indexOf(id);
			if(c[2]>b)b=c[2];
			if(c[2]==1&&Storys[p].prev==""){q.push(id);sd.push(id)}
		}
		while(q.length!=Temp.newo[i].length&&dl<100){
			for(var k=1;k<b*1+1;k++){
				for(var j=0;j<Temp.newo[i].length;j++){
					var id=Temp.newo[i][j],c=id.split("_"),p=Temp.refs.indexOf(id);
					if(q.indexOf(id)>-1)continue;
					if(c[2]==k&&q.indexOf(Storys[p].prev)>-1)q.push(id);
				}
			}dl++;
		}
		Temp.newo[i]=q;
		for(var j=0;j<sd.length;j++){
			var p=q.indexOf(sd[j]);
			lq=lq.concat(Story_Tree(Temp.newo[i],p,[],1));
		}
		sort=sort.concat([lq]);
	}
	Index_Show(sort,"#forest","tree")
	Index_Show(Temp.fewo,"#river","flow")
	Index_Show(Temp.rewo,"#lakes","lake")
}
function Story_Tree(series,page,tree,seed){
	var id=series[page];
	if(seed)tree.push(id);
	else if(page==series.length)return tree;
	else{
		var ref=Temp.refs.indexOf(id),p=tree.indexOf(Storys[ref].prev);
			prevfield=doc.querySelector("#trianus_"+Temp.refs.indexOf(Storys[ref].prev)+" .next");
		if(prevfield){
			var sr=p+1;
			prevfield.appendChild(Story_Link(id));
			prevfield.appendChild(doc.createElement("br"));
			for(var i=p+1;i<tree.length;i++){
				var nid=Storys[Temp.refs.indexOf(tree[i])].type;
				if(Temp.type.indexOf(nid)>5)sr++;
			}
			tree.splice(sr,0,id);
		}else return tree;
	}
	return Story_Tree(series,page+1,tree);
}
function Story_Load(){
	var parameter=access_token;
		parameter+="&fields=comments,message",
		proc=function(result){
			for(var i=0;i<result.data.length;i++){
				if(!result.data[i].message)continue;
				var ser=result.data[i].message.search("#trianus_");
				if(ser==-1)continue;
				var content=result.data[i].message.substr(ser,result.data[i].message.length-ser),
					id=result.data[i].id;
				Story_Proc(content.replace(/\n\n/g,"\n"),id);
			}
			if(!result.paging||!result.paging.next){
				doc.querySelector("#loading").style.display="none";
				doc.querySelector("#forest").style.display="";
				doc.querySelector("#river").style.display="";
				doc.querySelector("#lakes").style.display="";
				Story_Sort();Story_View();return
			}
			Loader(result.paging.next,proc);
		};
	
	Loader("https://graph.facebook.com/1961795094104661/feed?"+parameter,proc);
	//Loader("https://graph.facebook.com/1511206835567537/feed?"+parameter);
}
function Story_Proc(content,id){
	content=content.split("\n");
	var Story={
			Post_id:id,
			type:content[0].substr(0,13).replace(/ /g,""),
			id:content[1].replace(/ /g,""),
			title:content[2],
			Title:content[2].split(" ")[0],
			article:"",
			prev:""
		};
	if(Story.id.substr(0,9)!="#trianus_")return;
	for(var i=3;i<content.length;i++){
		if(content[i].search("#trianus_")>-1){
			Story.prev=content[i].replace(/ /g,"");break
		}
		Story.article+="<p>"+content[i]+"</p>";
	}
	if(Temp.type.indexOf(Story.type)<10){
		var ser=Temp.prev.indexOf(Story.prev);
		if(ser<0){
			Temp.prev.push(Story.prev);
			Temp.next.push([Story.id]);
		}else{
			Temp.next[ser].push(Story.id);
		}
		var ser=Temp.news.indexOf(Story.Title)
		if(ser<0){
			Temp.news.push(Story.Title);
			Temp.newo.push([Story.id]);
		}else{
			Temp.newo[ser].push(Story.id);
		}
	}else{
		if(Story.type=="#trianus_flow"){
			var ser=Temp.fews.indexOf(Story.Title);
			if(ser<0){
				Temp.fews.push(Story.Title);
				Temp.fewo.push([Story.id]);
			}else{
				Temp.fewo[ser].push(Story.id);
			}
		}
		if(Story.type=="#trianus_lake"||Story.type=="#trianus_pond"){
			var ser=Temp.rews.indexOf(Story.Title);
			if(ser<0){
				Temp.rews.push(Story.Title);
				Temp.rewo.push([Story.id]);
			}else{
				Temp.rewo[ser].push(Story.id);
			}
		}
	}
	Temp.refs.push(Story.id);
	Story_Show(Story);
}
function Story_Show(Story){
	Storys.push(Story);
	var field=doc.createElement("div"),
		title=doc.createElement("div"),
		article=doc.createElement("article"),
		next=doc.createElement("div"),
		buttons=doc.createElement("div"),
		comment=doc.createElement("input"),
		action=doc.createElement("input"),
		action2=doc.createElement("input"),
		action3=doc.createElement("input");
	field.id="trianus_"+(Storys.length-1);
	field.className="story article";
	field.oncontextmenu=function(e){e.preventDefault()}
	title.innerHTML=Story.title;title.className="title";
	article.innerHTML=Story.article;
	if(Story.type=="#trianus_flow"){
		var l=Temp.floc.length;
		Temp.floc.push([]);
		Story_Flow(field,article,Story.Post_id,l);
		field.style.display="none";
	}
	next.className="next";
	comment.value="吹拂";comment.type="button";comment.title="說說你的想法吧?";
	comment.onclick=function(){
		var group=Story.Post_id.split("_")[0],feeds=Story.Post_id.split("_")[1]
		window.open("https://facebook.com/"+group+"?view=permalink&id="+feeds)
	};
	switch(Story.type){
		case"#trianus_soil":
			action.value="翻土";action.title="試著寫寫看前傳吧?";
			action2.value="施肥";action2.title="以不同視角描述看看吧?";break;
		case"#trianus_muck":
			action.value="施肥";action.title="以不同視角描述看看吧?";break;
		case"#trianus_seed":
			action.value="培養";action.title="來接續文章吧?";
			action2.value="扎根";action2.title="以不同視角描述看看吧?";
			action3.value="翻土";action3.title="試著寫寫看前傳吧?";break;
		case"#trianus_root":
			action.value="扎根";action.title="以不同視角描述看看吧?";break;
		case"#trianus_grow":
			action.value="培養";action.title="來接續文章吧?";
			action2.value="擴展";action2.title="以不同視角描述看看吧?";
			action3.value="結葉";action3.title="寫一個結尾吧?";break;
		case"#trianus_bole":
			action.value="擴展";action.title="以不同視角描述看看吧?";break;
		case"#trianus_leaf":
			action.value="結露";action.title="寫一個後續吧?";
			action2.value="葉脈";action2.title="以不同視角描述看看吧?";break;
		case"#trianus_vein":
			action.value="葉脈";action.title="以不同視角描述看看吧?";break;
		case"#trianus_dews":
			action.value="繁殖";action.title="寫一個新的種子吧?";
			action2.value="薄霧";action2.title="以不同視角描述看看吧?";break;
		case"#trianus_mist":
			action.value="薄霧";action.title="以不同視角描述看看吧?";break;
		case"#trianus_flow":
			action.value="尋源";action.title="寫一個新的源頭吧?";comment.value="延續";break;
		case"#trianus_lake":
			action.value="造湖";action.title="以這個主題寫一個單篇吧?";break;
		case"#trianus_pond":
			action.value="造湖";action.title="以這個主題寫一個單篇吧?";break;
	}
	action.type="button";action2.type="button";action3.type="button";
	var proc=function(){
		Story_Edit(Story.title.split(" ")[0],Story.id.split("_")[2]*1,this.value,this.value)
		Temp.edit.id=Story.id;
		Story_View();
	}
	action.onclick=proc;action2.onclick=proc;action3.onclick=proc;
	buttons.style.paddingBottom="0px";
	buttons.style.textAlign="right";
	if(action.value)buttons.appendChild(action);
	if(action2.value)buttons.appendChild(action2);
	if(action3.value)buttons.appendChild(action3);
	buttons.appendChild(comment);
	field.appendChild(title);
	field.appendChild(doc.createElement("hr"));
	field.appendChild(article);
	field.appendChild(next);
	field.appendChild(buttons);
	doc.querySelector("#Story").insertBefore(field,doc.querySelector("#loading"));
}
function Story_Link(id,index,n){
	var a=doc.createElement("a"),
		p=Temp.refs.indexOf(id),
		c=(id.split("_")[2]-1)*20,
		t=Storys[p].title.split(" ");
	if(c<0)c=0;
	if(t.length<3)t=t[0].split("_");
	for(var i=3;i<t.length;i++)t[2]+=" "+t[i];
	a.href="#_trianus_"+p;
	if(index){
		a.innerHTML=t[1]+" "+t[2];
		a.style.marginLeft=c+"px";
	}else a.innerHTML=Storys[p].title;
	a.onclick=Story_View;
	return a
}
function Story_View(){
	var id=decodeURI(location.hash);
	var field=doc.querySelectorAll(".story.article");
	if(id&&id[1]!="_")id="#_trianus_"+Temp.refs.indexOf(id);
	for(var i=0;i<field.length;i++){
		var d="";
		if(field[i].id!=id.replace("#_",""))d="none";
		else d="";
		if(!id)d="";
		field[i].style.display=d;
	}
	doc.querySelector("#Story").scrollTop=0;
}
function Story_Post(){
	doc.querySelector("#post").style.display="";
	doc.querySelector("#Story").scrollTop=0;
}
function Story_Save(){
	var title=doc.querySelector("#trianus_title"),
		Title=doc.querySelector("#trianus_Mtitle"),
		content=doc.querySelector("#trianus_content"),
		count=doc.querySelector("#trianus_count"),
		format=doc.querySelector("#trianus_format"),
		type=Temp.edit.type,
		id="#trianus_"+Title.value+"_"+count.value+"_"+title.value,
		rp=0;
	if(!Title.value||content.value.length<60||!title.value)return;
	if(Temp.refs.indexOf(id)>-1)while(1){
		if(Temp.refs.indexOf(id+"_"+rp)>-1)rp++;
		else{id=id+"_"+rp;break}
	}
	format.value=Temp.edit.type+"\n";
	format.value+=id+"\n";
	format.value+=Title.value+" "+count.value+" "+title.value+"\n";
	format.value+=content.value;
	if(type!="#trianus_seed"&&type!="#trianus_flow"&&type!="#trianus_lake"){
		format.value+="\n"+Temp.edit.id;
	}
	return 1;
}
function Index_Show(sort,field,name){
	for(var i=0;i<sort.length;i++){
		var n=doc.createElement("div");
		for(var j=0;j<sort[i].length;j++){
			var p=Temp.refs.indexOf(sort[i][j]),
				t=Storys[p].title.split(" ");
			if(t.length<3)t=t[0].split("_");
			if(j==0){
				var title=doc.createElement("div");
				title.className="tab "+name;
				title.innerHTML=t[0];
				title.appendChild
				title.onclick=function(){
					var d=this.nextSibling.style.display,
						x=doc.querySelectorAll("#list .index"),
						t=doc.querySelectorAll("#list .tab");
					for(var k=0;k<x.length;k++)x[k].style.display="none";
					for(var k=0;k<t.length;k++)if(!t[k].id)t[k].style.backgroundImage="";
					if(d==""){
						this.style.backgroundImage=""
						this.nextSibling.style.display="none"
					}else{
						this.style.backgroundImage="url(image/up.png)"
						this.nextSibling.style.display=""
					}
				}
				doc.querySelector(field).appendChild(title);
			}
			n.style.display="none";
			n.className="index "+name;
			n.appendChild(Story_Link(sort[i][j],true));
			n.appendChild(doc.createElement("br"));
		}
		doc.querySelector(field).appendChild(n);
	}
	doc.querySelector("#list .loading").style.display="none";
}