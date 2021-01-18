let canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d")

// set width and hieght
canvas.width = window.innerWidth - 4
canvas.height = window.innerHeight - 4
let h = canvas.offsetHeight
let w = canvas.offsetWidth


// setting 
let objectNumber = 300
let minRadius = 14
let maxRadius = 15
let minSpeed = -3
let maxSpeed = 3
let eventArea = 100


// responsive canvas
window.onresize = function() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    h = canvas.offsetHeight
    w = canvas.offsetWidth
    init()
}

//  mouse events
let mouse = {
    x: undefined,
    y:undefined
}
canvas.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
})


// object 
class Circle {
    constructor(x,y,dx,dy,radius) {
        this.x = x
        this.y = y
        this.alpha = 0
        this.velocity = {
            x:dx,
            y:dy
        }
        this.radius = radius
        this.color = ranColor()
        this.strokeColor = ranColor()
        this.mass = 1;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0 , Math.PI * 2)
        ctx.globalAlpha = 1
        ctx.strokeStyle = this.strokeColor
        ctx.stroke()
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.alpha
        ctx.fill()
    }

    move(particles) {

        this.x += this.velocity.x
        this.y += this.velocity.y

        if(this.x + this.radius > w || this.x - this.radius < 0) {
            this.velocity.x = -this.velocity.x
        }
        if(this.y + this.radius + this.velocity.y >= h || this.y - this.radius  <= 0) {
            this.velocity.y = -this.velocity.y
        }
        for (let i = 0; i < particles.length; i++) {
            if(this == particles[i]) continue;
            
            
            if(getDistance(this.x, this.y, particles[i].x, particles[i].y)
                <= this.radius + particles[i].radius + 1) {
                    resolveCollision(this,particles[i])
                }
            
        }
        this.draw()
    }
}


//helping functions
function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;
    
    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

function getDistance(x1,y1,x2,y2) {
    let xDist = x2 -x1
    let yDist = y2 - y1
    return Math.sqrt(Math.pow(xDist,2) + Math.pow(yDist,2))
}

//helping functions

function ran(from, to, isInt=true,rounded=false) {
    let factor = 0
    if(!isInt) {
        factor = 0.5
    }
    
    let x = (Math.random() - factor)  * to
    while(x < from) {
        x = (Math.random() - factor) * to
    }

    if(rounded) {
        return Math.floor(x)
    }
    return x
}

function ranColor() {
    return `rgba(${ran(0, 255)}, ${ran(0,255)}, ${ran(0,255)}, 1)`
}

let objectArr = []

function init() {
    objectArr = []
    for(let i = 0; i < objectNumber; i++) {
        
        let radius = ran(minRadius, maxRadius)
        let x = ran(radius, w - radius)
        let y =  ran(radius, h - radius)
        
        if(i != 0) {
            for (let j = 0; j < objectArr.length; j++) {
            while(getDistance(x, y, objectArr[j].x, objectArr[j].y) <= radius + objectArr[j].radius) {
                radius = ran(minRadius, maxRadius)
                x = ran(radius, w - radius)
                y =  ran(radius, h - radius)
            }
        }
    }

        objectArr.push(new Circle(x,y,ran(minSpeed, maxSpeed,false), ran(minSpeed, maxSpeed,false), radius))
    }
}

function update() {
    requestAnimationFrame(update)
    ctx.clearRect(0,0,w,h)

   for (let ob of objectArr) {
        ob.move(objectArr)
        if(getDistance(mouse.x, mouse.y, ob.x,ob.y) < eventArea) {
            ob.alpha += 0.02
        } else {
            ob.alpha = 0
        }
       
    }
}


update()
init()