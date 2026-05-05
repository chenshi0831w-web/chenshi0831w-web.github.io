class Frog {
    constructor(owner, imgs) {
        this.owner = owner;
        this.imgs = imgs;
        this.x = owner.x;
        this.y = owner.y;
        this.size = 85;
        this.angle = 0;
        this.state = 'IDLE';
        this.timer = 0;
        this.target = null;
    }

    update(enemies, ts, onKill) {
        // 紧跟玩家
        let tx = this.owner.x - 60;
        let ty = this.owner.y - 60;
        this.x += (tx - this.x) * 0.05;
        this.y += (ty - this.y) * 0.05;

        if (this.state === 'IDLE') {
            let minDist = 300; // 侦测范围
            this.target = null;
            enemies.forEach(en => {
                let d = Math.hypot(en.x - this.x, en.y - this.y);
                if (d < minDist) { minDist = d; this.target = en; }
            });

            if (this.target) {
                this.state = 'ATTACK';
                this.timer = ts;
                this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            }
        } else if (this.state === 'ATTACK') {
            // 攻击动作耗时：50ms（闪击）
            if (ts - this.timer > 50) { 
                if (this.target && enemies.includes(this.target)) {
                    
                    // --- 核心逻辑：区分 Boss 和 普通怪 ---
                    if (this.target.isBoss) {
                        // 【针对蟑螂 Boss】
                        let frogDmg = 10; // 每次舔只扣 10 点血（Boss 总血量是 150）
                        this.target.hp -= frogDmg;
                        
                        // 只有 Boss 血扣完了才移除
                        if (this.target.hp <= 0) {
                            enemies.splice(enemies.indexOf(this.target), 1);
                            onKill(100); // 击杀 Boss 奖励高分
                        }
                    } else {
                        // 【针对普通小怪】
                        // 直接秒杀，移除数组
                        enemies.splice(enemies.indexOf(this.target), 1);
                        onKill(20);
                    }
                }
                this.state = 'EAT';
                this.timer = ts;
            }
        } else if (this.state === 'EAT') {
            // --- 消化冷却时间 ---
            // 如果刚刚打的是 Boss，冷却可以短一点，让它连续攻击
            // 如果吃的是普通怪，保持原本的冷却
            let cooldown = (this.target && this.target.isBoss) ? 150 : 300;
            
            if (ts - this.timer > cooldown) { 
                this.state = 'IDLE';
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI/2);
        let img = this.imgs.fIdle;
        if(this.state === 'ATTACK') img = this.imgs.fAtk;
        if(this.state === 'EAT') img = this.imgs.fEat;
        if(img && img.complete) {
            ctx.drawImage(img, -this.size/2, -this.size/2, this.size, this.size);
        }
        ctx.restore();
    }
}