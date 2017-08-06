var FB_Fetch_Groups_Id = ["1961795094104661", "1511206835567537", "1944882305791570"],
    Triformat = "#trianus_",
    Libary = {
        all: [],
        ref: [],
        sortBy: {
            series: { ref: [], all: [], type: [] },
            relate: { ref: [], all: [] }
        }
    }
function notMobile() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)
}
function DataRequest(url, callback, parameter) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () { callback(JSON.parse(this.response), url, parameter) };
    xhr.onerror = function () { DataRequest(url, callback, parameter) };
    xhr.open("get", url);
    xhr.send();
}
function HideScrollbar() {
    var nowSize = $(".scrollcontent")[0],
        newSize = "calc(100% + " + (nowSize.offsetWidth - nowSize.scrollWidth + 1) + "px)";
    if (notMobile()) $(".scrollcontent").css("width", newSize).css("height", newSize);
}
function ListSwitch() {
    var list = document.getElementById("list"),
        list_is_Show = list.style.left != "",
        listHide = function () {
            var hidelist = document.getElementById("hidelist");
            list.style.left = "";
            if (hidelist) hidelist.id = "showlist";
        },
        listShow = function () {
            var showlist = document.getElementById("showlist");
            list.style.left = "0px";
            if (showlist) showlist.id = "hidelist";
        };
    if (list_is_Show) listHide();
    else if (this.id.search("list") > -1) listShow();
}
function FB_Data_Request(id, content, requestfield, callback, parameter) {
    var url = "https://graph.facebook.com/";
    url += id;
    url += "/" + content;
    url += "?fields=" + requestfield;
    url += "&access_token=EAAEAhFsvEQIBAK6LTYJo1jv0lp5trzauCWyvJArA9jkwzEkIP7R2NsisUAogl7b4eWteLWk3ygt1CYTGhAN7vQRIjOVUDzmCLyyl8SFYb5Cye3QPRLXrV80ZC5DX78sVBa05l7dckDAUoT18eo5ZAZCA6qCqhA0jsUODy1sqgZDZD";
    DataRequest(url, callback, parameter)
}
function Load_Posts_By_Group_Id() {
    if (FB_Fetch_Groups_Id.length == 0) {
        $(".storycard.loading").css("display", "none"); return;
    }
    var FB_Fetch_Group_Id = FB_Fetch_Groups_Id.shift(),
        proc = function (res) {
            for (var i = 0; i < res.data.length; i++) {
                if (!res.data[i].message) continue;
                var start = res.data[i].message.search(Triformat);
                if (start < 0) continue;
                Proc_to_Story(res.data[i], start);
            }
            if (!res.paging || !res.paging.next) Load_Posts_By_Group_Id();
            else DataRequest(res.paging.next, proc);
        }
    FB_Data_Request(FB_Fetch_Group_Id, "feed", "message,full_picture", proc);
}
function Story_FlowType(index) {
    var Story = Libary.all[index],
        proc = function (res, url, parameter) {
            var p = parameter;
            for (var i = 0; i < res.data.length; i++) {
                var content = res.data[i].message;
                if (content.search("#flow ") == 0 || content.search("#接續 ") == 0) {
                    if (i != 0 && !p.first) {
                        Libary.all[p.index].article += "</p>";
                        $("#story" + p.index + " .article")[0].innerHTML = Libary.all[p.index].article;
                    }
                    Libary.all[p.index].article += "<p>" + content.replace("#flow ", "").replace("#接續 ", "").replace(/</g, "&lt").replace(/>/g, "&gt");
                } else if (content.search("#join ") == 0 || content.search("#續上 ") == 0) {
                    if (i == 0 && p.first) Libary.all[p.index].article += "<p>";
                    Libary.all[p.index].article += content.replace("#join ", "").replace("#續上 ", "").replace(/</g, "&lt").replace(/>/g, "&gt");
                }
            }
            if (p.first) p.first = false;
            if (res.paging && res.paging.next) DataRequest(res.paging.next, proc, p);
            else {
                Libary.all[p.index].article += "</p>";
                $("#story" + p.index + " .article")[0].innerHTML = Libary.all[p.index].article;
            }
        };
    FB_Data_Request(Story.postId, "comments", "message", proc, { index: index, first: true });
}
function Proc_to_Story(data, fetch_start) {
    var post_content = data.message.substr(fetch_start, data.message.length - fetch_start).replace(/\n\n/g, "\n"),
        batch_content = post_content.split("\n"), index = Libary.all.length, ids = data.id.split("_"),
        Story = {
            groupId: ids[0],
            postId: ids[1],
            type: "",
            id: "",
            series: "",
            title: "",
            article: "",
            relate: "",
            imageUrl: "",
            soundUrl: ""
        },
        type_check = function (type) {
            var newtype = ["開端", "接續", "前篇", "視角", "接龍", "活動", "單篇"],
                oldtypes = [
                    ["seed"], ["grow", "leaf", "dews"], ["soil"],
                    ["muck", "root", "bole", "vein", "mist"],
                    ["flow"], ["lake", "pond"], ["sand"]
                ];
            type = type.replace(/ /g, "");
            if (type.search(Triformat) != 0) return;
            type = type.replace(Triformat, "");
            for (var i = 0; i < oldtypes.length; i++)
                if (oldtypes[i].indexOf(type) > -1) return newtype[i];
            return type;
        },
        id_check = function (id) {
            id = id.replace(/ /g, "");
            if (id.search(Triformat) != 0) return;
            id = id.replace(Triformat, "").split("(")[0];
            return id;
        },
        Add_to_Libary = function (Story, index) {
            Libary.all.push(Story);
            Libary.ref.push(Story.id);
            for (sortType of ["series", "relate"]) {
                var sortindex = Libary.sortBy[sortType].ref.indexOf(Story[sortType]);
                if (sortindex < 0) {
                    Libary.sortBy[sortType].ref.push(Story[sortType]);
                    Libary.sortBy[sortType].all.push([index]);
                    if (sortType == "series") {
                        var indextype = "tri";
                        switch (Story.type) {
                            case "活動": indextype = "evt"; break;
                            case "接龍": indextype = "flw"; break;
                            case "單篇": indextype = "sng"; break;
                        }
                        Libary.sortBy.series.type.push(indextype);
                    }
                } else Libary.sortBy[sortType].all[sortindex].push(index);
            }
            if (Story.type == "接龍") Story_FlowType(index);
        };
    Story.type = type_check(batch_content[0]);
    Story.id = id_check(batch_content[1]);
    if (!Story.type || !Story.id) return;
    Story.series = batch_content[2].split(" ")[0];
    Story.title = batch_content[2].replace(Story.series + " ", "");
    for (var i = 3; i < batch_content.length; i++) {
        if (batch_content[i].search("youtube.com") > -1) {
            var youtubeIdstart = batch_content[i].search("v=");
            if (youtubeIdstart == -1) continue;
            var youtubeId = batch_content[i].substr(youtubeIdstart, batch_content[i].length - youtubeIdstart).split("&")[0].replace("v=", "");
            Story.soundUrl = "https://youtube.com/embed/" + youtubeId + "?autoplay=0&controls=0";
        } else if (batch_content[i].search(Triformat) < 0) {
            var content = batch_content[i];
            if (content.search("　　") == 0) content = content.replace("　　", "");
            Story.article += "<p>" + content.replace(/</g, "&lt").replace(/>/g, "&gt") + "</p>";
        } else { Story.relate = id_check(batch_content[i]) }
    }
    if (data.full_picture) Story.imageUrl = data.full_picture;
    Add_to_Libary(Story, index);
    CreateStoryCard(Story, index);
    CreateIndexList(Story, index);
}
function StoryCardShow(index) {
    $("#storybox .scrollcontent").animate({ scrollTop: 0 });
    if (this.id) {
        $(".storycard").css("display", "");
        $(".loading").css("display", "none");
        return;
    }
    $(".storycard").css("display", "none");
    $("#story" + index).css("display", "");
}
function CreateIndexList(Story, index) {
    var seriesidx = Libary.sortBy.series.ref.indexOf(Story.series),
        mainListList = document.querySelector("#mindex" + seriesidx + "~ ul"),
        mainList = document.createElement("li"),
        mainListSwitch = document.createElement("input"),
        mainListTitle = document.createElement("label");
    if (!mainListList) {
        mainListList = document.createElement("ul");
        mainList.appendChild(mainListSwitch);
        mainList.appendChild(mainListTitle);
        mainList.appendChild(mainListList);
        mainListSwitch.id = "mindex" + seriesidx;
        mainListSwitch.type = "checkbox";
        mainListTitle.className = "title";
        mainListTitle.innerHTML = Story.series;
        mainListTitle.htmlFor = "mindex" + seriesidx;
        var mainListId = Libary.sortBy.series.type[seriesidx];
        $("#" + mainListId + " ~ ul").append(mainList);
    }
    var List = document.createElement("li"),
        ListSwitch = document.createElement("input"),
        ListTitle = document.createElement("label"),
        ListList = document.createElement("ul");
    List.appendChild(ListSwitch);
    List.appendChild(ListTitle);
    List.appendChild(ListList);
    ListSwitch.id = "index" + index;
    ListSwitch.type = "checkbox";
    ListSwitch.disabled = "disabled";
    ListTitle.className = "title";
    ListTitle.innerHTML = Story.title;
    ListTitle.htmlFor = "index" + index;
    ListTitle.onclick = function () { StoryCardShow(index) };
    if (Story.relate) {
        var relateparentref = Libary.ref.indexOf(Story.relate);
        parentList = document.querySelector("#index" + relateparentref + "~ ul");
        if (parentList) {
            parentList.appendChild(List);
            document.querySelector("#index" + relateparentref).disabled = "";
            var relatelink = document.createElement("a");
            relatelink.setAttribute("data-index", index);
            relatelink.onclick = function () { StoryCardShow(this.getAttribute("data-index")) };
            relatelink.innerHTML = Story.title;
            document.querySelector("#story" + relateparentref + " .relate").appendChild(relatelink);
            document.querySelector("#story" + relateparentref + " .relate").appendChild(document.createElement("br"));
        } else mainListList.appendChild(List);
    } else mainListList.appendChild(List);
    var relatechildref = Libary.sortBy.relate.ref.indexOf(Story.id),
        relatechilds = Libary.sortBy.relate.all[relatechildref];
    if (relatechilds) for (var i = 0; i < relatechilds.length; i++) {
        var childListSwitch = document.querySelector("#index" + relatechilds[i]);
        if (!childListSwitch) continue;
        var relatelink = document.createElement("a");
        relatelink.setAttribute("data-index", relatechilds[i]);
        relatelink.onclick = function () { StoryCardShow(this.getAttribute("data-index")) };
        relatelink.innerHTML = Libary.all[relatechilds[i]].title;
        document.querySelector("#story" + index + " .relate").appendChild(relatelink);
        document.querySelector("#story" + index + " .relate").appendChild(document.createElement("br"));
        document.adoptNode(childListSwitch.parentNode);
        ListList.appendChild(childListSwitch.parentNode);
        ListSwitch.disabled = "";
    }
}
function CreateStoryCard(Story, index) {
    var Card = document.createElement("div"),
        CardTitle = document.createElement("div"),
        CardArticle = document.createElement("div"),
        CardImage = document.createElement("div"),
        CardSound = document.createElement("div"),
        CardRelate = document.createElement("div"),
        CardAction = document.createElement("div"),
        CardComment = document.createElement("input");
    Card.appendChild(CardTitle);
    Card.appendChild(document.createElement("hr"));
    Card.appendChild(CardArticle);
    Card.appendChild(CardImage);
    Card.appendChild(CardSound);
    Card.appendChild(CardRelate);
    Card.appendChild(CardAction);
    CardAction.appendChild(CardComment);
    Card.className = "storycard";
    Card.id = "story" + index;
    CardTitle.className = "title";
    CardTitle.innerHTML = Story.series.replace(/</g, "&lt").replace(/>/g, "&gt") + " " + Story.title.replace(/</g, "&lt").replace(/>/g, "&gt");
    if (Story.series == Story.title) CardTitle.innerHTML = Story.series;
    CardArticle.className = "article";
    CardArticle.innerHTML = Story.article;
    CardAction.align = "right";
    CardImage.align = "center";
    if (Story.imageUrl) {
        var image = document.createElement("img");
        image.src = Story.imageUrl;
        image.style.width = "90%";
        CardImage.style.marginBottom = "10px";
        CardImage.appendChild(image);
    }
    if (Story.soundUrl) {
        var sound = document.createElement("iframe")
        sound.src = Story.soundUrl;
        sound.style.border = "none";
        sound.style.width = "90%";
        sound.style.height = "300px";
        CardSound.style.overflow = "auto";
        CardSound.align = "center";
        CardSound.style.marginBottom = "10px";
        CardSound.appendChild(sound);
    }
    CardRelate.className = "relate";
    CardComment.value = "留言";
    CardComment.type = "button";
    CardComment.onclick = function () {
        window.open("https://facebook.com/" + Story.groupId + "?view=permalink&id=" + Story.postId)
    }
    $(".storycard.loading").before(Card);
}
document.body.onload = function () {
    HideScrollbar();
    Load_Posts_By_Group_Id();
}
document.body.onresize = HideScrollbar;
document.body.oncontextmenu = function (e) { e.preventDefault(); };
document.getElementById("showlist").onclick = ListSwitch;
document.getElementById("storybox").onclick = ListSwitch;
document.getElementById("title").onclick = StoryCardShow;
