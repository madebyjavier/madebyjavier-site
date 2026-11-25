/* ============================================================
   made by Javier — site script
   Loaded by every page. Each block exits quietly if the page
   does not contain the elements it looks after.
   ============================================================ */

/* ---- accent full stops: every "." that ends a sentence in a title turns accent.
   Runs on every heading, so new titles follow the rule without extra markup.
   Skips decimals (2.5) and anything already inside <i>. ---- */
window.accentDots=function(root){
  var sel='h1,h2,h3,.proj-punch strong,.quote';
  var els=root&&root.matches&&root.matches(sel)?[root]:(root||document).querySelectorAll(sel);
  Array.prototype.forEach.call(els,function(el){
    var walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),nodes=[],n;
    while((n=walk.nextNode()))nodes.push(n);
    nodes.forEach(function(t){
      if(t.parentNode.closest('i,.pd'))return;
      var txt=t.nodeValue;
      if(!/\.(?!\d)/.test(txt))return;
      var frag=document.createDocumentFragment(),parts=txt.split(/(\.(?!\d))/);
      parts.forEach(function(part){
        if(part==='.'){var i=document.createElement('i');i.className='pd';i.textContent='.';frag.appendChild(i)}
        else if(part)frag.appendChild(document.createTextNode(part));
      });
      t.parentNode.replaceChild(frag,t);
    });
  });
};
accentDots();

/* ---- vimeo embeds: <figure data-vimeo="ID"> or "ID/hash"; empty = removed ----
   Click to play: the cover image (and Vimeo's own thumbnail behind it) shows in
   full until someone presses play. Only then does the iframe load, so a vertical
   video's letterbox bars never flash on page load. ---- */
(function(){
  var figs=document.querySelectorAll('[data-vimeo]');
  if(!figs.length)return;
  figs.forEach(function(fig){
    var parts=(fig.getAttribute('data-vimeo')||'').trim().split('/');
    if(!/^\d+$/.test(parts[0])){fig.remove();return}
    var src='https://player.vimeo.com/video/'+parts[0]+'?dnt=1&title=0&byline=0&portrait=0&autoplay=1'
      +(parts[1]?'&h='+encodeURIComponent(parts[1]):'');
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='play-btn';
    btn.setAttribute('aria-label','Play video');
    btn.innerHTML='<span></span>';
    function play(){
      var f=document.createElement('iframe');
      f.src=src;
      f.title=document.title.split(/ [—·] /)[0]+' · video';
      f.allow='autoplay; fullscreen; picture-in-picture';
      f.setAttribute('allowfullscreen','');
      fig.insertBefore(f,fig.firstChild);
      btn.remove();
    }
    btn.addEventListener('click',play);
    fig.appendChild(btn);
  });
})();

/* ---- reveal on scroll ---- */
(function(){
  var els=document.querySelectorAll('.rv');
  if(!els.length)return;
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en,i){
      if(en.isIntersecting){
        en.target.style.transitionDelay=(i*60)+'ms';
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e)});
})();

/* ---- fluid scroll: eases the wheel instead of jumping line by line ----
   desktop pointers only; native scrolling stays untouched on touch and
   for anyone who asked for reduced motion.                              */
(function(){
  if(!window.matchMedia)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!matchMedia('(pointer:fine)').matches)return;

  var doc=document.documentElement,
      target=window.scrollY,current=target,raf=null,EASE=.115;

  doc.style.scrollBehavior='auto';           // our loop owns the animation now

  function limit(){return Math.max(0,doc.scrollHeight-window.innerHeight)}
  function clamp(v){return Math.max(0,Math.min(limit(),v))}

  function loop(){
    current+=(target-current)*EASE;
    if(Math.abs(target-current)<.5){
      current=target;window.scrollTo(0,current);raf=null;return;
    }
    window.scrollTo(0,current);
    raf=requestAnimationFrame(loop);
  }
  function run(){if(!raf)raf=requestAnimationFrame(loop)}

  window.addEventListener('wheel',function(e){
    if(e.ctrlKey)return;                     // leave pinch-zoom alone
    var d=e.deltaY*(e.deltaMode===1?24:e.deltaMode===2?window.innerHeight:1);
    e.preventDefault();
    target=clamp(target+d);
    run();
  },{passive:false});

  // resync when something else moves the page: scrollbar, keyboard, anchors
  window.addEventListener('scroll',function(){
    if(!raf){target=current=window.scrollY}
  },{passive:true});
  window.addEventListener('resize',function(){target=current=clamp(window.scrollY)});
})();

/* ---- loops: <video data-loop muted loop playsinline poster="…"> ----
   Plays only while on screen, so a page full of loops costs one or two decoders.
   Reduced motion: the poster stays, nothing plays. ---- */
(function(){
  var vids=document.querySelectorAll('video[data-loop]');
  if(!vids.length)return;
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  vids.forEach(function(v){v.muted=true;v.setAttribute('muted','');v.removeAttribute('autoplay')});
  if(still)return;
  if(!('IntersectionObserver' in window)){vids.forEach(function(v){v.play().catch(function(){})});return}
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var v=en.target;
      if(en.isIntersecting){
        if(v.preload!=='auto'){v.preload='auto'}
        var p=v.play();if(p&&p.catch)p.catch(function(){});
      }else{v.pause()}
    });
  },{threshold:.25});
  vids.forEach(function(v){io.observe(v)});
})();

/* ---- home filters: <button data-filter="motion"> shows cards whose data-cat contains it ---- */
(function(){
  var bar=document.querySelector('.filters');
  if(!bar)return;
  var btns=bar.querySelectorAll('button[data-filter]'),
      cards=document.querySelectorAll('[data-cat]'),
      loops=document.getElementById('loops');
  function apply(f){
    btns.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.filter===f?'true':'false')});
    cards.forEach(function(c){
      var cats=c.dataset.cat.split(' ');
      c.classList.toggle('is-hidden',!(f==='all'||cats.indexOf(f)>-1));
    });
    if(loops)loops.classList.toggle('is-hidden',!(f==='all'||f==='loops'));
    var grid=document.querySelector('.wgrid');
    if(grid)grid.classList.toggle('is-hidden',f==='loops');
  }
  btns.forEach(function(b){
    b.addEventListener('click',function(){
      apply(b.dataset.filter);
      var top=document.getElementById('work');
      if(top&&top.getBoundingClientRect().top<0)top.scrollIntoView({behavior:'smooth'});
    });
  });
  var h=(location.hash||'').replace('#','');
  apply(['motion','art','loops'].indexOf(h)>-1?h:'all');
})();

/* ---- tool mixer ---- */
(function(){
  var box=document.getElementById('mix');
  if(!box)return;

  var NAME={ae:'After Effects',ai:'Illustrator',ps:'Photoshop',pr:'Premiere',
            fg:'Figma'};

  /* Keys are tool ids sorted alphabetically (ae ai fg pr ps).
     Full coverage: 5 singles + 10 pairs + 10 triples = every possible selection. */
  var COMBOS={
  /* --- singles --- */
  'ae':['Motion, on its own','Logo builds, explainers, loops. Add <span class="mix-add">Illustrator</span> and the logo builds itself on screen.'],
  'ai':['Vector and identity','Marks, type and layout systems. Add <span class="mix-add">After Effects</span> and the mark starts to move.'],
  'ps':['Image work','Retouching, composites, key visuals. Add <span class="mix-add">Premiere</span> and the footage matches the stills.'],
  'pr':['Editing','Cuts, grades, versions. Add <span class="mix-add">After Effects</span> for every ratio your placements need.'],
  'fg':['Interface design','Components, systems, real screens. Add <span class="mix-add">After Effects</span> and the screens come alive.'],

  /* --- pairs --- */
  'ae+ai':['A logo that builds itself on screen','A static mark goes in; three seconds of brand comes out.'],
  'ae+fg':['Motion agreed before a frame is rendered','Prototype the movement in the design file, so revisions cost minutes instead of renders.'],
  'ae+pr':['Campaign cutdowns in every ratio your placements need','One shoot, one motion system, every format, with no redesign per platform.'],
  'ae+ps':['Composited motion built from stills','Photography that moves, for when a shoot is not in the budget.'],
  'ai+fg':['One identity, applied consistently','Built as a design system, in the file your team already works in.'],
  'ai+pr':['Titles and graphics that belong to the film','Type, lower thirds and end cards cut from the same identity as everything else.'],
  'ai+ps':['A brand kit that survives contact with real content','Marks, type and colour, plus the rules that keep it intact once someone else opens the file.'],
  'fg+pr':['Product footage that matches the product','Screens cut from the real interface, so the video never shows a version that does not exist.'],
  'fg+ps':['Mockups that look like photographs','Interface placed in real scenes: the slide where people forget it is still a prototype.'],
  'pr+ps':['Footage that matches the brand it belongs to','Grade, cleanup and cut. One colour space, two tabs, nobody gets hurt.'],

  /* --- triples --- */
  'ae+ai+fg':['A brand that behaves the same everywhere','Mark, design system and motion rules shipped as one kit.'],
  'ae+ai+pr':['A full campaign cut from one identity','Titles, motion and edit built from the same rules, not assembled from parts.'],
  'ae+ai+ps':['A launch kit, start to finish','Mark, key visual, and the animation that introduces it.'],
  'ae+fg+pr':['Product demos that stay honest','Cut from the real interface, with motion that clarifies instead of hiding.'],
  'ae+fg+ps':['Pitch material that looks shipped','Interface, imagery and motion that make an idea feel like a product.'],
  'ae+pr+ps':['The full post-production bench','Grade, cut and animate as one job. Three Adobe apps, one deadline, no subcontractors.'],
  'ai+fg+pr':['Brand and product on the same screen','Identity, interface, and the video that puts them in front of people.'],
  'ai+fg+ps':['Identity ready for every surface','Vector, interface and imagery drawn from one set of rules.'],
  'ai+pr+ps':['Campaign material shot and finished in-house','Identity, imagery and edit kept under one set of rules.'],
  'fg+pr+ps':['A product story told in stills and motion','Interface, photography and edit built to the same rules.']
  };

  var sel=[],
      T=document.getElementById('mixTitle'),
      D=document.getElementById('mixDesc'),
      C=document.getElementById('mixCta');
  var key=function(a){return a.slice().sort().join('+')};
  var strip=function(s){return s.replace(/<[^>]*>/g,'')};

  function paint(title,desc,empty){
    [T,D,C].forEach(function(el){el.style.animation='none'});
    void T.offsetWidth;
    T.innerHTML=title;D.innerHTML=desc;
    accentDots(T);
    [T,D,C].forEach(function(el){el.style.animation=''});
    box.classList.toggle('mix-empty',!!empty);

    if(!empty){
      var tools=sel.map(function(t){return NAME[t]}).join(' + ');
      C.href='mailto:info@madebyjavier.com'
        +'?subject='+encodeURIComponent(strip(title))
        +'&body='+encodeURIComponent(
          'Hi Javier,\n\nI came from your site and put together '+tools+'.\n\n'
          +'Here is what I am trying to do:\n\n');
    }
  }

  function render(){
    if(!sel.length){
      paint('Pick two tools above.',
        'Most jobs here are a combination, not a single tool.',true);
      return;
    }
    var c=COMBOS[key(sel)];
    if(c){paint(c[0],c[1]);return}

    // every 1-, 2- and 3-tool selection is in the map; this only fires if one is ever removed
    paint('That one still needs a partner.',
      'Try <span class="mix-add">Illustrator</span> or <span class="mix-add">After Effects</span>. Those combine with everything here.');
  }

  document.querySelectorAll('.tag[data-t]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var t=btn.dataset.t,i=sel.indexOf(t);
      if(i>-1){sel.splice(i,1)}
      else{sel.push(t);if(sel.length>3){var drop=sel.shift();
        document.querySelector('.tag[data-t="'+drop+'"]').classList.remove('on')}}
      btn.classList.toggle('on',sel.indexOf(t)>-1);
      render();
    });
  });

  // start with a combination already on, so it reads as interactive
  sel=['ae','ai'];
  sel.forEach(function(t){
    var b=document.querySelector('.tag[data-t="'+t+'"]');
    if(b)b.classList.add('on');
  });
  render();
})();

/* ---- lightbox: click an image in .gal.shots / .zoom to see it full size ---- */
(function(){
  var imgs=document.querySelectorAll('.gal.shots img, .zoom img');
  if(!imgs.length)return;
  var box=null;
  function close(){
    if(!box)return;
    var b=box;box=null;
    b.classList.remove('open');
    setTimeout(function(){b.remove()},250);
    document.removeEventListener('keydown',onKey);
  }
  function onKey(e){if(e.key==='Escape')close()}
  function open(img){
    box=document.createElement('div');
    box.className='lightbox';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-label','Enlarged screenshot');
    box.innerHTML='<button type="button" aria-label="Close">×</button>';
    var big=document.createElement('img');
    big.src=img.currentSrc||img.src;
    big.alt=img.alt;
    box.appendChild(big);
    box.addEventListener('click',close);
    box.addEventListener('wheel',close,{passive:true});
    document.addEventListener('keydown',onKey);
    document.body.appendChild(box);
    requestAnimationFrame(function(){box&&box.classList.add('open')});
    box.querySelector('button').focus();
  }
  imgs.forEach(function(img){
    img.tabIndex=0;
    img.addEventListener('click',function(){open(img)});
    img.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(img)}});
  });
})();
