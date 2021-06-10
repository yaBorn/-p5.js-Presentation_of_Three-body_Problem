/* 混沌-三体模型演示
*	学号：1191180331
*	姓名：杨博文
*	班级：数媒1803
* 	q：1359195435
*	2020.4.18
*/

/* 操作说明：
*	按空格：重置星球状态，每次使得“小黄”位置偏移1(微小扰动)
*			每次重置，将保留历史运行最长的轨迹，作为对比
*	SHIFT: 暂停
*	ALT：重置程序（星球状态+轨迹状态）
*
*	easycam.js
*	旋转视角：鼠标左键拖动、单指触摸
*	平移视角: 鼠标中键拖动、两指触摸
*	放大缩小: 鼠标右键拖动、两指捏/展开
*	重置视角: 鼠标双击、触摸双击
*	https://github.com/freshfork/p5.EasyCam/raw/master/screenshots/EasyCam1.gif
*
*	大键盘上方 123: 打开/关闭 星轨 
*	大键盘上方 4：打开关闭 上次轨迹
*/

//=====================================================可设定参数区
// 三星初始状态：名称，颜色，质量，半径，位置，xyz分速度大小，xyz分引力大小
const init_star1 = {name:'小橙',color:'#ff6347',
						mass:100,radius:5,x:20,y:20,z:20,
						vx:0,vy:0,vz:0,gx:0,gy:0,gz:0};
const init_star2 = {name:'小蓝',color:'#00bfff',
						mass:300,radius:8,x:100,y:80,z:40,
						vx:0,vy:0,vz:0,gx:0,gy:0,gz:0};
const init_star3 = {name:'小黄',color:'#ffff00',
						mass:500,radius:10,x:90,y:40,z:80,
						vx:0,vy:0,vz:0,gx:0,gy:0,gz:0};
// 画布
var windowWidth = 800;
var windowHeight = 800;
// 用于星球类
var tRate = 0.1; // 运行速率
var gRate = 0.6; // 引力常量G
// 用于draw()
var perDraw = 10; // 每per标记一次行星位置
//=====================================================

// 星球
class star {
	maxLength = 100; // 优化星轨最大长度
	// 颜色,质量，半径，位置，xyz分速度大小，xyz分引力大小
	constructor({name,color,mass,radius,x,y,z,vx,vy,vz,gx,gy,gz}){
		this.name = name;
		this.color = color;
		this.mass = mass;
		this.radius = radius;
		this.location = new p5.Vector(x,y,z);
		this.velocity = new p5.Vector(vx,vy,vz);
		this.gravitation = new p5.Vector(gx,gy,gz);
		this.trail = new Array();
	}
	// 重置状态
	reset({name,color,mass,radius,x,y,z,vx,vy,vz,gx,gy,gz}){
		this.name = name;
		this.color = color;
		this.mass = mass;
		this.radius = radius;
		this.location = new p5.Vector(x,y,z);
		this.velocity = new p5.Vector(vx,vy,vz);
		this.gravitation = new p5.Vector(gx,gy,gz);
		this.trail.length = 0;
	}
	//==========星体绘制与计算
	// 绘制该星体
	drawStar(){
		translate(this.location.x,this.location.y,this.location.z);
		fill(this.color);
		stroke(this.color);
		sphere(this.radius);
		translate(-this.location.x,-this.location.y,-this.location.z);
	}
	// 与另一star的距离平方
	getDistance2(star){
		var ans = this.location.copy().sub(star.location);
		return ans.mult(ans);
	}
	// 与另一star的距离方向
	getDirection(star){
		// 引力公式无正负，*位置差/位差绝对值->位置差
		var dis = this.location.copy().sub(star.location);
		dis.x = -1*dis.x/Math.abs(dis.x);
		dis.y = -1*dis.y/Math.abs(dis.y);
		dis.z = -1*dis.z/Math.abs(dis.z);
		return dis;
	}
	// 受到star的引力（除自身质量）
	getGravitation(star){
		// ans = G*M/R^2
		var ans = this.getDistance2(star).div(star.mass*gRate);
		ans.div(this.getDirection(star)); // *方向->带方向的引力
		this.gravitation.add(ans); // 添加进总引力
		//console.log(this.name,'受到',star.name,'引力：',ans);
		return ans;
	}
	// 根据当前帧引力计算 下一帧速度
	reVelocity(){
		var ans = this.velocity.add(this.gravitation.copy().mult(tRate));
		//console.log(this.name,'速度',ans);
		// 清空所受引力，以便下一帧计算
		this.gravitation.x = 0;
		this.gravitation.y = 0;
		this.gravitation.z = 0;
	}
	// 根据当前帧速度计算 下一帧位置
	reLocation(){
		var ans = this.location.add(this.velocity.copy().mult(tRate));
		//console.log(this.name,'位置变更',ans);
	}
	//==========星体绘制与计算
	// trail长度>maxlength,间隔减半,性能优化
	majorTrail(){
		// 导致控制点距离增加，精度下降
		//console.log('遍历',this.trail.length);
		if(this.trail.length>=this.maxLength){
			let len = this.trail.length
			for(let i=0;i<len;i=i+2){
				this.trail[i/2]=this.trail[i];
			}
			this.trail.length = len/2;
			console.log('优化',this.trail.length,this.trail[0]);
		}
	}
	// 位置存入trail
	pushTrail(){
		/* this.trail.push(this.location);
		* 此时会覆盖前面已push的location,变成n+1个相同的newLocation
		* 原因：
		*	在外部的定义的对象，每次this.location的地址相同
		*	而trail保存的是push进去的location的地址，每次push的地址相同
		*	复制一下就行了
		*/
		this.trail.push(this.location.copy());
		//this.majorTrail(); // 性能优化，伴随精度下降，精度难以接受，废代码
	}
	// trail绘制轨迹
	drawTrail(){
		// 但因运行时间增加，点集增加，性能下降
		/* TODO: 改善性能 点集达MAXSIZE 此电脑为75*3 则间隔删除？*/
		noFill();
		stroke(this.color);
		beginShape();
		for(let i=0,len=this.trail.length;i<len;i++){
			curveVertex(this.trail[i].x, this.trail[i].y, this.trail[i].z);
		}
		endShape();
	}

}
var star1 = new star(init_star1);
var star2 = new star(init_star2);
var star3 = new star(init_star3);

// 初始化
function setup() {
	console.log('开始','本次小黄x坐标',star3.location.x);

	// 画布
    createCanvas(windowWidth, windowHeight, WEBGL);
  	// 启用相机
	var myCamera = createEasyCam();
	//myCamera.setCenter([0,100,0]);
	// 取消右键单击上下文菜单
	document.oncontextmenu = function() { return false; }
}

// 绘制-回调
var frame = 0; // 帧计数器
var isStop = -1;
var isDarwTrial1 = -1;
var isDarwTrial2 = -1;
var isDarwTrial3 = 1;
var isDarwTrial4 = 1;
function draw() {
	background(51);
	lights(); // 光照
	drawAxis(); // 绘制轴

	// 绘制星体
	star1.drawStar();
	star2.drawStar();
	star3.drawStar();
	// 根据位置 计算引力
	/* TODO:
	*	此处可优化，计算a->b引力，b->a取反即可
	*/
	if(isStop==-1){
		star1.getGravitation(star2);
		star1.getGravitation(star3);
		star2.getGravitation(star1);
		star2.getGravitation(star3);
		star3.getGravitation(star1);
		star3.getGravitation(star2);
		// 根据引力 计算下一帧速度
		star1.reVelocity();
		star2.reVelocity();
		star3.reVelocity();
		// 根据速度 计算下一帧位置
		star1.reLocation();
		star2.reLocation();
		star3.reLocation();
	}

	/* TODO: 绘制轨迹 OK */
	// 绘制轨迹
	frame = (frame+1)%perDraw;
	//console.log(frame);
	if(frame == 0){ // 每per帧标记
		if(isDarwTrial1 == 1){star1.pushTrail();}
		if(isDarwTrial2 == 1){star2.pushTrail();}
		if(isDarwTrial3 == 1){star3.pushTrail();}
	}
	// 绘制本次轨迹
	if(isDarwTrial1 == 1){star1.drawTrail();}
	if(isDarwTrial2 == 1){star2.drawTrail();}
	if(isDarwTrial3 == 1){star3.drawTrail();}
	// 绘制上次轨迹
	if(isDarwTrial4 == 1){
		noFill();
		stroke('#ff00d4');
		beginShape();
		for(let i=0,len=lastTrail.length;i<len;i++){
			curveVertex(lastTrail[i].x, lastTrail[i].y, lastTrail[i].z);
		}
		endShape();
	}

	// 键盘输入
	keyEvent();
}

// 跟随窗口-回调
function windowResized() { 
    resizeCanvas(windowWidth, windowHeight); 
}

// 绘制坐标轴
function drawAxis() {
	let maxLength = 999999;
	stroke('red');line(0,0,0,0,0,maxLength);
	stroke('blue');line(0,0,0,0,maxLength,0);
	stroke('green');line(0,0,0,maxLength,0,0);
	stroke(100);
}

// 键盘输入
var lastKey = null; // 上次按下按键
var lastTrail = new Array(); // 上次星轨 
var reNUM = 0; // 重置次数计数器
function keyEvent(){
	/* TODO: OK
	*	每次重置，将本次轨迹暂存
	*	绘制，比较两次差异
	*/
	if(keyIsPressed){ // 持续触发
		//console.log('按下',key, ' 键码', keyCode);
		// 空格重置状态
		if(key == ' '){
			if(lastKey!=key){ // 按下仅释放一次
				if(star3.trail.length>=lastTrail.length){ // 保留运行时间最长的
					lastTrail = star3.trail.slice(0); // 保存本次轨迹 深拷贝
					console.log('最长运行轨迹更新');
				}
				//console.log(star3.trail.length,lastTrail.length);
				reNUM++;
			}
			star1.reset(init_star1);
			star2.reset(init_star2);
			star3.reset(init_star3);
			star3.location.x = star3.location.x+reNUM; // 微小的扰动,每次重置+1
			console.log('重置状态','本次小黄x坐标',star3.location.x);
		}
		//SHIFT 暂停
		if(key=='Shift' && lastKey!=key){
			isStop = -1*isStop;
		}
		//ALT 全部重置
		if(key=='Alt'){
			reNUM=0;
			lastTrail = new Array();
			star1.reset(init_star1);
			star2.reset(init_star2);
			star3.reset(init_star3);
			console.log('重置程序','本次小黄x坐标',star3.location.x);
		}
		// 大键盘123 打开关闭星轨绘制
		// 按下释放一次&&lastKey!=key
		if(key=='1' && lastKey!=key){
			console.log(star1.name,'切换星轨状态',isDarwTrial1);
			isDarwTrial1=-1*isDarwTrial1;
		}		
		if(key=='2' && lastKey!=key){
			console.log(star2.name,'切换星轨状态');
			isDarwTrial2=-1*isDarwTrial2;
		}		
		if(key=='3' && lastKey!=key){
			console.log(star3.name,'切换星轨状态');
			isDarwTrial3=-1*isDarwTrial3;
		}
		if(key=='4' && lastKey!=key){
			console.log('切换是否历史轨迹');
			isDarwTrial4=-1*isDarwTrial4;
		}
		lastKey = key;
	}
}
function keyReleased() {
	lastKey = null; // 升起按键重置lastkey
}

