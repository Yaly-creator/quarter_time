// Gestion d'erreur globale pour éviter que le loader bloque la page
window.addEventListener('error', function(e) {
	console.error('Erreur JavaScript détectée:', e.error);
	// Forcer la suppression du loader en cas d'erreur
	const loader = document.getElementById('ftco-loader');
	if (loader && loader.classList.contains('show')) {
		console.warn('Suppression du loader suite à une erreur');
		loader.classList.remove('show');
	}
});

try {
	AOS.init({
		duration: 800,
		easing: 'slide'
	});
} catch (error) {
	console.error('Erreur AOS init:', error);
}

(function($) {

	"use strict";

	try {
		$(window).stellar({
			responsive: true,
			parallaxBackgrounds: true,
			parallaxElements: true,
			horizontalScrolling: false,
			hideDistantElements: false,
			scrollProperty: 'scroll'
		});
	} catch (error) {
		console.error('Erreur stellar init:', error);
	}


	var fullHeight = function() {
		// Désactiver fullHeight sur mobile pour permettre le scroll
		if ($(window).width() > 991) {
			$('.js-fullheight').css('height', $(window).height());
			$(window).resize(function(){
				if ($(window).width() > 991) {
					$('.js-fullheight').css('height', $(window).height());
				} else {
					// Sur mobile, retirer la hauteur forcée
					$('.js-fullheight').css('height', 'auto');
				}
			});
		}
	};
	fullHeight();

	// loader
	var loader = function() {
		setTimeout(function() { 
			if($('#ftco-loader').length > 0) {
				$('#ftco-loader').removeClass('show');
			}
		}, 1);
	};
	loader();
	
	// Fallback de sécurité : forcer la suppression du loader après 3 secondes max
	setTimeout(function() {
		if($('#ftco-loader').length > 0 && $('#ftco-loader').hasClass('show')) {
			console.warn('Loader fallback activé - suppression forcée du loader');
			$('#ftco-loader').removeClass('show');
		}
	}, 3000);

	// Scrollax
	try {
		$.Scrollax();
	} catch (error) {
		console.error('Erreur Scrollax init:', error);
	}

	var carousel = function() {
		try {
			$('.home-slider').owlCarousel({
				loop:true,
				autoplay: true,
				margin:0,
				animateOut: 'fadeOut',
				animateIn: 'fadeIn',
				nav:true,
				dots: false,
				autoplayHoverPause: false,
				items: 1,
				navText : ["<span class='ion-ios-arrow-back'></span>","<span class='ion-ios-arrow-forward'></span>"],
				responsive:{
					0:{
						items:1
					},
					600:{
						items:1
					},
					1000:{
						items:1
					}
				}
			});
		} catch (error) {
			console.error('Erreur home-slider carousel:', error);
		}
		
		try {
			$('.carousel-testimony').owlCarousel({
				center: true,
				loop: true,
				items:1,
				margin: 30,
				stagePadding: 0,
				nav: false,
				navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
				responsive:{
					0:{
						items: 1
					},
					600:{
						items: 2
					},
					1000:{
						items: 3
					}
				}
			});
		} catch (error) {
			console.error('Erreur carousel-testimony:', error);
		}
	};
	carousel();

	$('nav .dropdown').hover(function(){
		var $this = $(this);
		// 	 timer;
		// clearTimeout(timer);
		$this.addClass('show');
		$this.find('> a').attr('aria-expanded', true);
		// $this.find('.dropdown-menu').addClass('animated-fast fadeInUp show');
		$this.find('.dropdown-menu').addClass('show');
	}, function(){
		var $this = $(this);
			// timer;
		// timer = setTimeout(function(){
			$this.removeClass('show');
			$this.find('> a').attr('aria-expanded', false);
			// $this.find('.dropdown-menu').removeClass('animated-fast fadeInUp show');
			$this.find('.dropdown-menu').removeClass('show');
		// }, 100);
	});


	$('#dropdown04').on('show.bs.dropdown', function () {
	  console.log('show');
	});

	// scroll
	var scrollWindow = function() {
		$(window).scroll(function(){
			var $w = $(this),
					st = $w.scrollTop(),
					navbar = $('.ftco_navbar'),
					sd = $('.js-scroll-wrap');

			if (st > 150) {
				if ( !navbar.hasClass('scrolled') ) {
					navbar.addClass('scrolled');	
				}
			} 
			if (st < 150) {
				if ( navbar.hasClass('scrolled') ) {
					navbar.removeClass('scrolled sleep');
				}
			} 
			if ( st > 350 ) {
				if ( !navbar.hasClass('awake') ) {
					navbar.addClass('awake');	
				}
				
				if(sd.length > 0) {
					sd.addClass('sleep');
				}
			}
			if ( st < 350 ) {
				if ( navbar.hasClass('awake') ) {
					navbar.removeClass('awake');
					navbar.addClass('sleep');
				}
				if(sd.length > 0) {
					sd.removeClass('sleep');
				}
			}
		});
	};
	scrollWindow();

	
	var counter = function() {
		
		$('#section-counter').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('ftco-animated') ) {

				var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
				$('.number').each(function(){
					var $this = $(this),
						num = $this.data('number');
						console.log(num);
					$this.animateNumber(
					  {
					    number: num,
					    numberStep: comma_separator_number_step
					  }, 7000
					);
				});
				
			}

		} , { offset: '95%' } );

	}
	counter();

	var contentWayPoint = function() {
		var i = 0;
		$('.ftco-animate').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('ftco-animated') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .ftco-animate.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn ftco-animated');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft ftco-animated');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight ftco-animated');
							} else {
								el.addClass('fadeInUp ftco-animated');
							}
							el.removeClass('item-animate');
						},  k * 50, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '95%' } );
	};
	contentWayPoint();


	// navigation
	var OnePageNav = function() {
		$(".smoothscroll[href^='#'], #ftco-nav ul li a[href^='#']").on('click', function(e) {
		 	e.preventDefault();

		 	var hash = this.hash,
		 			navToggler = $('.navbar-toggler');
		 	$('html, body').animate({
		    scrollTop: $(hash).offset().top
		  }, 700, 'easeInOutExpo', function(){
		    window.location.hash = hash;
		  });


		  if ( navToggler.is(':visible') ) {
		  	navToggler.click();
		  }
		});
		$('body').on('activate.bs.scrollspy', function () {
		  console.log('nice');
		})
	};
	OnePageNav();


	// magnific popup
	$('.image-popup').magnificPopup({
    type: 'image',
    closeOnContentClick: true,
    closeBtnInside: false,
    fixedContentPos: true,
    mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
     gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      verticalFit: true
    },
    zoom: {
      enabled: true,
      duration: 300 // don't foget to change the duration also in CSS
    }
  });

  $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
    disableOn: 700,
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,

    fixedContentPos: false
  });


  // ====================================
	// VALIDATION DU CHAMP DATE
	// ====================================
	
	/**
	 * Initialise le champ date avec la date minimum (aujourd'hui)
	 * et ajoute la validation pour bloquer les dimanches
	 */
	function initializeDateField(dateInputId, errorMessageId) {
		const dateInput = document.getElementById(dateInputId);
		const errorMessage = document.getElementById(errorMessageId);
		
		if (!dateInput) return;
		
		// 1. Définir la date minimum à aujourd'hui
		const today = new Date();
		const todayString = formatDateToYYYYMMDD(today);
		dateInput.setAttribute('min', todayString);
		
		// 2. Valider la sélection de date (bloquer les dimanches)
		dateInput.addEventListener('change', function() {
			const selectedDate = new Date(this.value + 'T00:00:00');
			const dayOfWeek = selectedDate.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
			
			// Si c'est un dimanche (0)
			if (dayOfWeek === 0) {
				// Afficher le message d'erreur
				if (errorMessage) {
					errorMessage.textContent = '⚠️ Le restaurant est fermé le dimanche. Veuillez choisir une autre date.';
					errorMessage.style.display = 'block';
				}
				
				// Vider le champ
				this.value = '';
				
				// Ajouter une classe d'erreur visuelle
				this.classList.add('is-invalid');
				
				// Facultatif : afficher une alerte
				setTimeout(() => {
					alert('⚠️ Le restaurant est fermé le dimanche.\nVeuillez sélectionner une autre date.');
				}, 100);
			} else {
				// Masquer le message d'erreur si la date est valide
				if (errorMessage) {
					errorMessage.style.display = 'none';
				}
				this.classList.remove('is-invalid');
			}
		});
		
		// 3. Valider aussi lors de la saisie manuelle
		dateInput.addEventListener('blur', function() {
			if (this.value) {
				// Déclencher l'événement change pour valider
				this.dispatchEvent(new Event('change'));
			}
		});
	}
	
	/**
	 * Formate une date au format YYYY-MM-DD
	 */
	function formatDateToYYYYMMDD(date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
	
	// Initialiser le champ date pour la page d'accueil (si existe)
	if (document.getElementById('book_date')) {
		// Convertir en input type="date" si ce n'est pas déjà fait
		const bookDateIndex = document.getElementById('book_date');
		if (bookDateIndex && bookDateIndex.type !== 'date') {
			bookDateIndex.type = 'date';
		}
		initializeDateField('book_date', 'date-error-message-index');
	}
	
	// Initialiser le champ date pour la page de réservation
	if (document.getElementById('book_date_reservation')) {
		initializeDateField('book_date_reservation', 'date-error-message');
	}
	
	// Initialiser les timepickers
	try {
		$('#book_time').timepicker();
	} catch (error) {
		console.error('Erreur timepicker book_time:', error);
	}
	
	try {
		$('#book_time_reservation').timepicker();
	} catch (error) {
		console.error('Erreur timepicker book_time_reservation:', error);
	}




})(jQuery);

// ====================================
// SUPABASE RESERVATION SYSTEM
// ====================================

// Configuration Supabase
const SUPABASE_CONFIG = {
	url: 'https://ljbghtwstlwtqrwrzcat.supabase.co/functions/v1/create-reservation',
	anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYmdodHdzdGx3dHFyd3J6Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDYyOTcsImV4cCI6MjA4NTI4MjI5N30.ITL_iy5w2ppxvm2yMQaJ68gbBNm272wkK2wFc6m-k5M'
};

// Fonction pour formater la date au format YYYY-MM-DD
function formatDateForAPI(dateString) {
	// Si déjà au format YYYY-MM-DD (input type="date" natif), retourner tel quel
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
		return dateString;
	}
	
	// Sinon, dateString vient du datepicker au format m/d/yyyy (ancien format)
	const parts = dateString.split('/');
	if (parts.length === 3) {
		const month = parts[0].padStart(2, '0');
		const day = parts[1].padStart(2, '0');
		const year = parts[2];
		return `${year}-${month}-${day}`;
	}
	return dateString;
}

// Fonction pour formater l'heure au format HH:MM
function formatTimeForAPI(timeString) {
	// timeString vient du timepicker, peut être "7:30 PM" ou autre format
	// On va utiliser une approche simple pour parser
	const cleanTime = timeString.trim();
	
	// Si déjà au format HH:MM, on retourne tel quel
	if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
		const parts = cleanTime.split(':');
		const hours = parts[0].padStart(2, '0');
		return `${hours}:${parts[1]}`;
	}
	
	// Si format avec AM/PM
	const match = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
	if (match) {
		let hours = parseInt(match[1]);
		const minutes = match[2];
		const period = match[3].toUpperCase();
		
		if (period === 'PM' && hours !== 12) {
			hours += 12;
		} else if (period === 'AM' && hours === 12) {
			hours = 0;
		}
		
		return `${hours.toString().padStart(2, '0')}:${minutes}`;
	}
	
	return cleanTime;
}

// Fonction pour afficher un message
function showMessage(messageElementId, message, isSuccess) {
	const messageEl = document.getElementById(messageElementId);
	if (messageEl) {
		messageEl.textContent = message;
		messageEl.className = 'alert show ' + (isSuccess ? 'alert-success' : 'alert-danger');
		
		// Scroll vers le message doucement
		messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		
		// Auto-hide après 5 secondes pour les succès
		if (isSuccess) {
			setTimeout(() => {
				messageEl.textContent = '\u00A0'; // &nbsp;
				messageEl.className = 'alert mt-3';
			}, 5000);
		}
	}
}

// Fonction pour gérer l'état de chargement
function setLoadingState(formId, isLoading) {
	const form = document.getElementById(formId);
	if (!form) return;
	
	const submitBtn = form.querySelector('button[type="submit"]');
	const spinner = submitBtn.querySelector('.spinner-border');
	const submitText = submitBtn.querySelector('.submit-text');
	
	if (isLoading) {
		submitBtn.disabled = true;
		spinner.style.display = 'inline-block';
		submitText.textContent = 'Envoi en cours...';
	} else {
		submitBtn.disabled = false;
		spinner.style.display = 'none';
		submitText.textContent = submitBtn.id.includes('index') ? 'Réserver' : 'Faire une réservation';
	}
}

// Fonction principale pour soumettre la réservation
async function submitReservation(formData, formId, messageElementId) {
	try {
		setLoadingState(formId, true);
		
		console.log('📤 Envoi de la réservation:', formData);
		
		const response = await fetch(SUPABASE_CONFIG.url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
			},
			body: JSON.stringify(formData)
		});
		
		console.log('📥 Réponse reçue, status:', response.status);
		
		const result = await response.json();
		console.log('📥 Résultat:', result);
		
		if (response.ok && result.ok) {
			// Succès
			showMessage(messageElementId, '✅ Réservation confirmée ! Un email de confirmation vous a été envoyé.', true);
			
			// Réinitialiser le formulaire
			document.getElementById(formId).reset();
		} else {
			// Erreur de validation ou serveur
			const errorMessage = result.error || 'Une erreur est survenue. Veuillez réessayer.';
			console.error('❌ Erreur de réservation:', errorMessage);
			showMessage(messageElementId, '❌ ' + errorMessage, false);
		}
		
	} catch (error) {
		console.error('❌ Erreur réseau complète:', error);
		showMessage(messageElementId, '❌ Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.', false);
	} finally {
		setLoadingState(formId, false);
	}
}

// Handler pour le formulaire de la page index.html
const indexForm = document.getElementById('reservation-form-index');
if (indexForm) {
	indexForm.addEventListener('submit', async function(e) {
		e.preventDefault();
		
		const formData = {
			name: document.getElementById('name-index').value.trim(),
			email: document.getElementById('email-index').value.trim(),
			phone: document.getElementById('phone-index').value.trim(),
			date: formatDateForAPI(document.getElementById('book_date').value),
			time: formatTimeForAPI(document.getElementById('book_time').value),
			guests: parseInt(document.getElementById('guests-index').value),
			eventType: document.getElementById('event_type').value || 'standard',
			notes: document.getElementById('details').value.trim()
		};
		
		// Validation côté client
		if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time || !formData.guests) {
			showMessage('reservation-message-index', '❌ Veuillez remplir tous les champs obligatoires.', false);
			return;
		}
		
		await submitReservation(formData, 'reservation-form-index', 'reservation-message-index');
	});
}

// Handler pour le formulaire de la page reservation.html
const reservationForm = document.getElementById('reservation-form-reservation');
if (reservationForm) {
	reservationForm.addEventListener('submit', async function(e) {
		e.preventDefault();
		
		const formData = {
			name: document.getElementById('name-reservation').value.trim(),
			email: document.getElementById('email-reservation').value.trim(),
			phone: document.getElementById('phone-reservation').value.trim(),
			date: formatDateForAPI(document.getElementById('book_date_reservation').value),
			time: formatTimeForAPI(document.getElementById('book_time_reservation').value),
			guests: parseInt(document.getElementById('guests-reservation').value),
			eventType: document.getElementById('event_type_reservation').value || 'standard',
			notes: document.getElementById('details_reservation').value.trim()
		};
		
		// Validation côté client
		if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time || !formData.guests) {
			showMessage('reservation-message-reservation', '❌ Veuillez remplir tous les champs obligatoires.', false);
			return;
		}
		
		await submitReservation(formData, 'reservation-form-reservation', 'reservation-message-reservation');
	});
}

// ====================================
// CONTACT FORM SYSTEM
// ====================================

// Configuration pour le formulaire de contact
const CONTACT_CONFIG = {
	url: 'https://ljbghtwstlwtqrwrzcat.supabase.co/functions/v1/create-contact-message',
	anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYmdodHdzdGx3dHFyd3J6Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDYyOTcsImV4cCI6MjA4NTI4MjI5N30.ITL_iy5w2ppxvm2yMQaJ68gbBNm272wkK2wFc6m-k5M'
};

// Fonction pour afficher un message de contact
function showContactMessage(message, isSuccess) {
	const messageEl = document.getElementById('contact-message');
	if (messageEl) {
		messageEl.textContent = message;
		messageEl.className = 'alert mt-3 show ' + (isSuccess ? 'alert-success' : 'alert-danger');
		messageEl.style.display = 'block';
		
		// Scroll vers le message doucement
		messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		
		// Auto-hide après 5 secondes pour les succès
		if (isSuccess) {
			setTimeout(() => {
				messageEl.style.display = 'none';
				messageEl.textContent = '';
				messageEl.className = 'alert mt-3';
			}, 5000);
		}
	}
}

// Fonction pour gérer l'état de chargement du bouton de contact
function setContactLoadingState(isLoading) {
	const form = document.getElementById('contact-form');
	if (!form) return;
	
	const submitBtn = form.querySelector('button[type="submit"]');
	const spinner = submitBtn.querySelector('.spinner-border');
	const submitText = submitBtn.querySelector('.submit-text');
	
	if (isLoading) {
		submitBtn.disabled = true;
		spinner.style.display = 'inline-block';
		submitText.textContent = 'Envoi en cours...';
	} else {
		submitBtn.disabled = false;
		spinner.style.display = 'none';
		submitText.textContent = 'Envoyer le message';
	}
}

// Fonction principale pour soumettre le message de contact
async function submitContactForm(formData) {
	try {
		setContactLoadingState(true);
		
		console.log('📤 Envoi du message de contact:', formData);
		
		const response = await fetch(CONTACT_CONFIG.url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${CONTACT_CONFIG.anonKey}`
			},
			body: JSON.stringify(formData)
		});
		
		console.log('📥 Réponse reçue, status:', response.status);
		
		const result = await response.json();
		console.log('📥 Résultat:', result);
		
		if (response.ok && result.ok) {
			// Succès
			showContactMessage('✅ Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', true);
			
			// Réinitialiser le formulaire
			document.getElementById('contact-form').reset();
		} else {
			// Erreur de validation ou serveur
			const errorMessage = result.error || result.errors?.join(', ') || 'Une erreur est survenue. Veuillez réessayer.';
			console.error('❌ Erreur:', errorMessage);
			showContactMessage('❌ ' + errorMessage, false);
		}
		
	} catch (error) {
		console.error('❌ Erreur réseau complète:', error);
		showContactMessage('❌ Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.', false);
	} finally {
		setContactLoadingState(false);
	}
}

// Handler pour le formulaire de contact
const contactForm = document.getElementById('contact-form');
if (contactForm) {
	contactForm.addEventListener('submit', async function(e) {
		e.preventDefault();
		
		const formData = {
			name: document.getElementById('contact-name').value.trim(),
			email: document.getElementById('contact-email').value.trim(),
			subject: document.getElementById('contact-subject').value.trim(),
			message: document.getElementById('contact-message-text').value.trim()
		};
		
		// Validation côté client
		if (!formData.name || !formData.email || !formData.subject || !formData.message) {
			showContactMessage('❌ Veuillez remplir tous les champs obligatoires.', false);
			return;
		}
		
		// Validation email basique
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			showContactMessage('❌ Veuillez entrer une adresse email valide.', false);
			return;
		}
		
		// Validation longueur du message
		if (formData.message.length < 10) {
			showContactMessage('❌ Le message doit contenir au moins 10 caractères.', false);
			return;
		}
		
		await submitContactForm(formData);
	});
}
