class canvas{
	static loading(){
		let parent = document.getElementById('board');
		parent.innerHTML = "";
		parent = document.getElementById('board');
		let canv = document.createElement('canvas');
		canv.id = 'loading';
		canv.width=1000;
		canv.height=1000;
		canv.className = "load";
		canv.style="margin:auto;height:30vw;"
		parent.appendChild(canv);
		load = new loading(0.01,50,200);
	}
	static unloading(){
		let parent = document.getElementById('board');
		var oldcanv = document.getElementById('loading');
		parent.removeChild(oldcanv);
		load=null;
	}
}
class loading{
	constructor(speed,markWidth,markLength){
		this.markLength=markLength;
		this.markWidth=markWidth;
		this.speed=speed;
		this.rotation=0;
		this.base = document.getElementById("loading");    
		this.gc = this.base.getContext("2d");
		this.center = {
			x:this.base.width/2,
			y:this.base.height/2 };
		this.length = Math.min(
			this.center.x,
			this.center.y)*0.9;	
		setInterval(this.show.bind(this),10);
	}
	show(){
		let gc = this.gc;

		this.base.width = this.base.width;
		gc.lineWidth = this.markWidth;
		
		this.gc.translate(this.center.x,this.center.y);
		this.gc.textBaseline = "middle"; 

		this.inner_text(gc);
		this.spin(gc);
	}
	inner_text(gc){
		gc.font = '100px serif';
		gc.textAlign = 'center';
		gc.fillStyle = 'orange'; 
		gc.fillText('Searching',0,0);
	}
	spin(gc){
		gc.lineCap = 'round';
		gc.strokeStyle = 'gray'; 
		let len = this.length-this.markLength;
		for(let mark = 1; mark <= 10; mark++) {
			let angle = mark*Math.PI/5 - Math.PI/2+this.rotation;
			gc.save();
			gc.rotate(angle);
			gc.moveTo(this.length,0);
			gc.lineTo(len,0);
			gc.stroke();
			gc.restore();
		}	
		this.rotation+=this.speed;
	}
}