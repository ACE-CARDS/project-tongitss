//https://www.letsbuildui.dev/articles/how-to-build-a-card-flip-animation/
"use client";

import { useState, useEffect, useRef } from "react"; 
import Link from "next/link"; 
import { createClient } from '@/lib/supabase/client';
import { BsSuitSpadeFill } from "react-icons/bs";

// Types for news media posts
interface NewsMedia {
  id: number;              
  title: string;           
  content: string;         
  image_url: string;      
  post_url: string;       
  fb_post_date: string;   
  created_at: string;    
}

// Main export
export default function NewsMedia() {
  const [newsPosts, setNewsPosts] = useState<NewsMedia[]>([]);
  const [loading, setLoading] = useState(true); 
  const scrollRef = useRef<HTMLDivElement>(null);
  // state for scroll buttons
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const [showSecondRow, setShowSecondRow] = useState(false); // Visibility of carousel

  // Flip animation states
  const [flippedLatestCards, setFlippedLatestCards] = useState<number[]>([]); 
  const [flippedCarouselCards, setFlippedCarouselCards] = useState<number[]>([]); 
  const [carouselHasFlipped, setCarouselHasFlipped] = useState(false);  
  const [firstRowAnimationComplete, setFirstRowAnimationComplete] = useState(false); 
  const [isCarouselVisible, setIsCarouselVisible] = useState(false); 
  const latestSectionRef = useRef<HTMLDivElement>(null);
  const carouselSectionRef = useRef<HTMLDivElement>(null); 
  
  // Timeout IDs
  const latestTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const carouselTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Data fetch
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('news_media')
          .select('*')
          .order('fb_post_date', { ascending: false });

        if (error) throw error;
        
        setNewsPosts(data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // ROW MANAGEMENT
  const latestPosts = newsPosts.slice(0, 3);
  const carouselPosts = newsPosts.slice(3);

  // Clear timeouts
  const clearTimeouts = (timeoutArray: NodeJS.Timeout[]) => {
    timeoutArray.forEach(timeout => clearTimeout(timeout)); 
  };

  // Flip when visible
  useEffect(() => {
    if (!latestSectionRef.current || latestPosts.length === 0) return; // No posts -> Exit

    const observer = new IntersectionObserver( 
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { // Visible
          // Flip
          const cardsToFlip = latestPosts.map((_, idx) => idx).filter(idx => !flippedLatestCards.includes(idx));
          
          cardsToFlip.forEach((idx) => {
            const timeout = setTimeout(() => {
              setFlippedLatestCards(prev => {
                if (prev.includes(idx)) return prev;
                return [...prev, idx];
              });
              if (idx === latestPosts.length - 1) {
                setTimeout(() => {
                  setFirstRowAnimationComplete(true);
                }, 500);
              }
            }, idx * 80);
            latestTimeoutsRef.current.push(timeout);
          });
        }
      });
    },
    { threshold: 0.2 }
  );

    observer.observe(latestSectionRef.current); 
    return () => {
      observer.disconnect(); 
      clearTimeouts(latestTimeoutsRef.current); 
    };
  }, [latestPosts, flippedLatestCards]); // Re-run 

  // Second row 
  useEffect(() => {
    if (latestPosts.length > 0 && !loading) { // If row 1 not loading
      const totalDelay = 400; // Delay 
      const timer = setTimeout(() => {
        setShowSecondRow(true); // Show 2nd row (carousel)
      }, totalDelay);
      return () => clearTimeout(timer); 
    } else if (latestPosts.length === 0) { // If no 1st row
      setShowSecondRow(true); // Show 2nd row 
      setFirstRowAnimationComplete(true); 
    }
  }, [latestPosts, loading]); // Re-run

  // Section visibility
  useEffect(() => {
    if (!showSecondRow || carouselPosts.length === 0) return; // Exit if no posts

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsCarouselVisible(entry.isIntersecting); 
        });
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (carouselSectionRef.current) {
      observer.observe(carouselSectionRef.current); 
    }

    return () => {
      observer.disconnect(); 
    };
  }, [showSecondRow, carouselPosts.length]); // Re-run

  const getVisibleCarouselIndices = () => {
    if (!scrollRef.current) return []; 
    
    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect(); 
    const visibleIndices: number[] = [];
    
    // Get carousel cards from DOM
    const cards = container.querySelectorAll('.carousel-card');
    
    cards.forEach((card, idx) => {
      if (idx >= carouselPosts.length) return;
      
      const cardRect = card.getBoundingClientRect();
      // Mow much card is visible
      const visibleWidth = Math.min(cardRect.right, containerRect.right) - Math.max(cardRect.left, containerRect.left);
      const totalWidth = cardRect.width;
      const visiblePercentage = visibleWidth / totalWidth; // % of visible
      
      // Visible if at least 30%
      if (visiblePercentage > 0.3) {
        visibleIndices.push(idx); 
      }
    });
    
    return visibleIndices; 
  };

  // Flip visible cards 
  const flipVisibleCarouselCards = () => {
    const visibleIndices = getVisibleCarouselIndices(); // Get current visible cards
    if (visibleIndices.length === 0) return; // Exit if none
    
    // Sort to flip (left to right)
    visibleIndices.sort((a, b) => a - b);
    
    clearTimeouts(carouselTimeoutsRef.current);
    carouselTimeoutsRef.current = [];
    
    // Flip sequentially
    visibleIndices.forEach((idx, order) => {
      const timeout = setTimeout(() => {
        setFlippedCarouselCards(prev => {
          if (prev.includes(idx)) return prev; 
          return [...prev, idx]; 
        });
      }, order * 100); // 100ms delay 
      carouselTimeoutsRef.current.push(timeout); 
    });
    
    setCarouselHasFlipped(true); // Mark as flipped
  };

  // Carousel posts flip
  useEffect(() => {
    if (!isCarouselVisible || !showSecondRow || carouselPosts.length === 0 || !firstRowAnimationComplete || carouselHasFlipped) return;

    // Delay for all cards to render
    const timer = setTimeout(() => {
      if (!carouselHasFlipped) { // Double-check before flipping
      flipVisibleCarouselCards(); // Flip
      }
    }, 100);

    return () => clearTimeout(timer); 
  }, [isCarouselVisible, showSecondRow, carouselPosts.length, firstRowAnimationComplete, carouselHasFlipped]); // Re-run

  // Scroll position changes 
  useEffect(() => {
    if (!scrollRef.current || !showSecondRow || !isCarouselVisible) return; // Exit if not met
    
    let scrollTimeout: NodeJS.Timeout; 
    let rafId: number; 
    
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId); // Cancel pending animation frame for "smooth handling" daw
      
      rafId = requestAnimationFrame(() => {
        clearTimeout(scrollTimeout); 
        
        updateButtonStates(); 
        
        scrollTimeout = setTimeout(() => {
          if (isCarouselVisible) { 
            const newVisibleIndices = getVisibleCarouselIndices(); 
            
            // Keep visible flipped cards
            setFlippedCarouselCards(prev => {
              // Find unflipped visible cards
              const newlyVisible = newVisibleIndices.filter(idx => !prev.includes(idx));
              
              if (newlyVisible.length > 0) {
                clearTimeouts(carouselTimeoutsRef.current);
                carouselTimeoutsRef.current = [];
                
                // Flip newly visible cards sequentially
                newlyVisible.sort((a, b) => a - b);
                newlyVisible.forEach((idx, order) => {
                  const timeout = setTimeout(() => {
                    setFlippedCarouselCards(current => {
                      if (current.includes(idx)) return current; // Skip if flipped
                      return [...current, idx]; // Add to flipped
                    });
                  }, order * 100); // 100ms delay 
                  carouselTimeoutsRef.current.push(timeout); 
                });
              }
              
              return prev;
            });
          }
        }, 150); // Wait 150ms
      });
    };
    
    const scrollElement = scrollRef.current;
    scrollElement.addEventListener('scroll', handleScroll, { passive: true }); 
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout); 
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeouts(carouselTimeoutsRef.current); 
    };
  }, [showSecondRow, carouselHasFlipped, isCarouselVisible]); // Re-run

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  // Scroll event listener
  const updateButtonStates = checkScrollPosition;

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && carouselPosts.length > 0 && showSecondRow && isCarouselVisible && firstRowAnimationComplete) {
      const check = () => {
        checkScrollPosition(); 
        if (!carouselHasFlipped && isCarouselVisible && firstRowAnimationComplete) {
          const visibleIndices = getVisibleCarouselIndices();
          const allVisibleFlipped = visibleIndices.every(idx => flippedCarouselCards.includes(idx));
          if (!allVisibleFlipped) {
            flipVisibleCarouselCards();
          }
        }
      };
      
      setTimeout(check, 150);
      window.addEventListener('resize', check); // Re-check
      
      return () => {
        window.removeEventListener('resize', check);
      };
    }
  }, [carouselPosts.length, showSecondRow, isCarouselVisible, firstRowAnimationComplete, carouselHasFlipped, flippedCarouselCards.length]); // Re-run when dependencies change

  // Horizontal scrolling for carousel
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current && isCarouselVisible) { 
      const container = scrollRef.current;
      const cardWidth = getCarouselCardWidth(); // Get card width
      const gap = getCarouselGap(); // Get card gap
      
      const scrollAmount = cardWidth + gap;
      
      const currentScroll = container.scrollLeft;
      let targetScroll = dir === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
      
      container.scrollTo({
        left: targetScroll, 
        behavior: 'smooth'
      });
      
      // After scroll, flip new visible cards
      const checkScrollComplete = setInterval(() => {
        if (container) {
          const isScrolling = Math.abs(container.scrollLeft - targetScroll) > 5;
          if (!isScrolling) { 
            clearInterval(checkScrollComplete); // Stop checking
            setTimeout(() => {
              if (isCarouselVisible && firstRowAnimationComplete) {
                const visibleIndices = getVisibleCarouselIndices();
              visibleIndices.forEach((idx, order) => {
                setFlippedCarouselCards(prev => {
                  if (prev.includes(idx)) return prev;
                  // Use timeout for sequential flipping
                  setTimeout(() => {
                    setFlippedCarouselCards(current => {
                      if (current.includes(idx)) return current;
                      return [...current, idx];
                    });
                  }, order * 100);
                  return prev;
                });
              });
            }
          }, 150);
        }
      }
    }, 50); // Check every 50ms
      
      setTimeout(() => clearInterval(checkScrollComplete), 1000);
    }
  };

  // Get current card width based on screen size
  const getCarouselCardWidth = () => {
    if (typeof window === 'undefined') return 320;
    
    const width = window.innerWidth;
    
    if (width <= 640) {
      return 280; // Mobile width
    } else if (width <= 767) {
      return 300; // Tablet-phones width
    } else {
      return 320; // Desktop width
    }
  };

  // Get current gap between cards
  const getCarouselGap = () => {
    if (typeof window === 'undefined') return 24;
    
    const width = window.innerWidth;
    
    if (width <= 767) {
      return 16; // gap-4 on mobile
    } else {
      return 24; // gap-6 on desktop
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div 
        className="w-full bg-[#fbfaf8] max-w-[1920px] min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
          backgroundSize: "20px 20px"
        }}
      >
        <div className="w-12 h-12 border-4 border-[#0d21a1] border-t-[#eec643] rounded-full animate-spin"></div> {/* Spinning loader */}
      </div>
    );
  }

  return (
    <div 
      className="w-full mx-auto bg-[#fbfaf8] max-w-[1920px] pt-12 px-4 md:px-8 lg:px-16 relative overflow-x-hidden"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px",
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Evenly Distributed Spades */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top Row */}
        <BsSuitSpadeFill className="absolute top-[2%] left-[5%] rotate-12 size-20 md:size-37 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[5%] left-[25%] -rotate-12 size-16 md:size-24 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[8%] left-[75%] -rotate-15 size-18 md:size-28 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[1%] left-[92%] rotate-20 size-22 md:size-34 text-[#0d21a1]/10" />

        {/* Middle-Left Area */}
        <BsSuitSpadeFill className="absolute top-[60%] left-[1%] rotate-15 size-32 md:size-52 text-[#0d21a1]/10" />

        {/* Middle-Right Area */}
        <BsSuitSpadeFill className="absolute top-[40%] right-[3%] rotate-10 size-30 md:size-55 text-[#0d21a1]/10" />
        <BsSuitSpadeFill className="absolute top-[86%] right-[4%] rotate-18 size-20 md:size-40 text-[#0d21a1]/10" />

        {/* Center Area */}
        <BsSuitSpadeFill className="absolute top-[47%] left-[59%] -rotate-30 size-15 md:size-30 text-[#0d21a1]/10" />
                
        {/* Between Posts Areas */}
        <BsSuitSpadeFill className="absolute top-[45%] left-[20%] rotate-35 size-20 md:size-45 text-[#0d21a1]/10" />
      </div>
      
      {/* Heading */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-5xl text-[#eec643]">♠</span>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#011638] to-[#0d21a1] bg-clip-text text-transparent tracking-tight">
            NEWS & MEDIA
          </h1>
          <span className="text-5xl text-[#eec643]">♠</span>
        </div>

        <div className="w-40 h-1 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mx-auto rounded-full mt-3" />

        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Stay updated with the latest announcements and activities from ACE CARDS.
        </p>
      </div>

      {/* 1st ROW: Latest Posts */}
      {latestPosts.length > 0 && (
        <div ref={latestSectionRef} className="mb-12 relative z-10">
          <div className="news-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post, idx) => (
              <div 
                key={post.id} 
                className="perspective-container h-[400px]"
              >
                <FlippableNewsCard 
                  post={post} 
                  isFlipped={flippedLatestCards.includes(idx)}
                  index={idx}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2nd ROW: Carousel Section/Additional Posts */}
      {showSecondRow && carouselPosts.length > 0 && (
        <div ref={carouselSectionRef} className="relative z-10">
          {/* Sub heading */}
          <div className="flex items-center justify-center gap-3 mb-6 z-10">
            <span className="text-4xl text-[#eec643]">♠</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#011638]">More Updates</h2>
            <span className="text-4xl text-[#eec643]">♠</span>
          </div>

          {/* Carousel Container */}
          <div className="relative px-4 sm:px-8 md:px-11 py-2">
            {/* Left Scroll Button */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 shadow-md transition-all duration-300 ${
                canScrollLeft 
                  ? 'bg-[#011638] hover:bg-[#0d21a1] hover:shadow-lg cursor-pointer opacity-100' 
                  : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '36px',
                minHeight: '36px'
              }}
              aria-label="Scroll left"
            >
              <svg className={`w-5 h-5 ${canScrollLeft ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Scroll Button */}
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 shadow-md transition-all duration-300 ${
                canScrollRight 
                  ? 'bg-[#011638] hover:bg-[#0d21a1] hover:shadow-lg cursor-pointer opacity-100' 
                  : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '36px',
                minHeight: '36px'
              }}
              aria-label="Scroll right"
            >
              <svg className={`w-5 h-5 ${canScrollRight ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Cards Container */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto overflow-y-visible gap-6 pb-5 hide-scrollbar snap-x snap-mandatory"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: 'x mandatory'
              }}
            >
              {carouselPosts.map((post, idx) => (
                <div key={post.id} className="flex-none py-2 perspective-container h-[400px] carousel-card snap-start"
                  style={{
                    width: 'clamp(260px, calc(100vw - 80px), 320px)',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <FlippableNewsCard 
                    post={post} 
                    isFlipped={flippedCarouselCards.includes(idx)}
                    index={idx + latestPosts.length}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* CSS */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .perspective-container {
          perspective: 1000px;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.15;
          }
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      
      
      /* If on table, mobile, or minimized screen -> center */
      @media (max-width: 767px) {
        .news-grid {
          justify-items: center;
        }
        .news-grid > div {
          max-width: 350px;
          width: 100%;
          height: 320px;
        }
      }
      
      @media (min-width: 768px) and (max-width: 1023px) {
        .news-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.5rem;
        }
        
        /* Targeting third card (span then center) */
        .news-grid > div:last-child:nth-child(3) {
          grid-column: span 2;
          max-width: 400px;
          width: 100%;
          justify-self: center;
        }
      }

      .news-grid > div {
        height: 380px;
      }

      .flex.overflow-x-auto {
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
        scroll-behavior: smooth;
      }

      .carousel-card {
        scroll-snap-align: start;
        scroll-snap-stop: always;
      }

      /* Adjust for different screen sizes */
      @media (max-width: 640px) {
        .carousel-card {
          scroll-snap-align: start !important;
          scroll-snap-stop: always;
        }
      }
      
      button[aria-label="Scroll left"],
      button[aria-label="Scroll right"] {
        box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        z-index: 30 !important;
        transition: all 0.3s ease;
      }

      button[aria-label="Scroll left"]:hover:not(:disabled),
      button[aria-label="Scroll right"]:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
      }
    }

      @media (max-width: 640px) {
      .carousel-card {
        width: calc(100vw - 80px) !important;
        min-width: 260px;
        scroll-snap-align: center;
      }
    }

      @media (min-width: 641px) and (max-width: 767px) {
        .carousel-card {
          width: 300px !important;
        }
      }

      @media (min-width: 768px) {
        .carousel-card {
          width: 320px !important;
        }
      }

      }
      `}</style>
    </div>
  );
}

// Indiv card with flip
function FlippableNewsCard({ 
  post, 
  isFlipped,
  index
}: { 
  post: NewsMedia;
  isFlipped: boolean;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    setIsCardFlipped(isFlipped);
  }, [isFlipped]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="flip-card-wrapper"
      style={{ 
        animation: `cardFloat 0.3s ease-out ${Math.min(index * 0.05, 0.3)}s both` // Fade-in
      }}
    >
      <div 
        className={`flip-card ${isCardFlipped ? 'flipped' : ''}`}
        style={{ 
          transition: `transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)`
        }}
      >
        {/* Back of card */}
        <div className="flip-card-back">
          <div 
            className="rounded-lg overflow-hidden bg-gradient-to-br from-[#011638] to-[#0d21a1] flex flex-col items-center justify-center h-full shadow-md relative w-full text-center p-6"
            style={{ 
              backgroundImage: "url('/assets/logos/card-bg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-[#011638]/50 rounded-lg" />
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              <img
                src="/assets/logos/ACE CARDS logo.png"
                alt="ACE CARDS Logo"
                className="w-32 h-32 object-contain mx-auto mb-5"
              />
              
              <h3 className="text-white font-bold text-xl mb-0 text-center">
                ACE CARDS
              </h3>
              
              <p className="text-[#eec643] text-sm font-semibold text-center">
                Latest Update
              </p>
            </div>
          </div>
        </div>

        {/* Front of card */}
        <div className="flip-card-front">
          <Link href={post.post_url} target="_blank" rel="noopener noreferrer" className="block h-full">
            <div className="rounded-lg overflow-hidden transition-all duration-300 bg-white flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-md relative">
              {/* Image section */}
              <div className="h-48 rounded-t-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
                {(!post.image_url || imgError) ? ( 
                  <div className="w-full h-full flex items-center justify-center bg-[#011638]">
                    <img
                      src="/assets/logos/ACE CARDS logo.png"
                      alt="ACE CARDS Logo"
                      className="w-24 h-24 object-contain opacity-80"
                    />
                  </div>
                ) : (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    onError={() => setImgError(true)} 
                  />
                )}
                {/* Date badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#0d21a1] shadow-lg">
                    {formatDate(post.fb_post_date)}
                  </span>
                </div>
              </div>

              {/* Separator */}
              <div className="relative w-full px-2">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-[#011638]/80 to-transparent shadow-sm"></div>
              </div>

              {/* Content section */}
              <div className="p-4 flex-1 flex flex-col overflow-hidden">
                <h3 className="font-bold text-lg text-[#011638] mb-2 line-clamp-2 hover:text-[#0d21a1] transition-colors text-left min-h-[56px]">
                  {post.title}
                </h3>

                {post.content && (
                  <p className="text-gray-600 text-sm mb-0 line-clamp-2 text-left">
                    {post.content}
                  </p>
                )}

                {/* Read more link */}
                <div className="mt-auto flex items-center text-[#eec643] font-medium text-sm group pt-0">
                  <span>Read more</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* CSS for 3D flip */}
      <style jsx>{`
        .flip-card-wrapper {
          width: 100%;
          height: 100%;
          perspective: 1000px; /* 3D perspective parent */
        }
        
        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1); /* Smooth flip transition */
          transform-style: preserve-3d; /* Preserve 3D transformations */
          cursor: pointer; /* Show pointer cursor on hover */
        }
        
        .flip-card.flipped {
          transform: rotateY(180deg); /* Rotate card 180 degrees on Y axis */
        }
        
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden; /* Hide back face when facing away */
          -webkit-backface-visibility: hidden; /* Safari support */
          border-radius: 0.5rem;
        }
        
        .flip-card-front {
          transform: rotateY(180deg); /* Front face is rotated - shows when flipped */
        }
        
        .flip-card-back {
          transform: rotateY(0deg); /* Back face is at default rotation */
        }
        
        @keyframes cardFloat {
          0% {
            opacity: 0;
            transform: translateY(20px); /* Start below */
          }
          100% {
            opacity: 1;
            transform: translateY(0); /* End at normal position */
          }
        }
      `}</style>
    </div>
  );
}