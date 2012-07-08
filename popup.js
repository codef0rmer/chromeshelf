DB = function() {
	this.init();
	return this;
};

DB.prototype = {
    ebooks: [],
    index: 0,

    init: function() {
        this.load();
    },

    create: function(ebook) {
        if (ebook == null) throw new TypeError('Missing ebook parameter');

        ebook.id = this.index++;

        this.ebooks.push(ebook);
        this.save();
    },

    remove: function(ebook) {
        if (ebook == null) throw new TypeError('Missing ebook parameter');
        if (ebook.id == null) throw new TypeError('Missing ebook.id property');
        var self = this;

        this.ebooks.forEach(function(t, i) {
            if (t.id == ebook.id) self.ebooks.splice(i, 1);
        });

        this.save();
    },

    load: function() {
        this.ebooks = (localStorage.ebooks ? JSON.parse(localStorage.ebooks) : []);
        this.index = localStorage.index ? localStorage.index : 0;
    },

    save: function() {
        localStorage.ebooks = this.ebooks ? JSON.stringify(this.ebooks) : null;
        localStorage.index = this.index;
    }
};

Chromeshelf = function() { return this; }
Chromeshelf.prototype = {
    textbox: null,

    init: function() {
        this.textbox = document.getElementById('add');
        this.renderView();
    },

    newEbook: function(e) {
        if (e != null && e.which == 13 && this.textbox.value != "") { // enter key
            var url = this.textbox.value;
            var filename = url.substring(url.lastIndexOf('/')+1);
            db.create({
                url: url,
                filename: filename,
                created: new Date()
            });
            this.textbox.value = '';
            chromeshelf.renderView();
        }
    },

    removeEbook: function(id) {
        db.remove({ id: id });
        chromeshelf.renderView();
        return;
    },

    renderView: function() {
        $('div#results').html('');
        $.each(JSON.parse(localStorage.ebooks), function(i){
            var filename = $.URLDecode(this.filename);
            var url = this.url;
            var id = this.id;
            url = url.indexOf('file://') ==  0 ? url : 'file://'+url;
            $('div#results').append(
                "<div class='item' id="+id+"><a style='cursor:pointer;' target='_blank' class='title' title='"+filename+"'>"+filename.substr(0, 50)+"</a><button class='remove' title='Remove ebook'>Remove</button></div>"
            ).find('div.item:last > a').click(function () {
                chrome.tabs.create({url: url});
            }).next().click(function () {
                chromeshelf.removeEbook(id)
            });
        });
    },
};
var db = new DB();
var chromeshelf = new Chromeshelf();

window.onload = function() { 
    chromeshelf.init();
};

document.addEventListener('DOMContentLoaded', function () {
    $('#add').keyup(function () {
        chromeshelf.newEbook(event);
    });
});
