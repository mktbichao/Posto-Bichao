/**
 * Posto Bichão - Interatividade e Funcionalidades
 * Desenvolvido com Vanilla JS (Zero dependências externas)
 */

(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  

  /* ==========================================================================
     2. Animações de Scroll (IntersectionObserver) & Contadores Numéricos
     ========================================================================== */
  var animTargets = [
    '.sv > div:first-child h2',
    '.sv-item',
    '.sv-media',
    '.jr-m',
    '.jr-t > *',
    '.ps-top > *',
    '.tabs',
    '.spec > div',
    '.ps-cta',
    '.gl-header > *',
    '.gl-viewer',
    '.lc-g h2',
    '.lc dl > div',
    '.lc-act',
    '.rv-g > *',
    '.sc-g > div:first-child > *',
    '.posts a',
    '.ft-col'
  ];

  var revealElements = [];
  animTargets.forEach(function (selector) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.setAttribute('data-r', '');
      el.style.setProperty('--i', Math.min(i, 5));
      revealElements.push(el);
    }
  });

  function animateCounter(el) {
    var target = +el.dataset.to;
    var decimals = +el.dataset.dec || 0;
    var suffix = el.dataset.suf || '';

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      return;
    }

    // Inicializa explicitamente em ZERO
    el.textContent = (0).toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + suffix;

    var startTime = null;
    var duration = 1600; // 1.6s para uma rolagem dinâmica e nítida

    function frame(now) {
      if (!startTime) startTime = now;
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);

      // Easing out quart: rolagem rápida inicial e desaceleração suave
      var ease = 1 - Math.pow(1 - progress, 4);
      var current = target * ease;

      el.textContent = current.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        // Garante o valor final exato
        el.textContent = target.toLocaleString('pt-BR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }) + suffix;
      }
    }

    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var target = entry.target;
        revealObserver.unobserve(target);
        target.classList.add('in');

        var counters = target.querySelectorAll('[data-to]');
        for (var c = 0; c < counters.length; c++) {
          animateCounter(counters[c]);
        }
        if (target.dataset && target.dataset.to) {
          animateCounter(target);
        }

        setTimeout(function () {
          target.removeAttribute('data-r');
          target.style.removeProperty('--i');
        }, 1600);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });

    // Fallback de segurança para garantir que nada fique invisível se o observer demorar
    setTimeout(function () {
      revealElements.forEach(function (el) {
        if (!el.classList.contains('in')) {
          el.classList.add('in');
        }
      });
    }, 3500);
  } else {
    // Navegadores legados
    revealElements.forEach(function (el) {
      el.classList.add('in');
    });
  }

  /* ==========================================================================
     3. Header Sticky & Barra Flutuante Mobile
     ========================================================================== */
  var header = document.querySelector('.hd');
  var mobileBar = document.querySelector('.bar');
  var parallaxBg = document.getElementById('px');
  var heroSection = document.querySelector('.hero');
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset || 0;
    var heroHeight = heroSection ? heroSection.offsetHeight : 600;

    if (header) {
      header.classList.toggle('sk', y > 24);
    }
    if (mobileBar) {
      mobileBar.classList.toggle('show', y > heroHeight * 0.55);
    }
    if (!prefersReducedMotion && parallaxBg && y < heroHeight + 150) {
      parallaxBg.style.transform = 'translate3d(0, ' + (y * 0.07).toFixed(1) + 'px, 0)';
    }
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ==========================================================================
     4. Menu Mobile (Sheet Fullscreen)
     ========================================================================== */
  var menuBtn = document.getElementById('mb');
  var menuSheet = document.getElementById('sheet');

  function toggleMenu(open) {
    if (!menuBtn || !menuSheet) return;
    root.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');

    if (open) {
      menuSheet.removeAttribute('inert');
      document.body.style.overflow = 'hidden';
    } else {
      menuSheet.setAttribute('inert', '');
      document.body.style.overflow = '';
    }
  }

  if (menuBtn && menuSheet) {
    var sheetNavLinks = menuSheet.querySelectorAll('nav a');
    for (var s = 0; s < sheetNavLinks.length; s++) {
      sheetNavLinks[s].style.setProperty('--i', s);
    }

    menuBtn.addEventListener('click', function () {
      var isCurrentlyOpen = root.classList.contains('menu-open');
      toggleMenu(!isCurrentlyOpen);
    });

    var allSheetLinks = menuSheet.querySelectorAll('a');
    for (var l = 0; l < allSheetLinks.length; l++) {
      allSheetLinks[l].addEventListener('click', function () {
        toggleMenu(false);
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) {
        toggleMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ==========================================================================
     5. ScrollSpy da Navegação
     ========================================================================== */
  var topNavLinks = document.querySelectorAll('.top nav a');
  var sectionIds = ['servicos', 'pitstop', 'encontros', 'localizacao'];
  var sectionElements = [];

  sectionIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sectionElements.push(el);
  });

  if ('IntersectionObserver' in window && sectionElements.length > 0) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var targetId = entry.target.id;
          for (var i = 0; i < topNavLinks.length; i++) {
            var href = topNavLinks[i].getAttribute('href');
            topNavLinks[i].classList.toggle('cur', href === '#' + targetId);
          }
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sectionElements.forEach(function (sec) {
      spyObserver.observe(sec);
    });
  }

  /* ==========================================================================
     6. Acordeão de Serviços e Troca de Imagem
     ========================================================================== */
  var serviceItems = document.querySelectorAll('.sv-item');
  var serviceImages = document.querySelectorAll('#svMedia img');

  for (var si = 0; si < serviceItems.length; si++) {
    (function (index) {
      var btn = serviceItems[index].querySelector('button');
      if (!btn) return;

      btn.addEventListener('click', function () {
        for (var j = 0; j < serviceItems.length; j++) {
          var isMatch = index === j;
          serviceItems[j].classList.toggle('on', isMatch);
          var b = serviceItems[j].querySelector('button');
          if (b) b.setAttribute('aria-expanded', isMatch ? 'true' : 'false');
        }

        for (var m = 0; m < serviceImages.length; m++) {
          serviceImages[m].classList.toggle('on', index === m);
        }
      });
    })(si);
  }

  /* ==========================================================================
     7. Pit Stop (Seleção por Veículo) - Atualizado com Dados & Layout da Referência
     ========================================================================== */
  var vehicleData = [
    // 0: Carro
    {
      v2: "5 a 10",
      v2unit: "minutos",
      v0: "Gasolina ou Etanol Ipimax",
      v0sub: "aditivados de alta performance",
      v1: "Café expresso e pão de queijo quentinho",
      v3: "Calibrador digital de pneus gratuito"
    },
    // 1: SUV
    {
      v2: "10 a 15",
      v2unit: "minutos",
      v0: "Gasolina Ipimax ou Diesel S10",
      v0sub: "máximo rendimento na viagem",
      v1: "Lanches, bebidas geladas e banheiros amplos",
      v3: "Sanitários com higienização contínua"
    },
    // 2: Moto
    {
      v2: "5",
      v2unit: "minutos",
      v0: "Gasolina Ipimax",
      v0sub: "queima limpa e resposta rápida",
      v1: "Café rápido e bebidas geladas para viagem",
      v3: "Calibrador digital de pneus gratuito"
    },
    // 3: Caminhão
    {
      v2: "20 a 40",
      v2unit: "minutos",
      v0: "Diesel S10 Ipimax",
      v0sub: "de alto rendimento",
      v1: "Salgados assados e refeição rápida",
      v3: "Pátio amplo, iluminado com LED e câmeras 24h"
    }
  ];

  var vehicleTabs = document.querySelectorAll('#vt button');
  var vehicleImages = document.querySelectorAll('.ps-m img');
  var specContainer = document.getElementById('spec');

  // Precarrega as imagens dos veículos para transição imediata ao clicar nas abas
  for (var pi = 0; pi < vehicleImages.length; pi++) {
    var preloadImg = new Image();
    preloadImg.src = vehicleImages[pi].src;
  }

  for (var ti = 0; ti < vehicleTabs.length; ti++) {
    (function (tabIdx) {
      vehicleTabs[tabIdx].addEventListener('click', function () {
        for (var j = 0; j < vehicleTabs.length; j++) {
          var isSelected = tabIdx === j;
          vehicleTabs[j].classList.toggle('on', isSelected);
          vehicleTabs[j].setAttribute('aria-selected', isSelected ? 'true' : 'false');
        }

        for (var vi = 0; vi < vehicleImages.length; vi++) {
          vehicleImages[vi].classList.toggle('on', tabIdx === vi);
        }

        if (specContainer) {
          specContainer.classList.add('sw');
          setTimeout(function () {
            var data = vehicleData[tabIdx];
            var v2El = document.getElementById('v2');
            var v2uEl = document.getElementById('v2unit');
            var v0El = document.getElementById('v0');
            var v0sEl = document.getElementById('v0sub');
            var v1El = document.getElementById('v1');
            var v3El = document.getElementById('v3');
            
            if (v2El) v2El.textContent = data.v2;
            if (v2uEl) v2uEl.textContent = data.v2unit;
            if (v0El) v0El.textContent = data.v0;
            if (v0sEl) {
              v0sEl.textContent = data.v0sub;
              v0sEl.style.display = data.v0sub ? 'block' : 'none';
            }
            if (v1El) v1El.textContent = data.v1;
            if (v3El) v3El.textContent = data.v3;

            specContainer.classList.remove('sw');
          }, prefersReducedMotion ? 0 : 180);
        }
      });
    })(ti);
  }

  /* ==========================================================================
     8. Galeria de Fotos Interativa (Encontros no Bichão)
     Fiel à referência com Foto Principal, Carrossel de 20 Miniaturas e Setas
     ========================================================================== */
  var galleryPhotos = [
    { file: "foto-01.webp", title: "Pista Principal & Abastecimento Pesado" },
    { file: "foto-02.webp", title: "Entrada da Conveniência & Mural de Adesivos" },
    { file: "foto-03.webp", title: "Box Jet Oil Especializado" },
    { file: "foto-04.webp", title: "Encontros de Carros & Amigos" },
    { file: "foto-05.webp", title: "Noite Iluminada no Bichão" },
    { file: "foto-06.webp", title: "Ambiente Aconchegante da Conveniência" },
    { file: "foto-07.webp", title: "Espaço dos Amigos & Confraternização" },
    { file: "foto-08.webp", title: "Visitas Especiais & Clientes Fiéis" },
    { file: "foto-09.webp", title: "Atendimento de Confiança na Pista" },
    { file: "foto-10.webp", title: "Ações Sociais & Comunidade" },
    { file: "foto-11.webp", title: "Café Fresco & Salgados Quentinhos" },
    { file: "foto-12.webp", title: "Linha Completa de Combustíveis Ipimax" },
    { file: "foto-13.webp", title: "Fachada & Vista Geral do Complexo" },
    { file: "foto-14.webp", title: "Encontro de Estradeiros no Pátio" },
    { file: "foto-15.webp", title: "Café & Bate-Papo Matinal" },
    { file: "foto-16.webp", title: "Reunião de Motociclistas & Clubes" },
    { file: "foto-17.webp", title: "Pátio Espaçoso para Manobras" },
    { file: "foto-18.webp", title: "Calibragem Digital & Manutenção Rápida" },
    { file: "foto-19.webp", title: "Produtos & Acessórios Automotivos" },
    { file: "foto-20.webp", title: "Gôndolas & Variedade na Conveniência" }
  ];

  var mainImg = document.getElementById('glMainImg');
  var counterEl = document.getElementById('glCounter');
  var titleEl = document.getElementById('glTitle');
  var thumbsTrack = document.getElementById('glThumbsTrack');
  var thumbs = document.querySelectorAll('.gl-thumb');
  var prevBtn = document.getElementById('glPrev');
  var nextBtn = document.getElementById('glNext');
  var mainWrapper = document.getElementById('glMainWrapper');

  var currentGalleryIdx = 8; // Começa na foto 09 (atendente simpático com polegar para cima, como na referência)

  function padNumber(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function setGalleryPhoto(newIndex) {
    if (!galleryPhotos.length || !mainImg) return;
    currentGalleryIdx = (newIndex + galleryPhotos.length) % galleryPhotos.length;
    var photo = galleryPhotos[currentGalleryIdx];

    // Transição suave da foto principal
    mainImg.classList.add('fade');
    setTimeout(function () {
      mainImg.src = 'assets/images/gallery/' + photo.file;
      mainImg.alt = photo.title + ' - Posto Bichão';
      mainImg.classList.remove('fade');
    }, 120);

    if (counterEl) {
      counterEl.textContent = padNumber(currentGalleryIdx + 1) + ' / ' + padNumber(galleryPhotos.length);
    }
    if (titleEl) {
      titleEl.textContent = photo.title;
    }

    // Atualiza estado visual das miniaturas
    for (var i = 0; i < thumbs.length; i++) {
      var isCur = i === currentGalleryIdx;
      thumbs[i].classList.toggle('on', isCur);
      thumbs[i].setAttribute('aria-selected', isCur ? 'true' : 'false');
    }

    // Rola a miniatura ativa para o centro do carrossel suavemente
    var activeThumb = thumbs[currentGalleryIdx];
    if (activeThumb && thumbsTrack) {
      var targetScroll = activeThumb.offsetLeft - (thumbsTrack.offsetWidth / 2) + (activeThumb.offsetWidth / 2);
      thumbsTrack.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }

  // Cliques nas miniaturas
  for (var t = 0; t < thumbs.length; t++) {
    (function (idx) {
      thumbs[idx].addEventListener('click', function () {
        setGalleryPhoto(idx);
      });
    })(t);
  }

  // Setas anterior / próxima
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      setGalleryPhoto(currentGalleryIdx - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      setGalleryPhoto(currentGalleryIdx + 1);
    });
  }

  // Navegação por teclado nas setas (quando focado na galeria)
  var gallerySection = document.getElementById('encontros');
  if (gallerySection) {
    gallerySection.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        setGalleryPhoto(currentGalleryIdx - 1);
      } else if (e.key === 'ArrowRight') {
        setGalleryPhoto(currentGalleryIdx + 1);
      }
    });
  }

  // Suporte a gestos touch swipe na foto principal
  if (mainWrapper) {
    var gTouchStartX = 0;
    var gTouchEndX = 0;

    mainWrapper.addEventListener('touchstart', function (e) {
      gTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    mainWrapper.addEventListener('touchend', function (e) {
      gTouchEndX = e.changedTouches[0].screenX;
      var swipeDiff = gTouchEndX - gTouchStartX;
      if (swipeDiff < -40) {
        // Deslizou para esquerda -> Próxima foto
        setGalleryPhoto(currentGalleryIdx + 1);
      } else if (swipeDiff > 40) {
        // Deslizou para direita -> Foto anterior
        setGalleryPhoto(currentGalleryIdx - 1);
      }
    }, { passive: true });
  }

  // Centraliza a miniatura inicial ao carregar
  setTimeout(function () {
    if (thumbs[currentGalleryIdx] && thumbsTrack) {
      var targetScroll = thumbs[currentGalleryIdx].offsetLeft - (thumbsTrack.offsetWidth / 2) + (thumbs[currentGalleryIdx].offsetWidth / 2);
      thumbsTrack.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, 400);

  /* ==========================================================================
     9. Copiar Endereço (Resiliente e com Feedback Acessível)
     ========================================================================== */
  var copyBtn = document.getElementById('copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var fullAddress = 'R. Roberto Romanelli, 843, Jardim Riviera, Cambé – PR, CEP 86187-015';

      function onSuccess() {
        copyBtn.textContent = 'Endereço copiado!';
        copyBtn.classList.add('ok');
        copyBtn.setAttribute('aria-label', 'Endereço copiado para a área de transferência');
        setTimeout(function () {
          copyBtn.textContent = 'Copiar endereço';
          copyBtn.classList.remove('ok');
          copyBtn.removeAttribute('aria-label');
        }, 2400);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullAddress)
          .then(onSuccess)
          .catch(function () {
            fallbackCopy(fullAddress, onSuccess);
          });
      } else {
        fallbackCopy(fullAddress, onSuccess);
      }
    });
  }

  function fallbackCopy(text, callback) {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      var successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful && callback) callback();
    } catch (err) {
      console.warn('Não foi possível copiar o endereço automaticamente.', err);
    }
  }

})();
