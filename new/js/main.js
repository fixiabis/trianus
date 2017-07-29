var doc = document,
    key = "EAAEAhFsvEQIBAK6LTYJo1jv0lp5trzauCWyvJArA9jkwzEkIP7R2NsisUAogl7b4eWteLWk3ygt1CYTGhAN7vQ\
           RIjOVUDzmCLyyl8SFYb5Cye3QPRLXrV80ZC5DX78sVBa05l7dckDAUoT18eo5ZAZCA6qCqhA0jsUODy1sqgZDZD",
    groupsId = ["1961795094104661", "1511206835567537"],
    triformat = "#trianus_",
    Storys = {
        all:[],
        sortBy:{
            users:{},
            groups:{},
            series:{},
            relate:{}
        },
        type:["開端", "接續", "前篇", "視角", "接龍", "活動", "單篇"]
    };
function isMobile(){
	return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)
}
function noScrollbar(){
    var Sample = $(".scroll")[0],
        newSize = "calc(100% + " + (Sample.offsetWidth - Sample.scrollWidth) + "px)";
    if(!isMobile())$(".scroll").css("width", newSize).css("height", newSize);
}
function Request(url, proc, parameter){
	var xhr=new XMLHttpRequest();
	xhr.onload=function(){proc(JSON.parse(this.response), url, parameter)};
	xhr.onerror=function(){Request(url, proc, parameter)};
	xhr.open("get", url);
	xhr.send();
}
function Menu(){
    if(this.id && this.id == "menu"){
        $("#list").css("left", "0px"); this.id = "menuc";
    }else{
        var menuc = $("#menuc")[0];
        $("#list").css("left", "");
        if(menuc)menuc.id = "menu";
    }
}
function StoryFlow(p){
    var Story=Storys.all[p],
        proc=function(res,url,p){
            for(var i = 0; i< res.data.length; i++){
                var content = res.data[i].message, count=true;
                if(content.search("#flow ") == 0 || content.search("#接續 ") == 0){
                    if(i != 0 && !p.f)Storys.all[p.p].article += "</p>";
                    Storys.all[p.p].article += "<p>" + content.replace("#flow ", "").replace("#接續 ", "");
                }else if(content.search("#join ") == 0 || content.search("#續上 ") == 0){
                    Storys.all[p.p].article += "<p>" + content.replace("#join ", "").replace("#續上 ", "");
                }else count = false;
                if(count && res.data[i].from){
                    var uid = res.data[i].from.id;
                    if(!Storys.sortBy.users[uid])Storys.sortBy.users[uid] = {story: [], flow: 0};
                    Storys.sortBy.users[uid].flow++;
                }
            }
            if(p.f)p.f=0;
            if(res.paging && res.paging.next)Request(res.paging.next, proc, p);
            else Storys.all[p.p].article += "</p>";
		};
	Request("https://graph.facebook.com/" + Story.postId + "/comments?fields=message,from&access_token=" + key, proc, {p: p, f: 1});
}
function StoryLoad(){
    if(!groupsId.length)return console.log(Storys);
    var groupId = groupsId.shift(),
        proc = function(res){
            for(var i = 0; i < res.data.length; i++){
				if(!res.data[i].message)continue;
				var ser = res.data[i].message.search("#trianus_");
                if(ser == -1)continue;
                StoryProc(res.data[i], ser);
            }
            if(!res.paging || !res.paging.next){StoryLoad(); return}
			Request(res.paging.next, proc);
        };
    Request("https://graph.facebook.com/" + groupId + "/feed?fields=comments,message,from&access_token=" + key, proc)
}
function StoryProc(data, ser){
    var content = data.message.substr(ser, data.message.length - ser),
        ids = data.id.split("_"), article = "", ref = "", n = Storys.all.length,
        uid = "", type = "", id = "", title = "", serie = "";
    if(data.from)uid=data.from.id;
    content = content.replace(/\n\n/g, "\n").replace(/</g, "&lt;").replace(/>/g, "&gt;").split("\n");
    type = content[0].replace(/ /g, ""); if(type.substr(0, 9) != triformat)return; type = type.replace(triformat, "");
    id = content[1].replace(/ /g, ""); if(id.substr(0, 9) != triformat)return; id = id.replace(triformat, "");
    title = content[2];
    serie = id.split("_")[0];
    for(var i = 3; i < content.length; i++){
        if(content[i].substr(0, 9) != triformat)article += "<p>" + content[i] + "</p>";
        else{ref = content[i].replace(triformat, ""); break}
    }
    type=(function(type){
		var oldtype=[
			["seed"], ["grow", "leaf", "dews"], ["soil"],
            ["muck", "root", "bole", "vein", "mist"],
            ["flow"], ["lake", "pond"], ["sand"]
		];
		for(var i=0;i<oldtype.length;i++)if(oldtype[i].indexOf(type)>-1)return Storys.type[i];return type
    })(type);
    var Story = {
        groupId: ids[0], postId: ids[1], userId: uid, type: type,id: id,
        serie: serie, title: title, article: article, ref: ref
    };
    if(!Storys.sortBy.users[uid])Storys.sortBy.users[uid] = {story: [], flow: 0};
    Storys.sortBy.users[uid].story.push(n);
    if(!Storys.sortBy.groups[ids[0]])Storys.sortBy.groups[ids[0]] = []; Storys.sortBy.groups[ids[0]].push(n);
    if(!Storys.sortBy.series[serie])Storys.sortBy.series[serie] = []; Storys.sortBy.series[serie].push(n);
    if(!Storys.sortBy.relate[ref])Storys.sortBy.relate[ref] = []; Storys.sortBy.relate[ref].push(n);
    $("#story .scroll").append(StoryField(Story, n));
    Storys.all.push(Story);
    if(Story.type == "接龍")StoryFlow(n);
}
function StoryField(Story, id){
    var field = doc.createElement("div"),
        title = doc.createElement("div"),
        article = doc.createElement("div"),
        refLink = doc.createElement("div"),
        action = doc.createElement("div"),
        comment = doc.createElement("input");
    title.className = "title"; title.innerHTML = Story.title;
    article.className = "article"; article.innerHTML = Story.article;
    refLink.className = "refLink";
    comment.value="留言"; comment.type = "button";
    comment.onclick=function(){
        window.open("https://facebook.com/" + Story.groupId + "?view=permalink&id=" + Story.postId)
    };
    action.align = "right";
    action.appendChild(comment);
    field.className = "story";
    field.id = "trianus" + id;
    field.appendChild(title);
    field.appendChild(doc.createElement("hr"));
    field.appendChild(article);
    field.appendChild(refLink);
    field.appendChild(action);
    return field
}
doc.body.onload=function(){
    noScrollbar();
    StoryLoad();
}
doc.body.onresize=function(){
    noScrollbar();
    Menu();
}
$("#menu").click(Menu);
$("#story").click(Menu);