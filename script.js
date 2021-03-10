const LEVA_STRELICA = 37;
const DESNA_STRELICA = 39;
const SPACE = 32;

const IGRA_SIRINA = 800;
const IGRA_VISINA = 600;

const IGRAC_SIRINA = 40;
const IGRAC_MAX_BRZINA = 500;

const LASER_MAX_BRZINA = 300;
const LASER_COOLDOWN = 0.5;

const NEPRIJATELJI_PO_REDU = 10;
const NEPRIJATELJ_HORIZONTAL_PADDING = 80;
const NEPRIJATELJ_VERTICAL_PADDING = 70;
const NEPRIJATELJ_VERTICAL_SPACING = 80;
const NEPRIJATELJ_COOLDOWN = 10;

var poeni=0;


const STANJE_IGRE = {
    vreme: Date.now(),
    levaStr: false,
    desnaStr: false,
    spacePr: false,
    igracX: 0,
    igracY: 0,
    igracCooldown: 0,
    laseri: [],
    neprijatelji: [],
    neprijateljLaseri: [],
    krajIgre: false
};


function presecanje(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

function pozicija(el, x, y) {
  el.style.transform = `translate(${x}px, ${y}px)`;
}

function granica(v, min, max) {
    if (v < min) {
      return min;
    } else if (v > max) {
      return max;
    } else {
      return v;
    }
}

function rand(min, max) {
  if (min === undefined) min = 0;
  if (max === undefined) max = 1;
  return min + Math.random() * (max - min);
}




function napraviIgraca(container) {
  STANJE_IGRE.igracX = IGRA_SIRINA / 2;
  STANJE_IGRE.igracY = IGRA_VISINA - 50;
  const igrac = document.createElement("img");
  igrac.src = "slike/player-red-1.png";
  igrac.className = "igrac";
  container.appendChild(igrac);
  pozicija(igrac, STANJE_IGRE.igracX, STANJE_IGRE.igracY);
}

function unistiIgraca(container, igrac) {
  container.removeChild(igrac);
  STANJE_IGRE.krajIgre = true;
  const audio = new Audio("audio/loser.ogg");
  audio.play();
}

function updateIgrac(vr,container) {
    if (STANJE_IGRE.levaStr) {
      STANJE_IGRE.igracX -= vr * IGRAC_MAX_BRZINA;
    }
    if (STANJE_IGRE.desnaStr) {
      STANJE_IGRE.igracX += vr * IGRAC_MAX_BRZINA;
    }
    STANJE_IGRE.igracX = granica(STANJE_IGRE.igracX, IGRAC_SIRINA, IGRA_SIRINA - IGRAC_SIRINA);
    
    if (STANJE_IGRE.spacePr && STANJE_IGRE.igracCooldown <= 0) {
      napraviLaser(container, STANJE_IGRE.igracX, STANJE_IGRE.igracY);
      STANJE_IGRE.igracCooldown = LASER_COOLDOWN;
    }
    if (STANJE_IGRE.igracCooldown > 0) {
      STANJE_IGRE.igracCooldown -= vr;
    }
    const igrac = document.querySelector(".igrac");
    pozicija(igrac, STANJE_IGRE.igracX, STANJE_IGRE.igracY);
  }


  function napraviLaser(container, x, y) {
    const element = document.createElement("img");
    element.src = "slike/laser-red-5.png";
    element.className = "laser";
    container.appendChild(element);
    const laser = { x, y, element };
    STANJE_IGRE.laseri.push(laser);
    const audio = new Audio("audio/laser9.ogg");
    audio.play();
    pozicija(element, x, y);
  }

 
  function updateLaser(vr, container) {
    const laseri = STANJE_IGRE.laseri;
    for (let i = 0; i < laseri.length; i++) {
      const laser = laseri[i];
      laser.y -= vr * LASER_MAX_BRZINA;
      if (laser.y < 0) {
        unistiLaser(container, laser);
      }
      pozicija(laser.element, laser.x, laser.y);

      const r1 = laser.element.getBoundingClientRect();
      const neprijatelji = STANJE_IGRE.neprijatelji;
      for (let j = 0; j < neprijatelji.length; j++) {
        const neprijatelj = neprijatelji[j];
        if (neprijatelj.jeUnisten) continue;
        const r2 = neprijatelj.element.getBoundingClientRect();
        if (presecanje(r1, r2)) {
        unistiNeprijatelja(container, neprijatelj);
        unistiLaser(container, laser);
        break;
        }
      }
    }
    STANJE_IGRE.laseri = STANJE_IGRE.laseri.filter(e => !e.jeUnisten);
  }
  
  function unistiLaser(container, laser) {
    container.removeChild(laser.element);
    laser.jeUnisten = true;
  }

  function napraviNeprijatelja(container, x, y) {
    const element = document.createElement("img");
    element.src = "slike/plavo.png";
    element.className = "neprijatelj";
    container.appendChild(element);
    const neprijatelj = {x, y, cooldown: rand(0.5, NEPRIJATELJ_COOLDOWN),element};
    STANJE_IGRE.neprijatelji.push(neprijatelj);
    pozicija(element, x, y);
  }
  
  function updateNeprijatelj(vr, container) {
    const dx = Math.sin(STANJE_IGRE.vreme / 1000.0) * 50;
    const dy = Math.cos(STANJE_IGRE.vreme / 1000.0) * 10;
  
    const neprijatelji = STANJE_IGRE.neprijatelji;
    for (let i = 0; i < neprijatelji.length; i++) {
      const neprijatelj = neprijatelji[i];
      const x = neprijatelj.x + dx;
      const y = neprijatelj.y + dy;
      pozicija(neprijatelj.element, x, y);

      neprijatelj.cooldown -= vr;
      if (neprijatelj.cooldown <= 0) {
        napraviNLaser(container, x, y);
        neprijatelj.cooldown = NEPRIJATELJ_COOLDOWN;
      }
    }
    STANJE_IGRE.neprijatelji = STANJE_IGRE.neprijatelji.filter(e => !e.jeUnisten);
  }

  
  function unistiNeprijatelja(container, neprijatelj) {
    container.removeChild(neprijatelj.element);
    neprijatelj.jeUnisten = true;
    updatePoeni();
    
  }

  function napraviNLaser(container, x, y) {
    const element = document.createElement("img");
    element.src = "slike/laser-blue-7.png";
    element.className = "n-laser";
    container.appendChild(element);
    const laser = { x, y, element };
    STANJE_IGRE.neprijateljLaseri.push(laser);
    pozicija(element, x, y);
  }
  
  function updateNLaser(vr, container) {
    const laseri = STANJE_IGRE.neprijateljLaseri;
    for (let i = 0; i < laseri.length; i++) {
      const laser = laseri[i];
      laser.y += vr * LASER_MAX_BRZINA;
      if (laser.y > IGRA_VISINA) {
        unistiLaser(container, laser);
      }
      pozicija(laser.element, laser.x, laser.y);

      const r1 = laser.element.getBoundingClientRect();
      const igrac = document.querySelector(".igrac");
      const r2 = igrac.getBoundingClientRect();
      if (presecanje(r1, r2)) {
      unistiIgraca(container, igrac);
      break;
      }
    }
    STANJE_IGRE.neprijateljLaseri = STANJE_IGRE.neprijateljLaseri.filter(e => !e.jeUnisten);
  }

function inicijalizacija() {
  const container = document.querySelector(".igra");
  napraviIgraca(container);

  const razmak = (IGRA_SIRINA - NEPRIJATELJ_HORIZONTAL_PADDING * 2) / (NEPRIJATELJI_PO_REDU - 1);
  for (let j = 0; j < 3; j++) {
    const y = NEPRIJATELJ_VERTICAL_PADDING + j * NEPRIJATELJ_VERTICAL_SPACING;
    for (let i = 0; i < NEPRIJATELJI_PO_REDU; i++) {
      const x = i * razmak + NEPRIJATELJ_HORIZONTAL_PADDING;
      napraviNeprijatelja(container, x, y);
    }
  }
}

function pobeda() {
    return STANJE_IGRE.neprijatelji.length === 0;
  }

function updatePoeni(){
  poeni=poeni+100;
  var a=document.getElementById('abc');
  a.innerHTML=poeni;
}

function update(e) {
    const trenutnoVreme = Date.now();
    const vr = (trenutnoVreme - STANJE_IGRE.vreme) / 1000;

    if (STANJE_IGRE.krajIgre) {
      document.querySelector(".kraj-igre").style.display = "block";
      return;
    }
  
    if (pobeda()) {
      document.querySelector(".pobeda").style.display = "block";
      return;
    }

    const container = document.querySelector(".igra");
    updateIgrac(vr, container);
    updateLaser(vr, container);
    updateNeprijatelj(vr, container);
    updateNLaser(vr, container);

    STANJE_IGRE.vreme = trenutnoVreme;
    window.requestAnimationFrame(update);
  }

function onKeyDown(e) {
    if (e.keyCode === LEVA_STRELICA) {
      STANJE_IGRE.levaStr = true;
    } else if (e.keyCode === DESNA_STRELICA) {
      STANJE_IGRE.desnaStr = true;
    } else if (e.keyCode === SPACE) {
      STANJE_IGRE.spacePr= true;
    }
  }
  
  function onKeyUp(e) {
    if (e.keyCode === LEVA_STRELICA) {
      STANJE_IGRE.levaStr = false;
    } else if (e.keyCode === DESNA_STRELICA) {
      STANJE_IGRE.desnaStr = false;
    } else if (e.keyCode === SPACE) {
      STANJE_IGRE.spacePr = false;
    }
  }

inicijalizacija();
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup",onKeyUp);
window.requestAnimationFrame(update);