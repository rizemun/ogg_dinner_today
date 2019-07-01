const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Soup = imports.gi.Soup;
const Clutter = imports.gi.Clutter;
const GdkPixbuf = imports.gi.GdkPixbuf;
const _httpSession = new Soup.SessionAsync();
const Cogl = imports.gi.Cogl;

const DESKLET_ROOT = imports.ui.deskletManager.deskletMeta["oggetto-dinner@amarkin"].path;

function HelloDesklet(metadata, desklet_id) {
    this._init(metadata, desklet_id);
}

function getImageAtScale(imageFileName, width, height) {
	let pixBuf = GdkPixbuf.Pixbuf.new_from_file_at_size(imageFileName, width, height);
	let image = new Clutter.Image();
	image.set_data(
		pixBuf.get_pixels(),
		pixBuf.get_has_alpha() ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGBA_888,
		width, height,
		pixBuf.get_rowstride()
	);

	let actor = new Clutter.Actor({width: width, height: height});
	actor.set_content(image);

	return actor;
}

HelloDesklet.prototype = {
    __proto__: Desklet.Desklet.prototype,

    _init: function(metadata, desklet_id) {
        Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

        this.setupUI();
    },

    setupUI: function() {
        this.window = new St.Bin();
        this.window__container = new St.Group();
        this.text = new St.Label();

        this.text.set_text('Загрузка');
        this.window.style = "padding: 10px";

        let url = 'https://script.google.com/macros/s/AKfycbzTA5bGMR-UpMI0Yw4h5K_D4U5cK8tBz2nnD25YbqTwX0q96566/exec';
        let here = this;
        let message = Soup.Message.new('GET', url);
        let response = {};
        _httpSession.queue_message(message, function (session, message) {
          if( message.status_code == 200) {
            response = JSON.parse(message.response_body.data.toString());

            here.text.set_text('Сегодня на обед:\n\n'+response[0]+'\n'+response[1]+'\n'+response[2]);
            here.text.style = 'min-width: 200px';

			here.logo.set_position((here.text.get_width()-40),0);


          } else {
            this.text.set_text('Connection error =(');
          }
        });

		let logoPath = DESKLET_ROOT + '/ogg_logo.png';
		this.logo = getImageAtScale(logoPath, 40, 40);

		this.logo.style = 'width: 40px; height: 40px;';
		this.logo.set_position((this.text.get_width()-40),20);
        

        this.window__container.add_actor(this.logo);
        this.window__container.add_actor(this.text);
        this.window.add_actor(this.window__container);

        this.setContent(this.window);
    }
}


function main(metadata, desklet_id) {
    return new HelloDesklet(metadata, desklet_id);
}
