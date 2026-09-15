/* ============================================================
   made by Javier — site script
   Loaded by every page. Each block exits quietly if the page
   does not contain the elements it looks after.
   ============================================================ */

/* ---- vimeo embeds: <figure data-vimeo="ID"> or "ID/hash"; empty = removed ---- */
(function(){
  var figs=document.querySelectorAll('[data-vimeo]');
  if(!figs.length)return;
  figs.forEach(function(fig){
    var parts=(fig.getAttribute('data-vimeo')||'').trim().split('/');
    if(!/^\d+$/.test(parts[0])){fig.remove();return}
    var src='https://player.vimeo.com/video/'+parts[0]+'?dnt=1&title=0&byline=0&portrait=0'+(parts[1]?'&h='+encodeURIComponent(parts[1]):'');
    var f=document.createElement('iframe');
    f.src=src;
    f.loading='lazy';
    f.title=document.title.split(' — ')[0]+' — full film';
    f.allow='autoplay; fullscreen; picture-in-picture';
    f.setAttribute('allowfullscreen','');
    fig.insertBefore(f,fig.firstChild);
  });
})();

/* ---- lottie loops: <figure data-lottie="path.json"><div class="lottie-box"></div></figure>
   Library loads only on pages that use it. A file that fails removes its figure;
   when none are left, the whole section goes. ---- */
(function(){
  var figs=document.querySelectorAll('[data-lottie]');
  if(!figs.length)return;
  var section=figs[0].closest('section');
  function drop(fig){
    fig.remove();
    if(section&&!section.querySelector('[data-lottie]'))section.remove();
  }
  var still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js';
  s.onerror=function(){figs.forEach(drop)};
  s.onload=function(){
    figs.forEach(function(fig){
      var path=(fig.getAttribute('data-lottie')||'').trim();
      if(!path){drop(fig);return}
      var anim=window.lottie.loadAnimation({
        container:fig.querySelector('.lottie-box')||fig,
        renderer:'svg',loop:true,autoplay:!still,path:path
      });
      anim.addEventListener('data_failed',function(){anim.destroy();drop(fig)});
      if(still)anim.addEventListener('DOMLoaded',function(){anim.goToAndStop(Math.floor(anim.totalFrames/2),true)});
    });
  };
  document.head.appendChild(s);
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

/* ---- home cards: image morphs into the task/action/outcome list ---- */
(function(){
  var faces=document.querySelectorAll('.case-face');
  if(!faces.length)return;
  faces.forEach(function(face){
    face.addEventListener('click',function(){
      var card=face.closest('.case'),open=card.classList.toggle('open');
      face.setAttribute('aria-expanded',open?'true':'false');
      face.querySelector('.case-hint').firstChild.nodeValue=open?'Close ':'Read it ';
    });
  });
})();

/* ---- tool mixer ---- */
(function(){
  var box=document.getElementById('mix');
  if(!box)return;

  var NAME={ae:'After Effects',ai:'Illustrator',ps:'Photoshop',pr:'Premiere',
            fg:'Figma',n8:'n8n',wb:'Web design',ll:'LLM APIs'};

  /* Keys are tool ids sorted alphabetically (ae ai fg ll n8 pr ps wb).
     Full coverage: 8 singles + 28 pairs + 56 triples = every possible selection. */
  var COMBOS={
  /* --- singles --- */
  'ae':['Motion, on its own','Logo builds, explainers, loops. Add <span class="mix-add">n8n</span> and it explains the automation running behind it.'],
  'ai':['Vector and identity','Marks, type and layout systems. Add <span class="mix-add">Web design</span> to take it straight to a live page.'],
  'ps':['Image work','Retouching, composites, key visuals. Add <span class="mix-add">Premiere</span> and the footage matches the stills.'],
  'pr':['Editing','Cuts, grades, versions. Add <span class="mix-add">After Effects</span> for every ratio your placements need.'],
  'fg':['Interface design','Components, systems, real screens. Add <span class="mix-add">Web design</span> and it ships instead of staying a mockup.'],
  'n8':['Automation','Self-hosted tools that take the repetitive half. Add <span class="mix-add">LLM APIs</span> and they draft as well as fetch.'],
  'wb':['Web design','Sites built to convert, not just to look right. Add <span class="mix-add">n8n</span> and the follow-up runs itself.'],
  'll':['LLM APIs','Language and judgement inside the tool. Add <span class="mix-add">n8n</span> and it runs without you.'],

  /* --- pairs --- */
  'ae+ai':['A logo that builds itself on screen','A static mark goes in; three seconds of brand comes out.'],
  'ae+fg':['Motion agreed before a frame is rendered','Prototype the movement in the design file, so revisions cost minutes instead of renders.'],
  'ae+ll':['Bulk video variants without the bulk work','One motion system, copy per audience, renders queued. You approve; the fan does the rest.'],
  'ae+n8':['An explainer for the thing you just automated','Nobody adopts a workflow they cannot picture. Forty seconds of motion beats the ten-page manual nobody opened.'],
  'ae+pr':['Campaign cutdowns in every ratio your placements need','One shoot, one motion system, every format — no redesign per platform.'],
  'ae+ps':['Composited motion built from stills','Photography that moves, for when a shoot is not in the budget.'],
  'ae+wb':['A landing page that moves when it should','Motion used to explain the product, not to decorate the scroll.'],
  'ai+fg':['One identity, applied consistently','Built as a design system, in the file your team already works in.'],
  'ai+ll':['Naming and identity explored at speed','Forty directions before lunch. Thirty-nine get deleted — that is the exercise.'],
  'ai+n8':['Brand assets generated on request','Certificates, badges, social cards — one template filled automatically, always on-brand.'],
  'ai+pr':['Titles and graphics that belong to the film','Type, lower thirds and end cards cut from the same identity as everything else.'],
  'ai+ps':['A brand kit that survives contact with real content','Marks, type and colour, plus the rules that keep it intact once someone else opens the file.'],
  'ai+wb':['Identity straight into a live page','Nothing lost between the logo file and the thing people actually land on.'],
  'fg+ll':['Interfaces written as carefully as they are drawn','Copy, empty states and error text designed in, not filled in at the end.'],
  'fg+n8':['A design system fed by real data','Components that update from the source instead of being retyped every quarter.'],
  'fg+pr':['Product footage that matches the product','Screens cut from the real interface, so the video never shows a version that does not exist.'],
  'fg+ps':['Mockups that look like photographs','Interface placed in real scenes — the slide where people forget it is still a prototype.'],
  'fg+wb':['A site designed in the browser, not guessed in a mockup','What you approve is what ships — at every screen size, not just the one in the deck.'],
  'll+n8':['A pipeline that drafts, then asks you to approve','It types, you decide. The judgement is the part worth paying a person for.'],
  'll+pr':['Subtitles, cutdowns and versions in three languages','Transcription and translation done before the edit, not after it.'],
  'll+ps':['Image work at volume','Hundreds of variants described once. The machine does not get bored at number forty.'],
  'll+wb':['A site that answers instead of listing','Visitors ask what they actually came to ask, and get a real answer on the page.'],
  'n8+pr':['Video delivery that files itself','Exports renamed, resized, uploaded and logged the moment the render finishes.'],
  'n8+ps':['Asset production without the asset grind','One master, every crop generated. Nobody should resize the same banner eleven times.'],
  'n8+wb':['A site with the repetitive half handed off','Pages people read; automations doing the following up.'],
  'pr+ps':['Footage that matches the brand it belongs to','Grade, cleanup and cut. One colour space, two tabs, nobody gets hurt.'],
  'pr+wb':['Video that earns its place on the page','Cut for the scroll, weighted so it never costs you the load time.'],
  'ps+wb':['Imagery weighted for the web','Art direction that still loads on a phone with two bars of signal.'],

  /* --- triples --- */
  'ae+ai+fg':['A brand that behaves the same everywhere','Mark, design system and motion rules shipped as one kit.'],
  'ae+ai+ll':['Campaign concepts drawn, written and moving','Blank page to animated route without waiting on three suppliers.'],
  'ae+ai+n8':['Branded video, produced on repeat','One motion template, filled and exported automatically for every product or market.'],
  'ae+ai+pr':['A full campaign cut from one identity','Titles, motion and edit built from the same rules, not assembled from parts.'],
  'ae+ai+ps':['A launch kit, start to finish','Mark, key visual, and the animation that introduces it.'],
  'ae+ai+wb':['A launch page with the brand moving on it','Identity, motion and build handled by one person, so nothing drifts.'],
  'ae+fg+ll':['Product interfaces that explain themselves','Designed, written and animated so onboarding does not need a call.'],
  'ae+fg+n8':['A product story that updates with the product','Real screens in, fresh demo video out, no rebuild per release.'],
  'ae+fg+pr':['Product demos that stay honest','Cut from the real interface, with motion that clarifies instead of hiding.'],
  'ae+fg+ps':['Pitch material that looks shipped','Interface, imagery and motion that make an idea feel like a product.'],
  'ae+fg+wb':['A site that demonstrates instead of describing','Designed in-browser, with motion carrying the explanation.'],
  'ae+ll+n8':['Video made per audience, not per week','Copy generated, motion templated, renders queued and delivered.'],
  'ae+ll+pr':['Multilingual video without the multilingual cost','One edit, translated, subtitled and re-versioned in a single pass.'],
  'ae+ll+ps':['Visual variants at campaign scale','Stills, copy and motion produced together for every placement.'],
  'ae+ll+wb':['A page that teaches, in every language you sell in','Motion for the explanation, AI for the versions, one build underneath.'],
  'ae+n8+pr':['A video pipeline that runs itself','Edit once, then let versions, exports and delivery happen without you.'],
  'ae+n8+ps':['Creative output at volume, still on-brand','Templates plus automation instead of a folder of one-off files.'],
  'ae+n8+wb':['A site that shows the automation working','The tool runs behind it; the motion on the page explains what it just did.'],
  'ae+pr+ps':['The full post-production bench','Grade, cut and animate as one job. Three Adobe apps, one deadline, no subcontractors.'],
  'ae+pr+wb':['Video-led pages that do not drag','Cut, compressed and placed so motion sells instead of stalling.'],
  'ae+ps+wb':['A page built on one strong visual idea','Imagery, motion and layout decided together, not stacked afterwards.'],
  'ai+fg+ll':['A product identity with its language included','Marks, components and the words inside them, decided at the same time.'],
  'ai+fg+n8':['A design system that maintains itself','Tokens and assets regenerated from one source when the brand shifts.'],
  'ai+fg+pr':['Brand and product on the same screen','Identity, interface, and the video that puts them in front of people.'],
  'ai+fg+ps':['Identity ready for every surface','Vector, interface and imagery drawn from one set of rules.'],
  'ai+fg+wb':['Brand, interface and site as one delivery','Design system straight through to the live page.'],
  'ai+ll+n8':['On-brand content produced on demand','The template is yours; the words and assets fill themselves in.'],
  'ai+ll+pr':['Editorial video with a consistent voice','Written, titled and cut so every episode sounds like the same brand.'],
  'ai+ll+ps':['Visual campaigns written and drawn together','Concepts, copy and key visuals produced in the same pass.'],
  'ai+ll+wb':['A site that sounds like the brand it looks like','Identity and copy built together, not handed between two suppliers.'],
  'ai+n8+pr':['Branded video output on a schedule','Templates, automated versioning and delivery for recurring content.'],
  'ai+n8+ps':['Every asset, every size, automatically','One approved design becomes the full export set without manual work.'],
  'ai+n8+wb':['A modern site with the busywork wired out of it','Identity, build, and the forms, follow-ups and reports running quietly behind it.'],
  'ai+pr+ps':['Campaign material shot and finished in-house','Identity, imagery and edit kept under one set of rules.'],
  'ai+pr+wb':['A brand launch with the film on the page','Identity, video and site delivered together.'],
  'ai+ps+wb':['A site with real art direction','Brand, imagery and layout decided as one, not sourced from stock.'],
  'fg+ll+n8':['Internal tools people actually use','Designed properly, worded clearly, doing the work in the background.'],
  'fg+ll+pr':['Product video that matches the product language','The same terms on screen as in the interface.'],
  'fg+ll+ps':['Product marketing, drawn and written','Screens, imagery and copy produced as one piece.'],
  'fg+ll+wb':['A site built around what people ask','Structure, copy and answers designed together.'],
  'fg+n8+pr':['Demo video that regenerates per release','Real screens, automated assembly, current every time.'],
  'fg+n8+ps':['A living asset library','Designed once, produced automatically, always the current version.'],
  'fg+n8+wb':['A site that works like a product','Designed as a system, with the operations wired in.'],
  'fg+pr+ps':['A product story told in stills and motion','Interface, photography and edit built to the same rules.'],
  'fg+pr+wb':['Product pages carried by video','Real screens, cut short, placed where the question comes up.'],
  'fg+ps+wb':['Interface work that survives real content','Designed with actual images and actual text, not placeholders.'],
  'll+n8+pr':['A content engine for video','Scripts drafted, versions cut, delivery handled — you approve, it ships.'],
  'll+n8+ps':['Creative production without the repetition','Written, generated and exported in one run.'],
  'll+n8+wb':['A site that captures, qualifies and replies on its own','The lead arrives, gets enriched and answered before you open your laptop.'],
  'll+pr+ps':['Post-production with the paperwork removed','Transcripts, versions and stills handled alongside the edit.'],
  'll+pr+wb':['Video content published without a bottleneck','Cut, captioned, written up and on the page the same day.'],
  'll+ps+wb':['A page that stays fresh without a rewrite','Copy and imagery produced to a system, updated as the offer moves.'],
  'n8+pr+ps':['Delivery handled end to end','Grade, cut, export, rename, upload. The half of the job nobody puts on a showreel.'],
  'n8+pr+wb':['Video on the site, updated without you','New cut lands, page updates, nothing to remember.'],
  'n8+ps+wb':['A site whose assets keep themselves current','Imagery generated and swapped as the catalogue changes.'],
  'pr+ps+wb':['A site carried by real footage and real images','Shot, finished and placed so it loads fast and still looks like you — not like a stock library.']
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
    [T,D,C].forEach(function(el){el.style.animation=''});
    box.classList.toggle('mix-empty',!!empty);

    if(!empty){
      var tools=sel.map(function(t){return NAME[t]}).join(' + ');
      C.href='mailto:info@madebyjavier.com'
        +'?subject='+encodeURIComponent(strip(title))
        +'&body='+encodeURIComponent(
          'Hi Javier,\n\nI came from your site — I put together '+tools+'.\n\n'
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
      'Try <span class="mix-add">n8n</span> or <span class="mix-add">After Effects</span> — those combine with everything here.');
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
  sel=['ae','n8'];
  sel.forEach(function(t){
    var b=document.querySelector('.tag[data-t="'+t+'"]');
    if(b)b.classList.add('on');
  });
  render();
})();

/* ---- lightbox: click a screenshot in .gal.shots to see it full size ---- */
(function(){
  var imgs=document.querySelectorAll('.gal.shots img');
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
