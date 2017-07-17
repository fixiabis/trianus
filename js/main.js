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
},Temp={
	prev:[],
	next:[],
	news:[],
	newo:[],
	refs:[]
},Storys=[];
doc.body.onhashchange=function(){
	doc.body.scrollTop=0;
	var id=location.hash;
	var field=doc.querySelectorAll(".story.article");
	for(var i=0;i<field.length;i++){
		var d="";
		if(field[i].id!=id.replace("#",""))d="none";
		else d="";
		if(!id)d="";
		field[i].style.display=d;
	}
}
doc.body.onload=function(){
	Story_Load()
}
doc.body.onresize=function(){
	doc.querySelector("#list").style.left="";
	var menuc=doc.querySelector("#menuc");
	if(menuc)menuc.id="menu";
}
doc.querySelector("#menu").addEventListener("click",function(){
	var list=doc.querySelector("#list");
	if(this.id=="menu"){
		list.style.left="0px";this.id="menuc"
	}else{
		list.style.left="";this.id="menu"
	}
})
doc.querySelector("#title").addEventListener("click",function(){
	location="#";
})
function Loader(url){
	var xhr=new XMLHttpRequest();
	xhr.onreadystatechange=function(r){
		if(this.readyState!=4||this.status!=200)return;
		var result=JSON.parse(this.response);
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
			Story_Sort();return
		}
		Loader(result.paging.next);
	}
	xhr.open("get",url);
	xhr.send();
}
function Story_Sort(){
	var sort=[];
	for(var i=0;i<Temp.newo.length;i++){
		Temp.newo[i].sort();
		sort=sort.concat([Story_Tree(Temp.newo[i],0,[])]);
	}
	Index_Show(sort)
}
function Story_Tree(series,page,tree){
	var id=series[page];
	if(page==0)tree.push(id);
	else if(page==series.length)return tree
	else{
		var ref=Temp.refs.indexOf(id),p=tree.indexOf(Storys[ref].prev);
			prevfield=doc.querySelector("#trianus_"+Temp.refs.indexOf(Storys[ref].prev)+" .next");
		prevfield.appendChild(Story_Link(id));
		prevfield.appendChild(doc.createElement("br"));
		tree.splice(p+1,0,id);
	}
	return Story_Tree(series,page+1,tree);
}
function Story_Load(){
	Loader("https://graph.facebook.com/1961795094104661/feed?access_token=EAAEAhFsvEQIBAK6LTYJo1jv0lp5trzauCWyvJArA9jkwzEkIP7R2NsisUAogl7b4eWteLWk3ygt1CYTGhAN7vQRIjOVUDzmCLyyl8SFYb5Cye3QPRLXrV80ZC5DX78sVBa05l7dckDAUoT18eo5ZAZCA6qCqhA0jsUODy1sqgZDZD")
}
function Story_Proc(content,id){
	content=content.split("\n");
	var Story={
			Post_id:id.split("_")[1],
			type:content[0],
			id:content[1],
			title:content[2],
			Title:content[2].split(" ")[0],
			article:"",
			prev:""
		};
	if(Story.id.substr(0,9)!="#trianus_")return;
	for(var i=3;i<content.length;i++){
		if(content[i].substr(0,9)=="#trianus_"){
			Story.prev=content[i];break
		}
		Story.article+="<p>"+content[i]+"</p>";
	}
	var ser=Temp.prev.indexOf(Story.prev)
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
		comment=doc.createElement("input");
	field.className="story article";
	title.innerHTML=Story.title;
	title.className="title";
	article.innerHTML=Story.article;
	next.className="next";
	comment.onclick=function(){
		window.open("https://facebook.com/groups/1961795094104661?view=permalink&id="+Story.Post_id)
	};
	comment.value="吹拂";
	comment.type="button";
	comment.style.marginLeft="10px";
	buttons.style.textAlign="right";
	buttons.appendChild(comment);
	field.id="trianus_"+(Storys.length-1);
	field.appendChild(title);
	field.appendChild(doc.createElement("hr"));
	field.appendChild(article);
	field.appendChild(next);
	field.appendChild(buttons);
	doc.body.insertBefore(field,doc.querySelector("#loading"));
}
function Story_Link(id,index,n){
	var a=doc.createElement("a"),
		p=Temp.refs.indexOf(id),
		c=id.split("_")[2],
		t=Storys[p].title.split(" ");
	if(t.length<3)t=t[0].split("_");
	for(var i=3;i<t.length;i++)t[2]+=" "+t[i];
	a.href="#trianus_"+p;
	if(index){
		for(var i=1;i<c;i++){
			var n=doc.createElement("span");
			a.appendChild(n);
		}
		var l=doc.createElement("font");
		l.innerHTML=t[1]+" "+t[2];
		a.appendChild(l);
	}else a.innerHTML=Storys[p].title;
	return a
}
function Index_Show(sort){
	for(var i=0;i<sort.length;i++){
		var n=doc.createElement("div");
		for(var j=0;j<sort[i].length;j++){
			var p=Temp.refs.indexOf(sort[i][j]),
				t=Storys[p].title.split(" ");
			if(t.length<3)t=t[0].split("_");
			if(j==0){
				var title=doc.createElement("div");
				title.className="title";
				title.innerHTML=t[0];
				title.appendChild
				title.onclick=function(){
					var d=this.nextSibling.style.display,
						x=doc.querySelectorAll("#list .index"),
						t=doc.querySelectorAll("#list .title");
					for(var k=0;k<x.length;k++)x[k].style.display="none";
					for(var k=0;k<t.length;k++)t[k].style.backgroundImage="";
					if(d==""){
						this.style.backgroundImage=""
						this.nextSibling.style.display="none"
					}else{
						this.style.backgroundImage="url(image/up.png)"
						this.nextSibling.style.display=""
					}
				}
				doc.querySelector("#list").appendChild(title);
			}
			n.style.display="none";
			n.className="index";
			n.appendChild(Story_Link(sort[i][j],true));
			n.appendChild(doc.createElement("br"));
		}
		doc.querySelector("#list").appendChild(n);
	}
	doc.querySelector("#list .loading").style.display="none";
}