var groupsId = ["1961795094104661", "1511206835567537"],
    Triformat = "#trianus_",
    Libary = {
        user: {

        },
        total: {
            typeCount: {}
        },
        loaded: {
            story: 0,
            flow: 0
        },
        types: ["開端", "接續", "前篇", "視角", "接龍", "活動", "單篇", ["接續", "續上"]]
    }
function notMobile() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)
}
function DataRequest(url, callback, parameter) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () { callback(JSON.parse(this.response), parameter) };
    xhr.onerror = function () { DataRequest(url, callback, parameter) };
    xhr.open("get", url);
    xhr.send();
}
function HideScrollbar() {
    var nowSize = $(".scrollcontent")[0],
        newSize = "calc(100% + " + (nowSize.offsetWidth - nowSize.scrollWidth + 1) + "px)";
    if (notMobile()) $(".scrollcontent").css("width", newSize).css("height", newSize);
}
function FB_Data_Request(id, content, requestfield, callback, parameter) {
    var url = "https://graph.facebook.com/";
    url += id;
    url += "/" + content;
    url += "?fields=" + requestfield;
    url += "&access_token=EAAEAhFsvEQIBAK6LTYJo1jv0lp5trzauCWyvJArA9jkwzEkIP7R2NsisUAogl7b4eWteLWk3ygt1CYTGhAN7vQRIjOVUDzmCLyyl8SFYb5Cye3QPRLXrV80ZC5DX78sVBa05l7dckDAUoT18eo5ZAZCA6qCqhA0jsUODy1sqgZDZD";
    DataRequest(url, callback, parameter)
}
function Load_Posts() {
    if (groupsId.length == 0) {
        Libary.loaded.story = 1; console.log("posts loaded.");
        if (!Libary.loaded.flow) console.log("flow loaded.");
        return;
    }
    var groupId = groupsId.shift(),
        proc = function (res) {
            for (var i = 0; i < res.data.length; i++) {
                var data = res.data[i];
                if (!data.message) continue;
                var start = data.message.search(Triformat);
                if (start < 0) continue;
                Proc_Data(data, start);
            }
            if (!res.paging || !res.paging.next) Load_Posts();
            else DataRequest(res.paging.next, proc);
        }
    FB_Data_Request(groupId, "feed", "message,full_picture,from", proc);
}
function Proc_Data(data, start) {
    if (!data.from) return;
    if (!Libary.user[data.from.id]) {
        Libary.user[data.from.id] = {
            pictureUrl: "https://graph.facebook.com/" + data.from.id + "/picture",
            name: data.from.name,
            typeCount: {}
        };
    }
    var content = data.message.substr(start, data.message.length - start).replace(/\n\n/g, "\n"),
        type = (function (type) {
            var newtypes = Libary.types,
                oldtypes = [
                    ["seed"], ["grow", "leaf", "dews"], ["soil"],
                    ["muck", "root", "bole", "vein", "mist"],
                    ["flow"], ["lake", "pond"], ["sand"]
                ];
            type = type.replace(/ /g, "");
            type = type.replace(Triformat, "");
            for (var i = 0; i < oldtypes.length; i++)if (oldtypes[i].indexOf(type) > -1) return newtypes[i];
            if (newtypes.indexOf(type) == -1) return;
            return type;
        })(content.split("\n")[0]);
    if (type == -1 || content.split("\n")[1].replace(/ /g, "").search(Triformat) != 0) return;
    if (!Libary.user[data.from.id].typeCount[type]) Libary.user[data.from.id].typeCount[type] = 0;
    Libary.user[data.from.id].typeCount[type]++;
    if (!Libary.total.typeCount[type]) Libary.total.typeCount[type] = 0;
    Libary.total.typeCount[type]++;
    if (type == "接龍") Proc_Flow(data.id);
    CreateCountList(data.from.id);
}
function CreateCountList(id) {
    var tr = document.getElementById("u" + id), types = Libary.types,
        maint = $("tr th span, tr:nth-child(2) td span");
    if (!tr) {
        tr = document.createElement("tr");
        for (var i = 0; i < 11; i++) {
            var td = document.createElement("td");
            td.className = "t" + i;
            td.vAlign = "center";
            td.align = "center";
            if (i == 0) {
                var img = document.createElement("img");
                img.src = Libary.user[id].pictureUrl;
                img.style.width = "30px"
                td.appendChild(img);
            } else if (i == 1) {
                td.innerHTML = Libary.user[id].name;
            }
            tr.appendChild(td);
        }
        tr.id = "u" + id;
        $("#countbox table").append(tr);
    }
    for (var i = 0; i < types.length; i++) {
        if (types[i] instanceof Array) {
            for (var j = 0; j < types[i].length; j++) {
                if (!Libary.user[id].typeCount["留言"]) {
                    tr.childNodes[j + 9].innerHTML = count; continue
                }
                var count = Libary.user[id].typeCount["留言"][types[i][j]];
                if (!count) count = 0;
                tr.childNodes[j + 9].innerHTML = count;
                if (!Libary.total.typeCount["留言"]) continue;
                maint[j + 8].innerHTML = "[" + Libary.total.typeCount["留言"][types[i][j]] + "]"
            }
            if (Libary.total.typeCount["留言"]) {
                var mcount = Libary.total.typeCount["留言"]["接續"] + Libary.total.typeCount["留言"]["續上"];
                maint[7].innerHTML = "[" + mcount + "]";
            }
        } else {
            var count = Libary.user[id].typeCount[types[i]], mcount = Libary.total.typeCount[types[i]];
            if (!count) count = 0;
            if (!mcount) mcount = 0;
            tr.childNodes[i + 2].innerHTML = count;
            maint[i].innerHTML = "[" + mcount + "]";
        }
    }
}
function Proc_Flow(id) {
    var proc = function (res) {
        for (var i = 0; i < res.data.length; i++) {
            var data = res.data[i], content = data.message, type = "";
            if (content.search("#flow") == 0 || content.search("#接續") == 0) type = "接續";
            if (content.search("#join") == 0 || content.search("#續上") == 0) type = "續上";
            if (!data.from || !type) continue;
            if (!Libary.user[data.from.id]) {
                Libary.user[data.from.id] = {
                    pictureUrl: "https://graph.facebook.com/" + data.from.id + "/picture",
                    name: data.from.name,
                    typeCount: {}
                };
            }
            if (!Libary.user[data.from.id].typeCount["留言"]) Libary.user[data.from.id].typeCount["留言"] = {};
            if (!Libary.user[data.from.id].typeCount["留言"][type]) Libary.user[data.from.id].typeCount["留言"][type] = 0;
            Libary.user[data.from.id].typeCount["留言"][type]++;
            if (!Libary.total.typeCount["留言"]) Libary.total.typeCount["留言"] = {};
            if (!Libary.total.typeCount["留言"][type]) Libary.total.typeCount["留言"][type] = 0;
            Libary.total.typeCount["留言"][type]++;
            CreateCountList(data.from.id);
        }
        if (res.paging && res.paging.next) DataRequest(res.paging.next, proc);
        else Libary.loaded.flow++;
    }
    FB_Data_Request(id, "comments", "message,from", proc); Libary.loaded.flow--;
}
document.body.onload = function () {
    HideScrollbar();
    Load_Posts();
}
document.body.onresize = HideScrollbar;
document.body.oncontextmenu = function (e) { e.preventDefault(); };