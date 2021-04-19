# -p5.js-Presentation_of_Three-body_Problem
【p5.js】三体模型演示
===
TODO:
  1.报告编写ing
  2.加入图片
---
班级：数媒1803班
姓名：杨博文
学号：1191180331

目录
---
* 编写环境
* 文件结构
* 调试说明
* 运行操作
* 效果
* 代码说明

编写环境
---
* VScode
* VScode_Debugger for Chrome
* Chrome

文件结构
---
>根目录
>>addons文件夹
>>>p5.sound.js  
>>>p5.sound.min.js  

>>.vscode文件夹(下载源程序新建导入)  
>>>launch.josn //vscode编译文件  

>>code & index文件夹  
>>>index.html //索引    
>>>sketch.js //三体模型演示绘制(核心代码)    

>>debug.log  
>>p5.easycam.js  
>>p5.js  

调试说明
---
1. 下载 <源-p5.js-PoTbP.rar> 解压。
2. 或者下载 <标识-源程序> 到根目录，新建文件夹“.vscode”，将launch放入。
3. vscode打开根目录。
4. 修改launch.json中的runtimeExecutable，为自己的Chrome安装路径。
5. 检查index.html中script标签src属性，三个文件位置是否正确。
6. 此时可debug。  
----------------------此处插入一张图片

运行操作
---
<操作说明.txt>
<code & index/sketch.js>
以上文件均含操作说明
*	按空格：重置星球状态，每次使得“小黄”位置偏移1(微小扰动)  
每次重置，将保留历史运行最长的轨迹，作为对比
*	SHIFT: 暂停/开始
*	ALT：重置程序（星球状态+轨迹状态）

*	旋转视角：鼠标左键拖动、单指触摸
*	平移视角: 鼠标中键拖动、两指触摸
*	放大缩小: 鼠标右键拖动、两指捏/展开
*	重置视角: 鼠标双击、触摸双击

*	大键盘上方 123: 打开/关闭 星轨 
*	大键盘上方 4：打开关闭 上次轨迹
----------------------此处插入n张gif

效果
---
实验目的：模拟三体模型，每次空格重置将会改变小黄星的微小初始值，与重置前运行轨道对比。发现两个轨道因为初始的差异导致后期巨大的不同。符合复杂系统中的蝴蝶效应。而且很好玩，很好玩，能看三个球球看一天。好耶！
----------------------此处插入n张gif

代码说明
---
<launch.json>和<index.html>的调试代码略过，主要是<sketch.js>的绘制代码。  
<code & index/sketch.js>也是核心代码。
### 代码结构
* 初始值与可调整全局参数  
* 星球类 class star
  * 构造函数 constructor()
  * 重置状态 reset()
  * 绘制该星球 drawStar()
  * 引力控制
    * 与另一星球的距离平方 getDistance2(star)
    * 与另一星球的距离向量 getDirection(star)
    * 受到另一星球的引力 getGravitation(star)
    * 根据当前引力，计算下一帧速度 reVelocity()
    * 根据当前速度，计算下一帧位置 reLocation()
  * 轨迹绘制
    * 轨迹点集性能优化 majorTrail()
    * 当前位置存入轨迹点集 pushTrail()
    * 绘制轨迹 drawTrail()
* 初始化函数 setup()
* 绘制函数 draw()
* 画布大小跟随窗口函数 windowResized()
* 绘制坐标轴函数 drawAxis()
* 键盘输入 keyEvent()+keyReleased()  
