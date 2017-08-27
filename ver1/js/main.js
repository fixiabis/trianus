var Cookies = {
	set: function (name, value, expire) {
		var date = new Date();
		date.setTime(date.getTime() + expire * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + value + ";expires=" + date.toGMTString();
	},
	get: function (name) {
		var cookie = document.cookie.split("; ");
		for (var i = 0; i < cookie.length; i++) {
			var data = cookie[i].split("=");
			if (data[0] == name) return data[1];
		}
	},
	del: function (name) {
		var date = new Date();
		date.setTime(0);
		document.cookie = name + "=;expires=" + date.toGMTString();
	}
}, Storys = {}, StorysTitle = [], StorysTitleC = [], EditQ = ""
function FB_Group_Request(url) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var result = JSON.parse(this.response);
		for (var i = 0; i < result.data.length; i++) {
			if (!result.data[i].message) continue;
			var ser = result.data[i].message.search("#trianus_")
			if (ser > -1) {
				var p = result.data[i].message;
				if (ser != 0) {
					p = result.data[i].message.substr(ser, result.data[i].message.length - ser);
				}
				Story_Style(p.replace(/\n\n/g, "\n"), result.data[i].id);
			}
		}
		document.querySelector("#loading").style.display = "none"; Story_Show();
		if (location.search.substr(0, 3) == "?q=" && location.search.length > 3)
			Story_Search(decodeURI(location.search.split("?q=")[1]))
		for (var i in Storys) for (var j = 0; j < Storys[i].next.length; j++) {
			if (!Storys[i].nexted) Storys[i].nexted = [];
			if (Storys[i].nexted.indexOf(Storys[i].next[j]) > -1) continue;
			if (i && document.querySelector(i)) {
				document.querySelector(i + " .next").innerHTML += "<a href='" + Storys[i].next[j] + "'>" + Storys[Storys[i].next[j]].title + "</a><br>";
				Storys[i].nexted.push(Storys[i].next[j]);
			}
		}
		if (result.paging && result.paging.next) FB_Group_Request(result.paging.next);
		else if (result.data.length == 0) Story_Index();
	}
	xhr.onerror = function () { console.log(this) }
	xhr.open("get", url);
	xhr.send();
}
function FB_Group_Request_loader() {
	FB_Group_Request("https://graph.facebook.com/1961795094104661/feed?access_token=EAAEAhFsvEQIBAK6LTYJo1jv0lp5trzauCWyvJArA9jkwzEkIP7R2NsisUAogl7b4eWteLWk3ygt1CYTGhAN7vQRIjOVUDzmCLyyl8SFYb5Cye3QPRLXrV80ZC5DX78sVBa05l7dckDAUoT18eo5ZAZCA6qCqhA0jsUODy1sqgZDZD");
}
function FB_Story_Post() {
	var msg = document.querySelector("#postconfirm textarea").value;
	FB.api('/1961795094104661/feed', 'post', { message: msg }, function (r) {
		if (!r.error) Story_Edit(); else console.log(r);
	})
}
function Story_Style(story, fbpostid) {
	var content = document.createElement("div"),
		section = story.split("\n"),
		section_content = "",
		section_prev = "";
	if (!section[3])return;
	if (section[1].substr(0, 9) != "#trianus_") return;
	for (var i = 3; i < section.length; i++) {
		if (section[i].substr(0, 9) != "#trianus_") section_content += "<p>" + section[i] + "</p>";
		else {
			for (var j = 0; j < section[i].length; j++) {
				if (section[i][j] == " ") {
					section_prev = section[i].split(" ")[0]; break
				} else section_prev = section[i]
			}
			break
		}
	}
	for (var i of "!\"$%&\'()*+,-./:;<=>?@[\\]^{|}~") {
		section[1] = section[1].replace(i, "_");
		section_prev = section_prev.replace(i, "_");
	}
	if (section[0].substr(0, 13) != "#trianus_seed") {
		if (!Storys[section_prev]) Storys[section_prev] = { title: "", content: "", next: [section[1]] }
		else Storys[section_prev].next.unshift(section[1]);
	}
	if (!Storys[section[1]]) Storys[section[1]] = { next: [] };
	Storys[section[1]].title = section[2]
	Storys[section[1]].content = section_content;
	Storys[section[1]].prev = section_prev;
	content.id = section[1].replace("#", "");
	content.className = "story";
	var title = document.createElement("div"), titlecontent = section[2].split(" "), storytitle = titlecontent[0];
	titlecontent.shift();
	title.innerHTML = "<a href='#" + storytitle + "'>" + storytitle + "</a> " + titlecontent.join(" ");
	title.style.fontSize = "20px";
	title.style.fontWeight = "bold";
	var Titleser = StorysTitle.indexOf(storytitle);
	Storys[section[1]].Title = storytitle;
	if (Titleser < 0) {
		StorysTitle.push(storytitle);
		StorysTitleC.push(1);
		var tree = document.createElement("div"), a = document.createElement("a"), c = document.createElement("span");
		tree.style.overflow = "auto";
		tree.style.whiteSpace = "nowrap";
		a.href = "#" + storytitle;
		a.innerHTML = storytitle;
		a.style.fontSize = "20px";
		a.style.fontWeight = "bold";
		c.style.fontSize = "20px";
		c.style.fontWeight = "bold";
		c.innerHTML = "[" + 1 + "]";
		tree.appendChild(a);
		tree.appendChild(c);
		tree.appendChild(document.createElement("br"));
		tree.appendChild(document.createElement("br"));
		document.querySelector("#Forest").appendChild(tree);
	} else {
		StorysTitleC[Titleser]++;
		document.querySelector("#Forest").children[Titleser].children[1].innerHTML = "[" + StorysTitleC[Titleser] + "]"
	}
	content.appendChild(title);
	content.appendChild(document.createElement("hr"));
	var p = document.createElement("div");
	p.style.fontSize = "16px";
	p.innerHTML = section_content;
	content.appendChild(p);
	var m = document.createElement("div");
	m.style.textAlign = "right";
	m.innerHTML = "<div class='next'></div><input type='button' value='培養' onclick='Story_Edit(\"" + section[1] + "\")'/><a href='https://facebook.com/groups/1961795094104661?view=permalink&id=" + fbpostid.split("_")[1] + "' target='_new'><input type='button' value='吹拂'/></a>";
	content.appendChild(m);
	document.body.insertBefore(content, document.body.children[5]);
}
function Story_Search(q, t) {
	if (typeof q == "undefined") {
		if (document.querySelector("#Search input[type=text]").value) {
			q = document.querySelector("#Search input[type=text]").value;
		} else q = "";
	} else document.querySelector("#Search input[type=text]").value = q;
	q = q.split(" ");
	for (var i in Storys) {
		var display = "";
		for (var j = 0; j < q.length; j++) {
			var ts = Storys[i].title.search(q[j]) < 0, cs = Storys[i].content.search(q[j]) < 0;
			if (ts && cs || ts && t) { display = "none"; break }
		}
		if (document.querySelector(i)) document.querySelector(i).style.display = display;
	}
	if (q != "") document.querySelector("#nomore").style.display = "";
	else {
		document.querySelector("#nomore").style.display = "none"
		location = "#";
	}
}
function Story_Show() {
	if (location.hash.substr(0, 9) != "#trianus_") {
		if (location.hash.length < 2) return;
		return Story_Search(location.hash.replace("#", ""), 1)
	}
	var section = document.querySelectorAll(".story");
	for (var i = 0; i < section.length; i++) {
		var m = ["nomore", "loading", "Post", "ForestC"]
		if (m.indexOf(section[i].id) > -1) continue;
		section[i].style.display = "none";
	}
	document.querySelector(location.hash).style.display = "";
}
function Story_Edit(id) {
	var Pelem = document.querySelectorAll("#Post input"),
		Pcont = document.querySelector("#Post textarea");
	if (!id) {
		Pelem[0].value = ""; Pelem[0].readOnly = false; Pcont.value = ""; Pelem[2].value = "";
		Pelem[1].value = 1; EditQ = ""; document.querySelector("#postconfirm input[type=button]").value = "播種";
		document.querySelector("#message").style.display = "none"; Story_Send_Cancel();
		Cookies.del("StoryTitle"); Cookies.del("Storytitle");
		Cookies.del("StoryCount"); Cookies.del("StoryContent"); return
	}
	var title = Storys[id].title.split(" ");
	Pelem[0].value = title[0];
	Pelem[0].readOnly = true;
	Pelem[1].value = title[1] * 1 + 1;
	document.querySelector("#postconfirm input[type=button]").value = "培養";
	EditQ = id; location = id;
	document.body.scrollTop = document.querySelector("#Post").offsetTop - 10;
}
function Story_Post() {
	document.querySelector("#postconfirm").style.display = "";
	document.querySelector("#cover").style.display = "";
}
function Story_Send() {
	var Pelem = document.querySelectorAll("#Post input"),
		story = "", Pcont = document.querySelector("#Post textarea");
	if (Pcont.value == 0 || Pelem[2].value == 0) return;
	if (Pelem[1].value == 1) story += "#trianus_seed\n";
	else story += "#trianus_grow\n";
	story += "#trianus_" + Pelem[0].value.replace(/ /g, "_") + "_" + Pelem[1].value + "_" + Pelem[2].value.replace(/ /g, "_") + "\n";
	story += Pelem[0].value + " " + Pelem[1].value + " " + Pelem[2].value + "\n";
	story += Pcont.value + "\n";
	if (EditQ) story += EditQ;
	document.querySelector("#postconfirm textarea").value = story;
	if (!FB.getUserID()) {
		FB.login(function () {
			Story_Post()
		}, { scope: 'publish_actions,user_managed_groups' });
	} else Story_Post();
}
function Story_Send_Cancel() {
	document.querySelector("#postconfirm").style.display = "none";
	document.querySelector("#cover").style.display = "none";
}
function Story_Save() {
	var Pelem = document.querySelectorAll("#Post input");
	Cookies.set("StoryTitle", Pelem[0].value, 30);
	Cookies.set("StoryCount", Pelem[1].value, 30);
	Cookies.set("Storytitle", Pelem[2].value, 30);
	Cookies.set("StoryContent", document.querySelector("#Post textarea").value, 30)
}
function Story_Get() {
	if (!Cookies.get("StoryContent")) return;
	var Pelem = document.querySelectorAll("#Post input");
	Pelem[0].value = Cookies.get("StoryTitle");
	Pelem[1].value = Cookies.get("StoryCount");
	Pelem[2].value = Cookies.get("Storytitle");
	document.querySelector("#Post textarea").value = Cookies.get("StoryContent");
}
function Story_Index() {
	var sq = [], aq = [], tq = [], mq = [];
	for (var i in Storys) sq.push(i); sq.sort();
	for (var i = 0; i < StorysTitle.length; i++) { aq.push([]); tq.push([]); mq.push([]) }
	for (var i of sq) {
		var ser = StorysTitle.indexOf(Storys[i].Title);
		if (Storys[i].prev) {
			var psr = aq[ser].indexOf(Storys[i].prev), count = i.split("_")[2];
			aq[ser].splice(psr + 1, 0, i);
			tq[ser].splice(psr + 1, 0, Storys[i].title);
			mq[ser].splice(psr + 1, 0, count * 20);
		} else if (ser > -1) {
			aq[ser].push(i);
			tq[ser].push(Storys[i].title);
			mq[ser].push(20);
		}
	}
	for (var i = 0; i < aq.length; i++) {
		for (var j = 0; j < aq[i].length; j++) {
			var a = document.createElement("a");
			a.id = aq[i][j].replace("#", "_");
			a.href = aq[i][j];
			if (mq[i][j]) a.style.marginLeft = mq[i][j] + "px"
			var tqs = tq[i][j].split(" ");
			if (!tqs[2]) tqs[2] = "";
			a.innerHTML = tqs[1] + " " + tqs[2];
			document.querySelector("#Forest").children[i].appendChild(a);
			document.querySelector("#Forest").children[i].appendChild(document.createElement("br"));
		}
		document.querySelector("#Forest").children[i].appendChild(document.createElement("br"));
	}
}
window.onhashchange = Story_Show;
window.fbAsyncInit = function () {
	FB.init({
		appId: '282043442204930',
		xfbml: true,
		version: 'v2.9'
	});
	FB.AppEvents.logPageView();
};
(function (d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) { return; }
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
FB_Group_Request_loader();
