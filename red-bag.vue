<!-- 活动红包 -->
<template>
	<view class="red-bag">

	</view>
</template>

<script>
	import runParticleCanvas from './money_rain.js'
	export default {
		props: {
			// 金额
			money: {
				type: [Number, String],
				default: '8.88',
				required: true
			},

			// 配置
			options: {
				type: Object,
				default: () => {}
			}
		},

		data() {
			return {
				bagAnimation: {}, // 固定小红包动画
				rbagmodelshow: false, // 红包封面
				openrbagmodelshow: false, // 拆封红包
				openbrnanimation: {}, // 拆封动画
				digitalData: [], // 滚动数字数据
			}
		},


		onLoad() {
			setTimeout(() => {
				this.setImageAnimation()
			}, 2000);
		},

		methods: {
			stopMoneyDown(){	// 停止掉钱
				if (this.stopAnimation) {
				  this.stopAnimation();
				  this.stopAnimation = null;
				}
				
				// 移除canvas元素
				const canvasDiv = document.getElementById('cashvas');
				if (canvasDiv && canvasDiv.parentNode) {
				  canvasDiv.parentNode.removeChild(canvasDiv);
				}				
				const wrapper = document.getElementById('cashvasWrapper');				
				if (wrapper) {
					wrapper.remove(); // cleanly removes the wrapper and canvas
				}
			},
			moneydown(){			// 掉钱		
				const div = document.createElement('div')
				const canvas = document.createElement('canvas');
				div.id = 'cashvasWrapper'
				div.style.width = '100%';
				div.style.height = '100%';
				div.style.justifyContent = 'center';
				div.style.alignItems = 'center';
				div.style.display = 'flex';
				div.style.position = 'fixed';
				div.style.top = '0';
				div.style.left = '0';
				div.style.pointerEvents = 'none';
				div.style.zIndex = '50';
				
				canvas.id = 'cashvas';
				canvas.style.width = '100%';
				canvas.style.height = '100%';
				// canvas.width = canvas.style.width;
				// canvas.height = canvas.style.height;
				// canvas.style.boxSizing = 'border-box';
				
				// canvas.style.background = 'red';
				// canvas.style.display = 'none'; // hidden
				
				div.appendChild(canvas)
				document.body.appendChild(div); // or a specific parent element
				
				// AFTER adding to DOM, get rendered size and set internal resolution
				this.$nextTick(() => {
					canvas.width = canvas.offsetWidth;
					canvas.height = canvas.offsetHeight;
					// runParticleCanvas(canvas); // now the resolution matches the visual size
					
					
					// 确保canvas存在
					// const canvas = this.$refs.cashvas;
					// if (!canvas) return;
					
					// 如果已有动画运行，先停止
					if (this.stopAnimation) {
					  this.stopAnimation();
					}
					
					// 启动新动画
					this.stopAnimation = runParticleCanvas(canvas);
					
				});
			},
			// 侧边红包 => 动画
			setImageAnimation() {
				let next = true
				const animation = uni.createAnimation({
					duration: 1000,
					timingFunction: 'ease'
				})
				this.bagAnimation = animation
				setInterval(() => {
					const rotate = next ? 36 : 6
					animation.rotate(rotate).step()
					next = !next
					this.bagAnimation = animation.export()
				}, 1000)
			},
			open(){
				this.rbagmodelshow = true;
				this.stopMoneyDown();
				this.moneydown();
			},
			// 红包封面 => 開红包按钮
			openBtn() {
				this.stopMoneyDown();
				this.$emit('onOpen1')
				
			},




			openBtn1(){
				var animation = uni.createAnimation({
					duration: 1000,
					timingFunction: 'ease'
				})
				this.openbrnanimation = animation
				animation.rotateY(360).step()
				this.openbrnanimation = animation.export()
				setTimeout(() => {
					this.rbagmodelshow = false
					this.openrbagmodelshow = true
					this.moneydown()	// 掉钱
					this.openbrnanimation = {}
					this.setMoney()
					this.$emit('onCover') // 打开封面后回调
				}, 1000)
				
				this.$emit('onOpen') // 确认后回调
			},
			// 确认红包
			onConfirm() {
				this.stopMoneyDown()	// 停止掉钱
				this.openrbagmodelshow = false
				this.$emit('onConfirm') // 确认后回调
			},

			// 隐藏红包
			onClose() {
				this.stopMoneyDown()	// 停止掉钱
				this.rbagmodelshow = false
				this.openrbagmodelshow = false
				this.$emit('onClose') // 关闭后回调
			},

			// 设置金额
			setMoney() {
				const digitalArr = String(this.money).split('')
				const dataList = []
				digitalArr.forEach((num) => {
					const obj = {
						num: isNaN(num) ? num : Number(num),
						style: ''
					}
					dataList.push(obj)
				})
				this.digitalData = dataList
				this.setScrollNum()
			},


		}
	}
</script>
